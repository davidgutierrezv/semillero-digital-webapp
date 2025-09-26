import { useState, useEffect } from 'react';
import { getCourses, getAssignments, getGoogleAccessToken, getCourseWork, getStudentSubmissions, getUserRoleInCourse } from '../services/googleApi';

const StudentDashboard = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadStudentData();
  }, [user]);
  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Google access token for API calls
      console.log('Attempting to get Google access token...');
      const accessToken = getGoogleAccessToken();
      console.log('Access token obtained:', accessToken ? 'Yes' : 'No');

      // Load courses where the student is enrolled
      console.log('Loading courses...');
      const coursesData = await getCourses(accessToken);
      console.log('Courses loaded:', coursesData.length);
      setCourses(coursesData);

      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]);
        const assignmentsData = await getAssignments(coursesData[0].id, accessToken);
        setAssignments(assignmentsData);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      setError('Error al cargar los datos del estudiante. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'SUBMITTED': 'bg-green-100 text-green-800 border-green-200',
      'TURNED_IN': 'bg-green-100 text-green-800 border-green-200',
      'GRADED': 'bg-blue-100 text-blue-800 border-blue-200',
      'NOT_SUBMITTED': 'bg-gray-100 text-gray-800 border-gray-200',
      'OVERDUE': 'bg-red-100 text-red-800 border-red-200',
      'RETURNED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'RECLAIMED_BY_STUDENT': 'bg-purple-100 text-purple-800 border-purple-200',
      'ERROR': 'bg-red-50 text-red-700 border-red-200',
      // Legacy support
      'submitted': 'bg-green-100 text-green-800 border-green-200',
      'graded': 'bg-blue-100 text-blue-800 border-blue-200',
      'not_submitted': 'bg-gray-100 text-gray-800 border-gray-200',
      'overdue': 'bg-red-100 text-red-800 border-red-200',
      'returned': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'error': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      'SUBMITTED': 'Entregado',
      'TURNED_IN': 'Entregado',
      'GRADED': 'Calificado',
      'NOT_SUBMITTED': 'Pendiente',
      'RETURNED': 'Devuelto',
      'RECLAIMED_BY_STUDENT': 'Reclamado',
      'ERROR': 'Error',
      // Legacy support
      'submitted': 'Entregado',
      'graded': 'Calificado',
      'not_submitted': 'Pendiente',
      'overdue': 'Atrasado',
      'returned': 'Devuelto',
      'assigned': 'Asignado',
      'error': 'Error'
    };
    return texts[status] || 'Desconocido';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'SUBMITTED': '✓',
      'TURNED_IN': '✓',
      'GRADED': '★',
      'NOT_SUBMITTED': '○',
      'RETURNED': '↩',
      'RECLAIMED_BY_STUDENT': '🔄',
      'ERROR': '❌',
      // Legacy support
      'submitted': '✓',
      'graded': '★',
      'not_submitted': '○',
      'overdue': '⚠',
      'returned': '↩',
      'assigned': '📝',
      'error': '❌'
    };
    return icons[status] || '?';
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'Sin fecha límite';
    
    const date = new Date(dueDate.year, dueDate.month - 1, dueDate.day);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Venció hace ${Math.abs(diffDays)} días`;
    } else if (diffDays === 0) {
      return 'Vence hoy';
    } else if (diffDays === 1) {
      return 'Vence mañana';
    } else {
      return `Vence en ${diffDays} días`;
    }
  };

  const getOverallProgress = () => {
    if (assignments.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = assignments.filter(a => 
      a.status === 'submitted' || a.status === 'graded' || a.status === 'returned'
    ).length;
    
    return {
      completed,
      total: assignments.length,
      percentage: Math.round((completed / assignments.length) * 100)
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del estudiante...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button onClick={loadStudentData} className="mt-2 btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">No hay cursos disponibles</p>
          <p>No estás inscrito en ningún curso del Semillero Digital.</p>
        </div>
      </div>
    );
  }

  const progress = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Dashboard del Estudiante
        </h3>
        <button onClick={loadStudentData} className="btn-secondary">
          Actualizar Datos
        </button>
      </div>

      {/* Course Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Curso Actual
        </label>
        <select
          value={selectedCourse?.id || ''}
          onChange={async (e) => {
            const course = courses.find(c => c.id === e.target.value);
            setSelectedCourse(course);
            if (course) {
              try {
                const accessToken = getGoogleAccessToken();
                const assignmentsData = await getAssignments(course.id, accessToken);
                setAssignments(assignmentsData);
                
                // Clear any previous error if assignments loaded successfully
                if (error) setError(null);
              } catch (error) {
                console.error('Error loading assignments for course:', error);
                
                if (error.message.includes('403')) {
                  // Try to get user role for better error message
                  try {
                    const userRole = await getUserRoleInCourse(course.id, accessToken);
                    console.log(`Tu rol en el curso "${course.name}": ${userRole}`);
                    
                    if (userRole === 'VIEWER') {
                      setError(`Eres un "Visualizador" en el curso "${course.name}". Necesitas ser "Estudiante" para ver las tareas vía API. Contacta al profesor.`);
                    } else if (userRole === 'TEACHER') {
                      setError(`Eres profesor en este curso. Cambia a la vista de profesor para ver las tareas.`);
                    } else {
                      setError(`Tu rol "${userRole}" no permite ver tareas vía API en "${course.name}".`);
                    }
                  } catch (roleError) {
                    setError(`No tienes permisos para ver las tareas del curso "${course.name}". Contacta al profesor para obtener acceso como estudiante.`);
                  }
                  setAssignments([]); // Clear assignments
                } else {
                  setError('Error al cargar las tareas del curso.');
                }
              }
            }
          }}
          className="input-field"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-2">Progreso General</h4>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {progress.percentage}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {progress.completed} de {progress.total} tareas completadas
          </p>
        </div>

        <div className="card">
          <h4 className="font-medium text-gray-900 mb-2">Tareas Pendientes</h4>
          <p className="text-2xl font-bold text-red-600">
            {assignments.filter(a => a.status === 'not_submitted' || a.status === 'overdue').length}
          </p>
        </div>

        <div className="card">
          <h4 className="font-medium text-gray-900 mb-2">Tareas Calificadas</h4>
          <p className="text-2xl font-bold text-green-600">
            {assignments.filter(a => a.status === 'graded').length}
          </p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="card">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Mis Tareas
        </h4>

        {assignments.length === 0 ? (
          <div className="text-center py-8">
            {error && error.includes('permisos') ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl">🔒</span>
                </div>
                <p className="text-yellow-800 font-medium mb-1">Acceso Restringido</p>
                <p className="text-yellow-700 text-sm">
                  No tienes permisos para ver las tareas de este curso. 
                  El profesor debe agregarte como estudiante para ver las tareas.
                </p>
              </div>
            ) : (
              <div className="text-gray-500">
                <span className="text-2xl mb-2 block">📚</span>
                <p>No hay tareas disponibles en este curso.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${getStatusColor(assignment.submissionStatus)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getStatusIcon(assignment.submissionStatus)}</span>
                      <h5 className="font-medium text-gray-900">{assignment.title}</h5>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.submissionStatus)}`}>
                        {getStatusText(assignment.submissionStatus)}
                      </span>
                    </div>
                    
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        📅 {formatDueDate(assignment.dueDate)}
                      </span>
                      {assignment.maxPoints && (
                        <span>
                          📊 {assignment.maxPoints} puntos
                        </span>
                      )}
                      {assignment.submission?.assignedGrade && (
                        <span className="font-medium text-green-600">
                          ✅ Calificación: {assignment.submission.assignedGrade}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {assignment.alternateLink && (
                      <a
                        href={assignment.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm"
                      >
                        Ver en Classroom
                      </a>
                    )}
                  </div>
                </div>

                {assignment.submission?.submissionHistory && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Última entrega: {new Date(assignment.submission.updateTime).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
