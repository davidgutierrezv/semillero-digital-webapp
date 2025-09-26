import { useState, useEffect } from 'react';
import { detectUserRole, getGoogleAccessToken } from '../services/googleApi';
import StudentDashboard from '../pages/StudentDashboard';
import ProfessorDashboard from '../pages/ProfessorDashboard';
import CoordinatorDashboard from '../pages/CoordinatorDashboard';
import RoleSelector from './RoleSelector';

const RoleDetector = ({ user, onRoleSelected }) => {
  const [userRole, setUserRole] = useState(null);
  const [roleInfo, setRoleInfo] = useState(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false); // Start as false
  const [manualRoleOverride, setManualRoleOverride] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Check if user has a previously selected role
    const savedRole = localStorage.getItem('selectedRole');
    if (savedRole) {
      // Validate the saved role is still valid
      validateSavedRole(savedRole);
    } else {
      // No saved role, show selector
      setShowRoleSelector(true);
      setIsLoading(false);
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
        setIsLoading(false);
        
        // Notify parent component about role selection
        if (onRoleSelected) {
          onRoleSelected(savedRole);
        }
      } else {
        // Remove invalid saved role
        localStorage.removeItem('selectedRole');
        setShowRoleSelector(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error validating saved role:', error);
      localStorage.removeItem('selectedRole');
      setShowRoleSelector(true);
      setIsLoading(false);
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
    setIsLoading(false);
    
    // Notify parent component about role selection
    if (onRoleSelected) {
      onRoleSelected(selectedRole);
    }
  };

  const handleChangeRole = () => {
    localStorage.removeItem('selectedRole');
    setShowRoleSelector(true);
    setManualRoleOverride(null);
    setIsLoading(false);
    
    // Clear role selection in parent component
    if (onRoleSelected) {
      onRoleSelected(null);
    }
  };

  const getCurrentRole = () => {
    return manualRoleOverride || userRole;
  };

  // Show loading while validating saved role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando sesión...</p>
        </div>
      </div>
    );
  }

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
                  {currentRole === 'ASSISTANT' && 'Vista de Coordinador'}
                  {currentRole === 'STUDENT' && 'Vista de Estudiante'}
                </span>
                <div className="text-xs text-gray-500">
                  {roleInfo && currentRole && (
                    <>
                      {currentRole === 'PROFESSOR' && `${roleInfo.statistics.teacherCourses} curso(s) como profesor`}
                      {currentRole === 'ASSISTANT' && `${roleInfo.statistics.teacherCourses} curso(s) disponibles`}
                      {currentRole === 'STUDENT' && `${roleInfo.statistics.studentCourses} curso(s) como estudiante`}
                    </>
                  )}
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
        <CoordinatorDashboard user={user} role={currentRole} roleInfo={roleInfo} />
      )}
      
      {(currentRole === 'STUDENT' || currentRole === 'VIEWER') && (
        <StudentDashboard user={user} role={currentRole} roleInfo={roleInfo} />
      )}
    </div>
  );
};

export default RoleDetector;
