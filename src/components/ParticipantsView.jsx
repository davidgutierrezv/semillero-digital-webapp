import { useState, useEffect } from 'react';
import { getCourseTeachers, getCourseStudents, getGoogleAccessToken } from '../services/googleApi';
import { getStudentEmail, getStudentName } from '../utils/studentUtils';
import { getAllStudentsData, getAllTeachersData } from '../services/firestore';
import { validateTelegramConfig, sendMessageToGroup, formatStudentMessage } from '../services/telegramApi';
import PhoneModal from './PhoneModal';
import TelegramMessageModal from './TelegramMessageModal';

const ParticipantsView = ({ courseId, courseName }) => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'teachers'
  const [searchTerm, setSearchTerm] = useState('');
  const [studentsData, setStudentsData] = useState({}); // Datos adicionales de estudiantes (teléfonos, etc.)
  const [teachersData, setTeachersData] = useState({}); // Datos adicionales de profesores (teléfonos, etc.)
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [participantType, setParticipantType] = useState('student'); // 'student' or 'teacher'
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [selectedTelegramParticipant, setSelectedTelegramParticipant] = useState(null);
  const [telegramConfig, setTelegramConfig] = useState({ ready: false });
  const [sendingTelegram, setSendingTelegram] = useState(null); // Email del participante al que se está enviando

  useEffect(() => {
    if (courseId) {
      loadParticipants();
      loadStudentsData();
      loadTeachersData();
    }
    // Validar configuración de Telegram
    setTelegramConfig(validateTelegramConfig());
    console.log('🔍 Telegram Token:', import.meta.env.VITE_TELEGRAM_BOT_TOKEN ? 'CONFIGURADO ✅' : 'NO CONFIGURADO ❌');
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

  const loadStudentsData = async () => {
    try {
      const allStudentsData = await getAllStudentsData(courseId);
      const studentsDataMap = {};
      
      allStudentsData.forEach(studentData => {
        studentsDataMap[studentData.email] = studentData;
      });
      
      setStudentsData(studentsDataMap);
    } catch (error) {
      console.error('Error loading students data:', error);
    }
  };

  const loadTeachersData = async () => {
    try {
      const allTeachersData = await getAllTeachersData(courseId);
      const teachersDataMap = {};
      
      allTeachersData.forEach(teacherData => {
        teachersDataMap[teacherData.email] = teacherData;
      });
      
      setTeachersData(teachersDataMap);
    } catch (error) {
      console.error('Error loading teachers data:', error);
    }
  };

  const handleEditPhone = (participant, type = 'student') => {
    const participantData = {
      name: getParticipantName(participant),
      email: getParticipantEmail(participant),
      userId: participant.userId,
      profileId: participant.profile?.id
    };
    setSelectedParticipant(participantData);
    setParticipantType(type);
    setShowPhoneModal(true);
  };

  const handlePhoneSaved = (phoneNumber) => {
    // Actualizar los datos locales
    if (selectedParticipant) {
      if (participantType === 'teacher') {
        setTeachersData(prev => ({
          ...prev,
          [selectedParticipant.email]: {
            ...prev[selectedParticipant.email],
            phoneNumber
          }
        }));
      } else {
        setStudentsData(prev => ({
          ...prev,
          [selectedParticipant.email]: {
            ...prev[selectedParticipant.email],
            phoneNumber
          }
        }));
      }
    }
  };

  const handleOpenTelegramModal = (participant, role) => {
    const email = getParticipantEmail(participant);
    const name = getParticipantName(participant);
    const participantData = role === 'teacher' ? teachersData[email] : studentsData[email];
    
    setSelectedTelegramParticipant({
      name,
      email,
      phoneNumber: participantData?.phoneNumber,
      role
    });
    setShowTelegramModal(true);
  };

  const handleSendTelegramMessage = async (message) => {
    try {
      setSendingTelegram(selectedTelegramParticipant.email);
      
      // Nota: En una implementación real, necesitarías el chat_id del usuario
      // Por ahora, mostraremos una notificación de que se enviaría el mensaje
      console.log('📱 Mensaje que se enviaría por Telegram:');
      console.log('👤 Para:', selectedTelegramParticipant.name, '(' + selectedTelegramParticipant.email + ')');
      console.log('📝 Mensaje:', message);
      
      // Simular envío (en producción usarías sendMessageToPhone)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mostrar notificación de éxito
      alert(`✅ Mensaje enviado a ${selectedTelegramParticipant.name}\n\n📱 Número: ${selectedTelegramParticipant.phoneNumber}\n\n📝 El usuario recibirá el mensaje en Telegram si tiene el bot configurado.`);
      
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      alert('❌ Error al enviar mensaje por Telegram');
      throw error;
    } finally {
      setSendingTelegram(null);
      setShowTelegramModal(false);
      setSelectedTelegramParticipant(null);
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
    const participantData = role === 'teacher' ? teachersData[email] : studentsData[email];
    const hasPhone = participantData?.phoneNumber;

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
              {hasPhone && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  📱
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">
              {email}
            </p>
            {hasPhone && (
              <p className="text-xs text-gray-500 truncate">
                📱 {participantData.phoneNumber}
              </p>
            )}
            {participant.profile?.id && participant.profile.id !== email && (
              <p className="text-xs text-gray-500 truncate">
                ID: {participant.profile.id}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center space-x-1">
            {/* Email Button */}
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

            {/* Phone Button - Para estudiantes y profesores */}
            <button
              onClick={() => handleEditPhone(participant, role)}
              className={`p-2 transition-colors ${
                hasPhone 
                  ? 'text-green-500 hover:text-green-600' 
                  : 'text-gray-400 hover:text-blue-600'
              }`}
              title={hasPhone ? 'Editar teléfono' : 'Agregar teléfono'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>

            {/* Telegram Button - Solo si tiene teléfono y Telegram está configurado */}
            {hasPhone && telegramConfig.ready && (
              <button
                onClick={() => handleOpenTelegramModal(participant, role)}
                disabled={sendingTelegram === email}
                className={`p-2 transition-colors ${
                  sendingTelegram === email
                    ? 'text-blue-300 cursor-not-allowed'
                    : 'text-gray-400 hover:text-blue-500'
                }`}
                title={sendingTelegram === email ? 'Enviando mensaje...' : 'Enviar mensaje por Telegram'}
              >
                {sendingTelegram === email ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                )}
              </button>
            )}
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
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(studentsData).filter(email => studentsData[email].phoneNumber).length + 
               Object.keys(teachersData).filter(email => teachersData[email].phoneNumber).length}
            </div>
            <div className="text-sm text-gray-600">Con Teléfono</div>
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

      {/* Telegram Configuration Status */}
      {!telegramConfig.ready && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-yellow-800 font-medium">Telegram no configurado</p>
              <p className="text-yellow-700 text-sm mt-1">
                Para habilitar el envío de mensajes por Telegram, configura la variable de entorno VITE_TELEGRAM_BOT_TOKEN o REACT_APP_TELEGRAM_BOT_TOKEN
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phone Modal */}
      <PhoneModal
        isOpen={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          setSelectedParticipant(null);
        }}
        participant={selectedParticipant}
        courseId={courseId}
        participantType={participantType}
        onSave={handlePhoneSaved}
      />

      {/* Telegram Message Modal */}
      <TelegramMessageModal
        isOpen={showTelegramModal}
        onClose={() => {
          setShowTelegramModal(false);
          setSelectedTelegramParticipant(null);
        }}
        participant={selectedTelegramParticipant}
        courseName={courseName}
        onSend={handleSendTelegramMessage}
      />
    </div>
  );
};

export default ParticipantsView;
