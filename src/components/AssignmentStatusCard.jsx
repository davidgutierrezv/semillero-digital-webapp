import { useState, useEffect } from 'react';
import { getStudentSubmissions } from '../services/googleApi';

const AssignmentStatusCard = ({ 
  coursework, 
  students = [], 
  courseId, 
  accessToken, 
  userRole = 'STUDENT',
  onViewDetails 
}) => {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (userRole === 'PROFESSOR' || userRole === 'ASSISTANT') {
      loadSubmissionStats();
    }
  }, [coursework.id, students]);

  const loadSubmissionStats = async () => {
    if (!courseId || !accessToken) return;
    
    try {
      setLoading(true);
      const submissionsData = await getStudentSubmissions(courseId, coursework.id, accessToken);
      setSubmissions(submissionsData);
      
      // Calculate statistics
      const stats = calculateStats(submissionsData, students);
      setStats(stats);
    } catch (error) {
      console.error('Error loading submission stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (submissions, students) => {
    const totalStudents = students.length;
    const submittedCount = submissions.filter(s => 
      s.state === 'SUBMITTED' || s.state === 'TURNED_IN'
    ).length;
    const gradedCount = submissions.filter(s => s.assignedGrade !== undefined).length;
    const lateCount = submissions.filter(s => s.late === true).length;
    const pendingCount = totalStudents - submittedCount;

    return {
      totalStudents,
      submittedCount,
      gradedCount,
      lateCount,
      pendingCount,
      submissionRate: totalStudents > 0 ? (submittedCount / totalStudents * 100).toFixed(1) : 0,
      gradingRate: submittedCount > 0 ? (gradedCount / submittedCount * 100).toFixed(1) : 0
    };
  };

  const getStatusIcon = (status) => {
    const icons = {
      'SUBMITTED': '✅',
      'TURNED_IN': '✅',
      'GRADED': '📊',
      'NOT_SUBMITTED': '⏳',
      'NOT_ASSIGNED': '❌',
      'OVERDUE': '🔴',
      'RETURNED': '🔄',
      'RECLAIMED_BY_STUDENT': '↩️'
    };
    return icons[status] || '📄';
  };

  const getStatusColor = (status) => {
    const colors = {
      'SUBMITTED': 'bg-green-50 border-green-200 text-green-800',
      'TURNED_IN': 'bg-green-50 border-green-200 text-green-800',
      'GRADED': 'bg-blue-50 border-blue-200 text-blue-800',
      'NOT_SUBMITTED': 'bg-gray-50 border-gray-200 text-gray-800',
      'NOT_ASSIGNED': 'bg-orange-50 border-orange-200 text-orange-800',
      'OVERDUE': 'bg-red-50 border-red-200 text-red-800',
      'RETURNED': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'RECLAIMED_BY_STUDENT': 'bg-purple-50 border-purple-200 text-purple-800'
    };
    return colors[status] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const renderStudentView = () => (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${coursework.typeColor || 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{coursework.typeIcon || '📄'}</span>
            <h4 className="font-medium text-gray-900">{coursework.title}</h4>
            {coursework.submissionStatus && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(coursework.submissionStatus)}`}>
                {getStatusIcon(coursework.submissionStatus)} {coursework.submissionStatus}
              </span>
            )}
          </div>
          
          {coursework.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {coursework.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <span>📅</span>
              <span>{coursework.formattedDueDate || 'Sin fecha límite'}</span>
            </span>
            
            {coursework.maxPoints && (
              <span className="flex items-center space-x-1">
                <span>⭐</span>
                <span>{coursework.maxPoints} puntos</span>
              </span>
            )}
            
            {coursework.grade && (
              <span className="flex items-center space-x-1 text-green-600 font-medium">
                <span>✅</span>
                <span>{coursework.grade}/{coursework.maxPoints || 100}</span>
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(coursework)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Ver detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderTeacherView = () => (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${coursework.typeColor || 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">{coursework.typeIcon || '📄'}</span>
            <h4 className="font-medium text-gray-900">{coursework.title}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${coursework.typeColor}`}>
              {coursework.workType}
            </span>
          </div>
          
          {/* Statistics Row */}
          {!loading && stats.totalStudents > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{stats.submittedCount}</div>
                <div className="text-xs text-blue-600">Entregadas</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">{stats.pendingCount}</div>
                <div className="text-xs text-gray-600">Pendientes</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{stats.gradedCount}</div>
                <div className="text-xs text-green-600">Calificadas</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{stats.lateCount}</div>
                <div className="text-xs text-red-600">Tardías</div>
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          {!loading && stats.totalStudents > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progreso de entregas</span>
                <span>{stats.submissionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.submissionRate}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <span>📅</span>
              <span>{coursework.formattedDueDate || 'Sin fecha límite'}</span>
            </span>
            
            {coursework.maxPoints && (
              <span className="flex items-center space-x-1">
                <span>⭐</span>
                <span>{coursework.maxPoints} puntos</span>
              </span>
            )}
            
            <span className="flex items-center space-x-1">
              <span>👥</span>
              <span>{stats.totalStudents || students.length} estudiantes</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(coursework)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Gestionar
            </button>
          )}
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {coursework.description && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Descripción:</h5>
              <p className="text-sm text-gray-600">{coursework.description}</p>
            </div>
          )}
          
          {/* Student Submissions List */}
          {submissions.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Estado por estudiante:</h5>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {submissions.map((submission, index) => {
                  const student = students.find(s => s.userId === submission.userId);
                  return (
                    <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                      <span className="font-medium">
                        {student?.profile?.name?.fullName || 'Estudiante desconocido'}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(submission.state)}`}>
                        {getStatusIcon(submission.state)} {submission.state}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {loading && (
        <div className="mt-3 text-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mx-auto"></div>
          <span className="text-xs text-gray-500 mt-1">Cargando estadísticas...</span>
        </div>
      )}
    </div>
  );

  // Render based on user role
  if (userRole === 'STUDENT') {
    return renderStudentView();
  } else {
    return renderTeacherView();
  }
};

export default AssignmentStatusCard;
