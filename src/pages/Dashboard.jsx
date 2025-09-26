import ProfessorDashboard from './ProfessorDashboard';
import AssistantDashboard from './AssistantDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = ({ user, role }) => {
  const renderDashboard = () => {
    switch (role) {
      case 'professor':
      case 'coordinator':
        return <ProfessorDashboard user={user} role={role} />;
      case 'assistant':
        return <AssistantDashboard user={user} role={role} />;
      case 'student':
        return <StudentDashboard user={user} role={role} />;
      default:
        return (
          <div className="text-center py-12">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Rol no reconocido</p>
              <p className="text-sm">
                Tu rol actual es "{role}". Contacta al administrador para obtener los permisos correctos.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user?.displayName || user?.email}!
        </h2>
        <p className="text-gray-600">
          Este es tu dashboard personalizado para gestionar las actividades del Semillero Digital.
        </p>
      </div>

      {/* Role-specific Dashboard */}
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
