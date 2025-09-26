import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import SemilleroLogo from './SemilleroLogo';

const Header = ({ user, userRole }) => {
  const handleSignOut = async () => {
    try {
      // Clear Google access token
      localStorage.removeItem('googleAccessToken');
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      // Legacy roles
      student: 'Estudiante',
      assistant: 'Coordinador',
      professor: 'Profesor',
      coordinator: 'Coordinador',
      // New roles
      'STUDENT': 'Estudiante',
      'ASSISTANT': 'Coordinador',
      'PROFESSOR': 'Profesor',
      'COORDINATOR': 'Coordinador'
    };
    return roleNames[role] || 'Usuario';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      // Legacy roles
      student: 'bg-blue-100 text-blue-800',
      assistant: 'bg-green-100 text-green-800',
      professor: 'bg-purple-100 text-purple-800',
      coordinator: 'bg-red-100 text-red-800',
      // New roles
      'STUDENT': 'bg-blue-100 text-blue-800',
      'ASSISTANT': 'bg-green-100 text-green-800',
      'PROFESSOR': 'bg-purple-100 text-purple-800',
      'COORDINATOR': 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <SemilleroLogo size="md" showText={true} />

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            {userRole && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(userRole)}`}>
                {getRoleDisplayName(userRole)}
              </span>
            )}

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Cerrar Sesión"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
