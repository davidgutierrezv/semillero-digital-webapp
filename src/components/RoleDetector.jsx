import { useState, useEffect } from 'react';
import { detectUserRole, getGoogleAccessToken } from '../services/googleApi';
import StudentDashboard from '../pages/StudentDashboard';
import ProfessorDashboard from '../pages/ProfessorDashboard';
import AssistantDashboard from '../pages/AssistantDashboard';
import RoleSelector from './RoleSelector';

const RoleDetector = ({ user }) => {
  const [userRole, setUserRole] = useState(null);
  const [roleInfo, setRoleInfo] = useState(null);
  const [showRoleSelector, setShowRoleSelector] = useState(true);
  const [manualRoleOverride, setManualRoleOverride] = useState(null);

  useEffect(() => {
    // Check if user has a previously selected role
    const savedRole = localStorage.getItem('selectedRole');
    if (savedRole) {
      // Validate the saved role is still valid
      validateSavedRole(savedRole);
    }
  }, [user]);

  const validateSavedRole = async (savedRole) => {
    try {
      const accessToken = getGoogleAccessToken();
      const roleData = await detectUserRole(accessToken);
      
      // Check if saved role is still valid
      const isValid = await validateRoleAccess(savedRole, roleData);
      
      if (isValid) {
        setUserRole(savedRole);
        setRoleInfo(roleData);
        setShowRoleSelector(false);
      } else {
        // Remove invalid saved role
        localStorage.removeItem('selectedRole');
        setShowRoleSelector(true);
      }
    } catch (error) {
      console.error('Error validating saved role:', error);
      localStorage.removeItem('selectedRole');
      setShowRoleSelector(true);
    }
  };

  const validateRoleAccess = (roleId, roleData) => {
    switch (roleId) {
      case 'STUDENT':
        return roleData.statistics.studentCourses > 0;
      case 'PROFESSOR':
        return roleData.statistics.teacherCourses > 0;
      case 'ASSISTANT':
        return roleData.statistics.teacherCourses > 0;
      default:
        return false;
    }
  };

  const handleRoleOverride = (newRole) => {
    setManualRoleOverride(newRole);
  };

  const handleRoleSelected = (selectedRole, roleData) => {
    setUserRole(selectedRole);
    setRoleInfo(roleData);
    setShowRoleSelector(false);
  };

  const handleChangeRole = () => {
    localStorage.removeItem('selectedRole');
    setShowRoleSelector(true);
    setManualRoleOverride(null);
  };

  const getCurrentRole = () => {
    return manualRoleOverride || userRole;
  };

  // Show role selector if needed
  if (showRoleSelector) {
    return <RoleSelector user={user} onRoleSelected={handleRoleSelected} />;
  }

  const currentRole = getCurrentRole();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {currentRole === 'PROFESSOR' && '👨‍🏫'}
                {currentRole === 'ASSISTANT' && '👥'}
                {currentRole === 'STUDENT' && '🎓'}
              </span>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {currentRole === 'PROFESSOR' && 'Vista de Profesor'}
                  {currentRole === 'ASSISTANT' && 'Vista de Asistente'}
                  {currentRole === 'STUDENT' && 'Vista de Estudiante'}
                </span>
                <div className="text-xs text-gray-500">
                  {roleInfo && `${roleInfo.statistics.totalCourses} curso(s) total`}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleChangeRole}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Cambiar rol
          </button>
        </div>
      </div>

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
