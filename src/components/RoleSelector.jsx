import { useState, useEffect } from 'react';
import { detectUserRole, getGoogleAccessToken } from '../services/googleApi';

const RoleSelector = ({ user, onRoleSelected }) => {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleInfo, setRoleInfo] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    detectAvailableRoles();
  }, [user]);

  const detectAvailableRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = getGoogleAccessToken();
      const roleData = await detectUserRole(accessToken);
      
      console.log('Role detection result:', roleData);
      setRoleInfo(roleData);

      // Determine which roles are available
      const roles = [];
      
      if (roleData.statistics.studentCourses > 0) {
        roles.push({
          id: 'STUDENT',
          name: 'Estudiante',
          description: `Acceso a ${roleData.statistics.studentCourses} curso(s) como estudiante`,
          icon: '🎓',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          hoverColor: 'hover:bg-blue-100'
        });
      }

      if (roleData.statistics.teacherCourses > 0) {
        roles.push({
          id: 'PROFESSOR',
          name: 'Profesor',
          description: `Gestión de ${roleData.statistics.teacherCourses} curso(s) como profesor`,
          icon: '👨‍🏫',
          color: 'bg-green-50 border-green-200 text-green-800',
          hoverColor: 'hover:bg-green-100'
        });

        // If user is teacher, they can also be assistant
        roles.push({
          id: 'ASSISTANT',
          name: 'Asistente',
          description: 'Vista especializada para asistentes de cátedra',
          icon: '👥',
          color: 'bg-purple-50 border-purple-200 text-purple-800',
          hoverColor: 'hover:bg-purple-100'
        });
      }

      setAvailableRoles(roles);
      
      // Auto-select if only one role available
      if (roles.length === 1) {
        setSelectedRole(roles[0].id);
      }

    } catch (error) {
      console.error('Error detecting available roles:', error);
      setError('Error al detectar los roles disponibles. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (roleId) => {
    if (validating) return;

    try {
      setValidating(true);
      setError(null);

      // Validate that user actually has permissions for this role
      const isValid = await validateRoleAccess(roleId);
      
      if (isValid) {
        // Store role selection in localStorage for persistence
        localStorage.setItem('selectedRole', roleId);
        onRoleSelected(roleId, roleInfo);
      } else {
        setError(`No tienes permisos suficientes para acceder como ${availableRoles.find(r => r.id === roleId)?.name}`);
      }
    } catch (error) {
      console.error('Error validating role:', error);
      setError('Error al validar el rol. Por favor, intenta de nuevo.');
    } finally {
      setValidating(false);
    }
  };

  const validateRoleAccess = async (roleId) => {
    if (!roleInfo) return false;

    switch (roleId) {
      case 'STUDENT':
        return roleInfo.statistics.studentCourses > 0;
      
      case 'PROFESSOR':
        return roleInfo.statistics.teacherCourses > 0;
      
      case 'ASSISTANT':
        // Assistant must be a teacher in at least one course
        return roleInfo.statistics.teacherCourses > 0;
      
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Detectando tus roles disponibles...</p>
        </div>
      </div>
    );
  }

  if (error && availableRoles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Detección</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={detectAvailableRoles}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user.displayName?.split(' ')[0] || 'Usuario'}!
          </h1>
          <p className="text-gray-600">
            Selecciona tu rol para acceder al sistema
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelection(role.id)}
              disabled={validating}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 text-left
                ${role.color} ${role.hoverColor}
                ${selectedRole === role.id ? 'ring-2 ring-primary-500' : ''}
                ${validating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                hover:shadow-md hover:scale-105
              `}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{role.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{role.name}</h3>
                <p className="text-sm opacity-80">{role.description}</p>
              </div>
              
              {validating && selectedRole === role.id && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span className="ml-2 text-xs">Validando...</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {availableRoles.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron roles</h3>
            <p className="text-gray-600 mb-4">
              No tienes acceso a ningún curso en Google Classroom.
            </p>
            <button 
              onClick={detectAvailableRoles}
              className="btn-primary"
            >
              Volver a verificar
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Los roles disponibles se basan en tus permisos en Google Classroom
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
