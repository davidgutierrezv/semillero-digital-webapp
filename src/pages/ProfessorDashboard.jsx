import { useState, useEffect } from 'react';
import { getTeacherCourses, getCourseStudents, getCourseTeachers, getAllCourseContent, getStudentSubmissions, getGoogleAccessToken } from '../services/googleApi';
import { getCellsForCourse, createOrUpdateCourse } from '../services/firestore';
import AttendanceModule from '../components/AttendanceModule';
import StudentProgressRow from '../components/StudentProgressRow';
import AssignmentStatusCard from '../components/AssignmentStatusCard';
import CellManagement from '../components/CellManagement';
import ParticipantsView from '../components/ParticipantsView';
import ProgressView from '../components/ProgressView';
import AnalyticsView from '../components/AnalyticsView';

const ProfessorDashboard = ({ user, role }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [cells, setCells] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courseWork, setCourseWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentProgress, setStudentProgress] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'cells', 'attendance', 'participants', 'progress', 'analytics'

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
      const accessToken = getGoogleAccessToken();
      
      // Load course data in parallel
      const [cellsData, studentsData, teachersData, courseWorkData] = await Promise.all([
        getCellsForCourse(courseId),
        getCourseStudents(courseId, accessToken),
        getCourseTeachers(courseId, accessToken),
        getAllCourseContent(courseId, accessToken)
      ]);

      setCells(cellsData);
      setStudents(studentsData);
      setTeachers(teachersData);
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
          {/*<button
            onClick={() => setShowAttendance(!showAttendance)}
            className="btn-secondary"
          >
            {showAttendance ? 'Ocultar' : 'Mostrar'} Asistencia
          </button>*/}
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


      {/* Course Tabs */}
      {selectedCourse && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Resumen
            </button>
            
            <button
              onClick={() => setActiveTab('cells')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cells'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🧬 Células ({cells.length})
            </button>
            
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Asistencia
            </button>
            
            <button
              onClick={() => setActiveTab('participants')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'participants'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Participantes ({students.length})
            </button>
            
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Progreso ({courseWork.length})
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Analíticas
            </button>
          </nav>
        </div>
      )}

      {/* Tab Content - Overview */}
      {selectedCourse && activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Course Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del Curso: {selectedCourse.name}
            </h3>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                <div className="text-sm text-blue-600">Estudiantes</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{cells.length}</div>
                <div className="text-sm text-green-600">Células</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{courseWork.length}</div>
                <div className="text-sm text-purple-600">Tareas</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {cells.reduce((sum, cell) => sum + (cell.studentEmails?.length || 0), 0)}
                </div>
                <div className="text-sm text-orange-600">Estudiantes Asignados</div>
              </div>
            </div>

            {/* Course Info */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Información del Curso</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">ID del Curso:</span>
                  <span className="ml-2 text-gray-900">{selectedCourse.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Estado:</span>
                  <span className="ml-2 text-green-600 font-medium">Activo</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Sección:</span>
                  <span className="ml-2 text-gray-900">{selectedCourse.section || 'No especificada'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Sala:</span>
                  <span className="ml-2 text-gray-900">{selectedCourse.room || 'No especificada'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Acciones Rápidas</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('participants')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>👥</span>
                  <span>Ver Participantes</span>
                </button>
                <button
                  onClick={() => setActiveTab('cells')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>🧬</span>
                  <span>Gestionar Células</span>
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>📅</span>
                  <span>Tomar Asistencia</span>
                </button>
                <button
                  onClick={() => setActiveTab('progress')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>📊</span>
                  <span>Ver Progreso</span>
                </button>
                <button
                  onClick={() => window.open(selectedCourse.alternateLink, '_blank')}
                  className="btn-secondary flex items-center space-x-2"
                  disabled={!selectedCourse.alternateLink}
                >
                  <span>🔗</span>
                  <span>Abrir en Classroom</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-4">Estado General</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Células configuradas</span>
                <span className={`text-sm font-medium ${cells.length > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {cells.length > 0 ? `${cells.length} células activas` : 'Sin células configuradas'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Estudiantes sin asignar</span>
                <span className={`text-sm font-medium ${
                  students.length - cells.reduce((sum, cell) => sum + (cell.studentEmails?.length || 0), 0) === 0 
                    ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {students.length - cells.reduce((sum, cell) => sum + (cell.studentEmails?.length || 0), 0)} estudiantes
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Contenido del curso</span>
                <span className="text-sm font-medium text-blue-600">
                  {courseWork.length} elementos
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Cells */}
      {selectedCourse && activeTab === 'cells' && (
        <CellManagement
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          students={students}
          teachers={teachers}
          accessToken={getGoogleAccessToken()}
          currentUser={user}
        />
      )}

      {/* Tab Content - Attendance */}
      {selectedCourse && activeTab === 'attendance' && (
        <AttendanceModule 
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          students={students}
          user={user}
        />
      )}

      {/* Tab Content - Participants */}
      {selectedCourse && activeTab === 'participants' && (
        <ParticipantsView
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
        />
      )}

      {/* Tab Content - Progress */}
      {selectedCourse && activeTab === 'progress' && (
        <ProgressView
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          students={students}
          cells={cells}
          courseWork={courseWork}
          user={user}
          role={role}
        />
      )}

      {/* Tab Content - Analytics */}
      {selectedCourse && activeTab === 'analytics' && (
        <AnalyticsView
          role="professor"
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          students={students}
          courseWork={courseWork}
          cells={cells}
          user={user}
        />
      )}
    </div>
  );
};

export default ProfessorDashboard;
