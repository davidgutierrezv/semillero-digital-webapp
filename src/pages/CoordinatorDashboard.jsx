import { useState, useEffect } from 'react';
import { getCourseStudents, getGoogleAccessToken } from '../services/googleApi';
import { getCellsForCourse, getCellsByAssistant } from '../services/firestore';
import { getStudentEmail, getStudentName, getStudentId, filterStudentsByEmails } from '../utils/studentUtils';
import CellCard from '../components/CellCard';
import ParticipantsView from '../components/ParticipantsView';
import AttendanceModule from '../components/AttendanceModule';

const CoordinatorDashboard = ({ user, role }) => {
  const [assignedCells, setAssignedCells] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [students, setStudents] = useState([]);
  const [cellStudents, setCellStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'attendance'

  useEffect(() => {
    if (user?.email) {
      loadAssignedCells();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCell) {
      loadCellData(selectedCell);
    }
  }, [selectedCell]);

  const loadAssignedCells = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todas las células donde el usuario es asistente
      const cells = await getCellsByAssistant(user.email);
      console.log('Células asignadas al coordinador:', cells);
      
      setAssignedCells(cells);
      
      if (cells.length > 0) {
        setSelectedCell(cells[0]);
      } else {
        setSelectedCell(null);
      }
    } catch (error) {
      console.error('Error loading assigned cells:', error);
      setError('Error al cargar las células asignadas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadCellData = async (cell) => {
    try {
      setLoading(true);
      const accessToken = getGoogleAccessToken();
      
      // Cargar todos los estudiantes del curso
      const allStudents = await getCourseStudents(cell.courseId, accessToken);
      setStudents(allStudents);
      
      // Filtrar solo los estudiantes de esta célula
      const studentEmails = cell.studentEmails || [];
      const filteredStudents = filterStudentsByEmails(allStudents, studentEmails);
      setCellStudents(filteredStudents);
      
      console.log('Estudiantes de la célula:', filteredStudents);
    } catch (error) {
      console.error('Error loading cell data:', error);
      setError('Error al cargar los datos de la célula.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (assignedCells.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No hay células asignadas
          </h2>
          <p className="text-gray-600 mb-4">
            Actualmente no tienes células asignadas como coordinador. 
            Contacta al profesor principal para que te asigne una célula.
          </p>
          <div className="text-sm text-gray-500">
            Usuario: {user?.email}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">👨‍🏫</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Panel de Coordinador
                </h1>
                <p className="text-sm text-gray-600">
                  {user?.displayName || user?.email}
                </p>
              </div>
            </div>
            
            {selectedCell && (
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {selectedCell.courseName}
                </div>
                <div className="text-xs text-gray-600">
                  Célula: {selectedCell.name}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cell Selector */}
      {assignedCells.length > 1 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Seleccionar Célula:
              </label>
              <select
                value={selectedCell?.id || ''}
                onChange={(e) => {
                  const cell = assignedCells.find(c => c.id === e.target.value);
                  setSelectedCell(cell);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {assignedCells.map((cell) => (
                  <option key={cell.id} value={cell.id}>
                    {cell.courseName} - {cell.name} ({cell.studentEmails?.length || 0} estudiantes)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Resumen', icon: '📊' },
              { id: 'students', name: 'Estudiantes', icon: '👥' },
              { id: 'attendance', name: 'Asistencia', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && selectedCell && (
          <div className="space-y-6">
            {/* Cell Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de la Célula
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {cellStudents.length}
                  </div>
                  <div className="text-sm text-blue-600">Estudiantes</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedCell.courseName}
                  </div>
                  <div className="text-sm text-green-600">Curso</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedCell.name}
                  </div>
                  <div className="text-sm text-purple-600">Célula</div>
                </div>
              </div>
              
              {selectedCell.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Descripción:</h3>
                  <p className="text-gray-700">{selectedCell.description}</p>
                </div>
              )}
            </div>

            {/* Students Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Estudiantes de la Célula
                </h2>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ver todos →
                </button>
              </div>
              
              {cellStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay estudiantes asignados a esta célula
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cellStudents.slice(0, 6).map((student) => (
                    <div
                      key={getStudentId(student)}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {getStudentName(student).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getStudentName(student)}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {getStudentEmail(student)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {cellStudents.length > 6 && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    +{cellStudents.length - 6} estudiantes más
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && selectedCell && (
          <ParticipantsView
            courseId={selectedCell.courseId}
            courseName={selectedCell.courseName}
            filteredStudents={cellStudents}
            isCoordinatorView={true}
            cellName={selectedCell.name}
          />
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && selectedCell && (
          <AttendanceModule
            courseId={selectedCell.courseId}
            courseName={selectedCell.courseName}
            filteredStudents={cellStudents}
            isCoordinatorView={true}
            cellName={selectedCell.name}
          />
        )}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
