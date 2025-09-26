import { useState, useEffect } from 'react';
import { getCourseTeachers, getCourseStudents, getGoogleAccessToken } from '../services/googleApi';
import { getStudentEmail, getStudentName } from '../utils/studentUtils';

const ParticipantsView = ({ courseId, courseName }) => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'teachers'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (courseId) {
      loadParticipants();
    }
  }, [courseId]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = getGoogleAccessToken();

      const [teachersData, studentsData] = await Promise.all([
        getCourseTeachers(courseId, accessToken),
        getCourseStudents(courseId, accessToken)
      ]);

      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading participants:', error);
      setError('Error al cargar los participantes del curso');
    } finally {
      setLoading(false);
    }
  };

  const getParticipantEmail = (participant) => {
    return participant.profile?.emailAddress || 
           participant.emailAddress || 
           participant.profile?.name?.fullName || 
           `participant-${participant.userId}`;
  };

  const getParticipantName = (participant) => {
    return participant.profile?.name?.fullName || 
           participant.profile?.emailAddress || 
           participant.emailAddress || 
           'Nombre no disponible';
  };

  const filterParticipants = (participants) => {
    if (!searchTerm) return participants;
    
    return participants.filter(participant => {
      const name = getParticipantName(participant).toLowerCase();
      const email = getParticipantEmail(participant).toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || 
             email.includes(searchTerm.toLowerCase());
    });
  };

  const ParticipantCard = ({ participant, role }) => {
    const name = getParticipantName(participant);
    const email = getParticipantEmail(participant);
    const photoUrl = participant.profile?.photoUrl;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {name}
              </p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                role === 'teacher' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {role === 'teacher' ? 'Profesor' : 'Estudiante'}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {email}
            </p>
            {participant.profile?.id && participant.profile.id !== email && (
              <p className="text-xs text-gray-500 truncate">
                ID: {participant.profile.id}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0">
            <button
              onClick={() => window.open(`mailto:${email}`, '_blank')}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Enviar email"
              disabled={!email.includes('@')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Cargando participantes...</span>
      </div>
    );
  }

  const filteredStudents = filterParticipants(students);
  const filteredTeachers = filterParticipants(teachers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Participantes - {courseName}
          </h3>
          <p className="text-sm text-gray-600">
            {teachers.length} profesores • {students.length} estudiantes
          </p>
        </div>
        
        <button
          onClick={loadParticipants}
          className="btn-secondary flex items-center space-x-2"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Actualizar</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Estudiantes ({filteredStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'teachers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profesores ({filteredTeachers.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'students' && (
          <>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Este curso aún no tiene estudiantes inscritos'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <ParticipantCard
                    key={student.userId}
                    participant={student}
                    role="student"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'teachers' && (
          <>
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">👨‍🏫</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No se encontraron profesores' : 'No hay profesores'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Este curso aún no tiene profesores asignados'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map((teacher) => (
                  <ParticipantCard
                    key={teacher.userId}
                    participant={teacher}
                    role="teacher"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-sm text-gray-600">Total Estudiantes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{teachers.length}</div>
            <div className="text-sm text-gray-600">Total Profesores</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{students.length + teachers.length}</div>
            <div className="text-sm text-gray-600">Total Participantes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {searchTerm ? filteredStudents.length + filteredTeachers.length : students.length + teachers.length}
            </div>
            <div className="text-sm text-gray-600">
              {searchTerm ? 'Resultados Filtrados' : 'Participantes Activos'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsView;
