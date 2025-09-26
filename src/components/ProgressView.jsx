import { useState, useEffect } from 'react';
import { getStudentSubmissions, getGoogleAccessToken } from '../services/googleApi';
import StudentProgressRow from './StudentProgressRow';
import AssignmentStatusCard from './AssignmentStatusCard';

const ProgressView = ({ courseId, courseName, students, cells, courseWork, user, role }) => {
  const [studentProgress, setStudentProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('cells'); // 'cells' or 'assignments'

  useEffect(() => {
    if (courseId && cells.length > 0 && courseWork.length > 0) {
      loadStudentProgressByCells();
    }
  }, [courseId, cells, courseWork]);

  const loadStudentProgressByCells = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const progressData = {};
      const recentAssignments = courseWork.slice(0, 5);
      const accessToken = getGoogleAccessToken();

      for (const cell of cells) {
        // Usar el nuevo formato si está disponible, sino usar el legacy
        const studentEmails = cell.students && cell.students.length > 0 
          ? cell.students.map(s => s.email)
          : (cell.studentEmails || []);

        for (const studentEmail of studentEmails) {
          progressData[studentEmail] = {
            cellName: cell.name,
            assignments: []
          };

          // Load submissions for each assignment
          for (const assignment of recentAssignments) {
            try {
              const submissions = await getStudentSubmissions(courseId, assignment.id, accessToken);
              const studentSubmission = submissions.find(
                sub => sub.userId === studentEmail || 
                       sub.studentProfile?.emailAddress === studentEmail
              );

              progressData[studentEmail].assignments.push({
                title: assignment.title,
                id: assignment.id,
                dueDate: assignment.dueDate,
                maxPoints: assignment.maxPoints,
                submission: studentSubmission,
                status: getSubmissionStatus(studentSubmission),
                grade: studentSubmission?.assignedGrade || null
              });
            } catch (error) {
              console.error(`Error loading submissions for assignment ${assignment.id}:`, error);
              progressData[studentEmail].assignments.push({
                title: assignment.title,
                id: assignment.id,
                dueDate: assignment.dueDate,
                maxPoints: assignment.maxPoints,
                submission: null,
                status: 'error',
                grade: null
              });
            }
          }
        }
      }

      setStudentProgress(progressData);
    } catch (error) {
      console.error('Error loading student progress:', error);
      setError('Error al cargar el progreso de los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (submission) => {
    if (!submission) return 'not_submitted';
    if (submission.state === 'TURNED_IN') return 'submitted';
    if (submission.state === 'RETURNED') return 'graded';
    return 'draft';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'not_submitted': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'Entregado';
      case 'graded': return 'Calificado';
      case 'not_submitted': return 'No entregado';
      case 'draft': return 'Borrador';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Cargando progreso...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Progreso Académico - {courseName}
          </h3>
          <p className="text-sm text-gray-600">
            Seguimiento del progreso de estudiantes por células y tareas
          </p>
        </div>
        
        <button
          onClick={loadStudentProgressByCells}
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

      {/* View Toggle */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveView('cells')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'cells'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Progreso por Células ({cells.length})
          </button>
          <button
            onClick={() => setActiveView('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'assignments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contenido del Curso ({courseWork.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeView === 'cells' && (
        <div className="space-y-6">
          {/* Progress by Cells */}
          {cells.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🧬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay células configuradas
              </h3>
              <p className="text-gray-600 mb-4">
                Configura células para ver el progreso de los estudiantes organizados por grupos
              </p>
              <button
                onClick={() => window.location.hash = '#cells'}
                className="btn-primary"
              >
                Configurar Células
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cells.map((cell) => {
                // Usar el nuevo formato si está disponible, sino usar el legacy
                const studentsInCell = cell.students && cell.students.length > 0 
                  ? cell.students
                  : (cell.studentEmails || []).map(email => ({ email, name: email }));

                return (
                  <div key={cell.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{cell.name}</h4>
                        <p className="text-sm text-gray-600">
                          Coordinador: {cell.assistantName || cell.assistantEmail} | {studentsInCell.length} estudiantes
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {studentsInCell.filter(s => studentProgress[s.email]).length} con progreso cargado
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {studentsInCell.map((student) => {
                        const progress = studentProgress[student.email];
                        if (!progress) {
                          return (
                            <div key={student.email} className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">
                                Cargando progreso para {student.name || student.email}...
                              </p>
                            </div>
                          );
                        }

                        return (
                          <StudentProgressRow
                            key={student.email}
                            studentEmail={student.email}
                            studentName={student.name}
                            cellName={cell.name}
                            courseName={courseName}
                            assignments={progress.assignments}
                            getStatusColor={getStatusColor}
                            getStatusText={getStatusText}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeView === 'assignments' && (
        <div className="space-y-6">
          {/* Course Assignments with Status */}
          {courseWork.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay contenido del curso
              </h3>
              <p className="text-gray-600">
                Este curso aún no tiene tareas o contenido asignado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courseWork.map((assignment) => (
                <AssignmentStatusCard
                  key={assignment.id}
                  coursework={assignment}
                  students={students}
                  courseId={courseId}
                  accessToken={getGoogleAccessToken()}
                  userRole={role}
                  onViewDetails={(coursework) => {
                    // Open coursework in Google Classroom
                    if (coursework.alternateLink) {
                      window.open(coursework.alternateLink, '_blank');
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Estadísticas de Progreso</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(studentProgress).length}
            </div>
            <div className="text-sm text-gray-600">Estudiantes Rastreados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {courseWork.length}
            </div>
            <div className="text-sm text-gray-600">Tareas Totales</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {cells.length}
            </div>
            <div className="text-sm text-gray-600">Células Activas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {Object.values(studentProgress).reduce((total, progress) => 
                total + progress.assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length, 0
              )}
            </div>
            <div className="text-sm text-gray-600">Tareas Entregadas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
