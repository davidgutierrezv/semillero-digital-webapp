import { useState, useEffect } from 'react';
import { detectUserRole, getGoogleAccessToken } from '../services/googleApi';
import StudentDashboard from '../pages/StudentDashboard';
import ProfessorDashboard from '../pages/ProfessorDashboard';
import AssistantDashboard from '../pages/AssistantDashboard';

const RoleDetector = ({ user }) => {
  const [userRole, setUserRole] = useState(null);
  const [roleInfo, setRoleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualRoleOverride, setManualRoleOverride] = useState(null);

  useEffect(() => {
    detectRole();
  }, [user]);

  const detectRole = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = getGoogleAccessToken();
      const roleData = await detectUserRole(accessToken);
      
      console.log('Role detection result:', roleData);
      
      setRoleInfo(roleData);
      setUserRole(roleData.primaryRole);
      
    } catch (error) {
      console.error('Error detecting user role:', error);
      setError('Error al detectar el rol del usuario. Usando rol por defecto.');
      setUserRole('STUDENT'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRoleOverride = (newRole) => {
    setManualRoleOverride(newRole);
  };

  const getCurrentRole = () => {
    return manualRoleOverride || userRole;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Detectando tu rol en el sistema...</p>
        </div>
      </div>
    );
  }

  if (error && !userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Detección</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={detectRole}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const currentRole = getCurrentRole();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Selector Header */}
      {roleInfo && (roleInfo.couldBeAssistant || roleInfo.statistics.teacherCourses > 0) && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Vista actual:</span>
              <div className="flex space-x-2">
                {roleInfo.statistics.teacherCourses > 0 && (
                  <button
                    onClick={() => handleRoleOverride('PROFESSOR')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      currentRole === 'PROFESSOR'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    👨‍🏫 Profesor ({roleInfo.statistics.teacherCourses})
                  </button>
                )}
                
                {roleInfo.couldBeAssistant && (
                  <button
                    onClick={() => handleRoleOverride('ASSISTANT')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      currentRole === 'ASSISTANT'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    👥 Asistente
                  </button>
                )}
                
                {roleInfo.statistics.studentCourses > 0 && (
                  <button
                    onClick={() => handleRoleOverride('STUDENT')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      currentRole === 'STUDENT'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🎓 Estudiante ({roleInfo.statistics.studentCourses})
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Total de cursos: {roleInfo.statistics.totalCourses}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {currentRole === 'PROFESSOR' && (
        <ProfessorDashboard user={user} role={currentRole} roleInfo={roleInfo} />
      )}
      
      {currentRole === 'ASSISTANT' && (
        <AssistantDashboard user={user} role={currentRole} roleInfo={roleInfo} />
      )}
      
      {(currentRole === 'STUDENT' || currentRole === 'VIEWER') && (
        <StudentDashboard user={user} role={currentRole} roleInfo={roleInfo} />
      )}
    </div>
  );
};

export default RoleDetector;
