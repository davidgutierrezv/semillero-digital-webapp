import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { getUserRole, createOrUpdateUser } from './services/firestore';
import LoginScreen from './components/LoginScreen';
import RoleDetector from './components/RoleDetector';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          setUser(firebaseUser);
          
          // Get user role from Firestore
          let userData = await getUserRole(firebaseUser.uid);
          
          // If user doesn't exist in Firestore, create without default role
          if (!userData) {
            userData = {
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              role: null // No default role - will be determined by Google Classroom permissions
            };
            
            await createOrUpdateUser(firebaseUser.uid, userData);
          }
          
          setUserRole(userData.role);
        } catch (error) {
          console.error('Error setting up user:', error);
          setError('Error al configurar el usuario. Por favor, intenta de nuevo.');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleRoleSelected = (role) => {
    setSelectedRole(role);
    // If role is null (changing role), clear the selected role
    if (role === null) {
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} userRole={selectedRole} />
      <main className="flex-1">
        <RoleDetector user={user} onRoleSelected={handleRoleSelected} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
