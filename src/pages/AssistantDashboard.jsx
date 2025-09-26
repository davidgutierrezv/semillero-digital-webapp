import { useState, useEffect } from 'react';
import { getCellsForAssistant } from '../services/firestore';
import { getCourseWork, getStudentSubmissions } from '../services/googleApi';
import StudentProgressRow from '../components/StudentProgressRow';

const AssistantDashboard = ({ user }) => {
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentProgress, setStudentProgress] = useState({});

  useEffect(() => {
    loadAssistantData();
  }, [user]);

  const loadAssistantData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get cells assigned to this assistant
      const assistantCells = await getCellsForAssistant(user.email);
      setCells(assistantCells);

      // Load progress for each student in each cell
      await loadStudentProgress(assistantCells);
    } catch (error) {
      console.error('Error loading assistant data:', error);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = async (cellsData) => {
    const accessToken = await user.accessToken || user.auth?.currentUser?.accessToken;
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    const progressData = {};

    for (const cell of cellsData) {
      try {
        // Get coursework for this course
        const courseWork = await getCourseWork(cell.courseId, accessToken);
        
        // Get the latest 5 assignments
        const recentAssignments = courseWork.slice(0, 5);

        for (const studentEmail of cell.studentEmails) {
          if (!progressData[studentEmail]) {
            progressData[studentEmail] = {
              cellName: cell.name,
              courseName: cell.courseName,
              assignments: []
            };
          }

          // Get submissions for each assignment
          for (const assignment of recentAssignments) {
            try {
              const submissions = await getStudentSubmissions(
                cell.courseId, 
                assignment.id, 
                accessToken
              );
              
              const studentSubmission = submissions.find(
                sub => sub.userId === studentEmail || 
                       sub.studentProfile?.emailAddress === studentEmail
              );

              progressData[studentEmail].assignments.push({
                title: assignment.title,
                dueDate: assignment.dueDate,
                status: getSubmissionStatus(studentSubmission),
                grade: studentSubmission?.assignedGrade || null
              });
            } catch (submissionError) {
              console.error('Error loading submission:', submissionError);
              progressData[studentEmail].assignments.push({
                title: assignment.title,
                dueDate: assignment.dueDate,
                status: 'error',
                grade: null
              });
            }
          }
        }
      } catch (courseError) {
        console.error('Error loading course data:', courseError);
      }
    }

    setStudentProgress(progressData);
  };

  const getSubmissionStatus = (submission) => {
    if (!submission) return 'not_submitted';
    
    switch (submission.state) {
      case 'TURNED_IN':
        return submission.assignedGrade ? 'graded' : 'submitted';
      case 'RETURNED':
        return 'returned';
      case 'RECLAIMED_BY_STUDENT':
        return 'reclaimed';
      default:
        return 'assigned';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'submitted': 'bg-green-100 text-green-800',
      'graded': 'bg-blue-100 text-blue-800',
      'not_submitted': 'bg-red-100 text-red-800',
      'returned': 'bg-yellow-100 text-yellow-800',
      'assigned': 'bg-gray-100 text-gray-800',
      'error': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'submitted': 'Entregado',
      'graded': 'Calificado',
      'not_submitted': 'No entregado',
      'returned': 'Devuelto',
      'assigned': 'Asignado',
      'error': 'Error'
    };
    return texts[status] || 'Desconocido';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del asistente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button 
          onClick={loadAssistantData}
          className="mt-2 btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (cells.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">No hay células asignadas</p>
          <p>No tienes células asignadas como asistente. Contacta al coordinador del programa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Dashboard del Asistente
        </h3>
        <button
          onClick={loadAssistantData}
          className="btn-secondary"
        >
          Actualizar Datos
        </button>
      </div>

      {/* Cells Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cells.map((cell) => (
          <div key={`${cell.courseId}-${cell.id}`} className="card">
            <h4 className="font-medium text-gray-900 mb-2">{cell.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{cell.courseName}</p>
            <p className="text-xs text-gray-500">
              {cell.studentEmails.length} estudiantes
            </p>
          </div>
        ))}
      </div>

      {/* Student Progress */}
      <div className="card">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Progreso de Estudiantes
        </h4>
        
        {Object.keys(studentProgress).length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Cargando progreso de estudiantes...
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(studentProgress).map(([studentEmail, data]) => (
              <StudentProgressRow
                key={studentEmail}
                studentEmail={studentEmail}
                cellName={data.cellName}
                courseName={data.courseName}
                assignments={data.assignments}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantDashboard;
