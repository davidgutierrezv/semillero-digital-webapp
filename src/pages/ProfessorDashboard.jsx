import { useState, useEffect } from 'react';
import { getTeacherCourses, getCourseStudents, getCourseWork, getStudentSubmissions, getGoogleAccessToken } from '../services/googleApi';
import { getCellsForCourse, createOrUpdateCourse } from '../services/firestore';
import AttendanceModule from '../components/AttendanceModule';
import StudentProgressRow from '../components/StudentProgressRow';

const ProfessorDashboard = ({ user, role }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [cells, setCells] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseWork, setCourseWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentProgress, setStudentProgress] = useState({});
  const [showAttendance, setShowAttendance] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseData(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const accessToken = getGoogleAccessToken();
      
      // Only get courses where user is a teacher
      const coursesData = await getTeacherCourses(accessToken);
      setCourses(coursesData);
      
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]);
      } else {
        setSelectedCourse(null);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Error al cargar los cursos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (courseId) => {
    try {
      setLoading(true);
      const accessToken = await user.accessToken || user.auth?.currentUser?.accessToken;
      
      // Load course data in parallel
      const [cellsData, studentsData, courseWorkData] = await Promise.all([
        getCellsForCourse(courseId),
        getCourseStudents(courseId, accessToken),
        getCourseWork(courseId, accessToken)
      ]);

      setCells(cellsData);
      setStudents(studentsData);
      setCourseWork(courseWorkData);

      // Group students by cells and load their progress
      await loadStudentProgressByCells(cellsData, courseWorkData, courseId, accessToken);
    } catch (error) {
      console.error('Error loading course data:', error);
      setError('Error al cargar los datos del curso.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgressByCells = async (cellsData, courseWorkData, courseId, accessToken) => {
    const progressData = {};
    const recentAssignments = courseWorkData.slice(0, 5);

    for (const cell of cellsData) {
      for (const studentEmail of cell.studentEmails) {
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
              dueDate: assignment.dueDate,
              status: getSubmissionStatus(studentSubmission),
              grade: studentSubmission?.assignedGrade || null
            });
          } catch (error) {
            console.error('Error loading submission:', error);
            progressData[studentEmail].assignments.push({
              title: assignment.title,
              dueDate: assignment.dueDate,
              status: 'error',
              grade: null
            });
          }
        }
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

  const exportToCSV = () => {
    if (!selectedCourse || Object.keys(studentProgress).length === 0) return;

    const headers = ['Estudiante', 'Célula', 'Curso'];
    const maxAssignments = Math.max(...Object.values(studentProgress).map(p => p.assignments.length));
    
    for (let i = 0; i < maxAssignments; i++) {
      headers.push(`Tarea ${i + 1}`, `Estado ${i + 1}`, `Calificación ${i + 1}`);
    }

    const rows = [headers];

    Object.entries(studentProgress).forEach(([email, data]) => {
      const row = [email, data.cellName, selectedCourse.name];
      
      data.assignments.forEach(assignment => {
        row.push(assignment.title, getStatusText(assignment.status), assignment.grade || '');
      });

      // Fill empty cells if this student has fewer assignments
      while (row.length < headers.length) {
        row.push('');
      }

      rows.push(row);
    });

    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `progreso_${selectedCourse.name}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading && !selectedCourse) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button onClick={loadCourses} className="mt-2 btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Course Selection */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Dashboard del {role === 'coordinator' ? 'Coordinador' : 'Profesor'}
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAttendance(!showAttendance)}
            className="btn-secondary"
          >
            {showAttendance ? 'Ocultar' : 'Mostrar'} Asistencia
          </button>
          <button onClick={exportToCSV} className="btn-primary">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Course Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Curso
        </label>
        <select
          value={selectedCourse?.id || ''}
          onChange={(e) => {
            const course = courses.find(c => c.id === e.target.value);
            setSelectedCourse(course);
          }}
          className="input-field"
        >
          <option value="">Selecciona un curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Module */}
      {showAttendance && selectedCourse && (
        <AttendanceModule 
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          students={students}
          user={user}
        />
      )}

      {/* Course Overview */}
      {selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-2">Estudiantes</h4>
            <p className="text-2xl font-bold text-primary-600">{students.length}</p>
          </div>
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-2">Células</h4>
            <p className="text-2xl font-bold text-primary-600">{cells.length}</p>
          </div>
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-2">Tareas</h4>
            <p className="text-2xl font-bold text-primary-600">{courseWork.length}</p>
          </div>
        </div>
      )}

      {/* Cells and Student Progress */}
      {selectedCourse && (
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Progreso por Células
          </h4>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Cargando progreso...</p>
            </div>
          ) : cells.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay células configuradas para este curso.</p>
              <p className="text-sm text-gray-400 mt-2">
                Contacta al coordinador para configurar las células.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {cells.map((cell) => (
                <div key={cell.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">{cell.name}</h5>
                    <div className="text-sm text-gray-500">
                      Asistente: {cell.assistantEmail} | {cell.studentEmails.length} estudiantes
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {cell.studentEmails.map((studentEmail) => (
                      studentProgress[studentEmail] && (
                        <StudentProgressRow
                          key={studentEmail}
                          studentEmail={studentEmail}
                          cellName={cell.name}
                          courseName={selectedCourse.name}
                          assignments={studentProgress[studentEmail].assignments}
                          getStatusColor={getStatusColor}
                          getStatusText={getStatusText}
                        />
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;
