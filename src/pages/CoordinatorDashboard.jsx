import { useState, useEffect } from 'react';
import { getCourseStudents, getAllCourseContent, getGoogleAccessToken } from '../services/googleApi';
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
  const [courseWork, setCourseWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'attendance', 'assignments'

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
      
      // Obtener todas las células donde el usuario es coor dinador
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
      
      // Cargar datos del curso en paralelo
      const [allStudents, courseWorkData] = await Promise.all([
        getCourseStudents(cell.courseId, accessToken),
        getAllCourseContent(cell.courseId, accessToken)
      ]);
      
      setStudents(allStudents);
      setCourseWork(courseWorkData);
      
      // Filtrar solo los estudiantes de esta célula
      const studentEmails = cell.studentEmails || [];
      const filteredStudents = filterStudentsByEmails(allStudents, studentEmails);
      setCellStudents(filteredStudents);
      
      console.log('Estudiantes de la célula:', filteredStudents);
      console.log('Trabajos del curso:', courseWorkData);
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
    <div className="space-y-6">
      {/* Header and Cell Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">👨‍🏫</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dashboard del Coordinador
            </h3>
            <p className="text-sm text-gray-600">
              {user?.displayName || user?.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
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
          
          <button
            onClick={loadAssignedCells}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Cell Selector */}
      {assignedCells.length > 1 && (
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Célula
          </label>
          <select
            value={selectedCell?.id || ''}
            onChange={(e) => {
              const cell = assignedCells.find(c => c.id === e.target.value);
              setSelectedCell(cell);
            }}
            className="input-field"
          >
            {assignedCells.map((cell) => (
              <option key={cell.id} value={cell.id}>
                {cell.courseName} - {cell.name} ({cell.studentEmails?.length || 0} estudiantes)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      {selectedCell && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Resumen', icon: '📊' },
              { id: 'students', name: 'Estudiantes', icon: '👥' },
              { id: 'assignments', name: 'Trabajos', icon: '📝' },
              { id: 'attendance', name: 'Asistencia', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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
      )}

      {/* Content */}
        {/* Overview Tab */}
        {activeTab === 'overview' && selectedCell && (
          <div className="space-y-6">
            {/* Cell Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de la Célula
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {cellStudents.length}
                  </div>
                  <div className="text-sm text-blue-600">Estudiantes</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {courseWork.length}
                  </div>
                  <div className="text-sm text-green-600">Trabajos</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {courseWork.filter(w => w.dueDate && new Date(w.dueDate.date) > new Date()).length}
                  </div>
                  <div className="text-sm text-yellow-600">Pendientes</div>
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

            {/* Recent Assignments Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Trabajos Recientes
                </h2>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ver todos →
                </button>
              </div>
              
              {courseWork.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay trabajos disponibles en este curso
                </p>
              ) : (
                <div className="space-y-3">
                  {courseWork.slice(0, 3).map((work, index) => (
                    <div key={work.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-sm">
                          {work.workType === 'ASSIGNMENT' ? '📋' : 
                           work.workType === 'SHORT_ANSWER_QUESTION' ? '❓' : 
                           work.workType === 'MULTIPLE_CHOICE_QUESTION' ? '☑️' : '📝'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {work.title}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span>
                            {work.workType === 'ASSIGNMENT' ? 'Tarea' : 
                             work.workType === 'SHORT_ANSWER_QUESTION' ? 'Pregunta' : 
                             work.workType === 'MULTIPLE_CHOICE_QUESTION' ? 'Opción Múltiple' : 'Trabajo'}
                          </span>
                          {work.dueDate && (
                            <>
                              <span>•</span>
                              <span>Vence: {new Date(work.dueDate.date).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          work.state === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {work.state === 'PUBLISHED' ? 'Activo' : 'Borrador'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {courseWork.length > 3 && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    +{courseWork.length - 3} trabajos más
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

        {/* Assignments Tab */}
        {activeTab === 'assignments' && selectedCell && (
          <div className="space-y-6">
            {/* Assignments Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Trabajos de {selectedCell.name} - {selectedCell.courseName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Seguimiento de trabajos para los {cellStudents.length} estudiantes de tu célula
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{courseWork.length}</div>
                  <div className="text-sm text-gray-600">Trabajos Totales</div>
                </div>
              </div>
            </div>

            {/* Assignments List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista de Trabajos</h3>
              </div>
              
              {courseWork.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay trabajos disponibles
                  </h3>
                  <p className="text-gray-600">
                    Este curso aún no tiene trabajos asignados
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {courseWork.map((work, index) => (
                    <div key={work.id || index} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {work.workType === 'ASSIGNMENT' ? '📋' : 
                                 work.workType === 'SHORT_ANSWER_QUESTION' ? '❓' : 
                                 work.workType === 'MULTIPLE_CHOICE_QUESTION' ? '☑️' : '📝'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{work.title}</h4>
                              <p className="text-sm text-gray-600">
                                {work.workType === 'ASSIGNMENT' ? 'Tarea' : 
                                 work.workType === 'SHORT_ANSWER_QUESTION' ? 'Pregunta Abierta' : 
                                 work.workType === 'MULTIPLE_CHOICE_QUESTION' ? 'Opción Múltiple' : 'Trabajo'}
                              </p>
                            </div>
                          </div>
                          
                          {work.description && (
                            <p className="text-sm text-gray-700 mb-3 ml-11">
                              {work.description.length > 150 
                                ? `${work.description.substring(0, 150)}...` 
                                : work.description
                              }
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 ml-11 text-xs text-gray-500">
                            {work.creationTime && (
                              <span>
                                📅 Creado: {new Date(work.creationTime).toLocaleDateString()}
                              </span>
                            )}
                            {work.dueDate && (
                              <span>
                                ⏰ Vence: {new Date(work.dueDate.date).toLocaleDateString()}
                              </span>
                            )}
                            <span>
                              👥 {cellStudents.length} estudiantes en célula
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              work.state === 'PUBLISHED' 
                                ? 'bg-green-100 text-green-800' 
                                : work.state === 'DRAFT'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {work.state === 'PUBLISHED' ? 'Publicado' : 
                               work.state === 'DRAFT' ? 'Borrador' : work.state}
                            </span>
                          </div>
                          
                          {work.maxPoints && (
                            <div className="text-sm text-gray-600">
                              📊 {work.maxPoints} puntos
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {courseWork.filter(w => w.workType === 'ASSIGNMENT').length}
                </div>
                <div className="text-sm text-gray-600">Tareas</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {courseWork.filter(w => w.state === 'PUBLISHED').length}
                </div>
                <div className="text-sm text-gray-600">Publicados</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {courseWork.filter(w => w.dueDate && new Date(w.dueDate.date) > new Date()).length}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{cellStudents.length}</div>
                <div className="text-sm text-gray-600">Estudiantes</div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && selectedCell && (
          <AttendanceModule
            courseId={selectedCell.courseId}
            courseName={selectedCell.courseName}
            students={students}
            user={user}
            filteredStudents={cellStudents}
            isCoordinatorView={true}
            cellName={selectedCell.name}
          />
        )}
    </div>
  );
};

export default CoordinatorDashboard;
