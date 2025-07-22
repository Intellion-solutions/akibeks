
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Shield } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, sessionExpiry } = useAdmin();

  useEffect(() => {
    const checkAuth = () => {
      console.log('AuthGuard checking auth:', { isAuthenticated, requireAuth, sessionExpiry });
      
      // Check if session has expired
      if (sessionExpiry && new Date() > sessionExpiry) {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_session_expiry');
        if (requireAuth) {
          navigate('/admin-access');
        }
        setIsChecking(false);
        return;
      }
      
      if (requireAuth && !isAuthenticated) {
        navigate('/admin-access');
      } else if (!requireAuth && isAuthenticated) {
        navigate('/admin');
      }
      
      setIsChecking(false);
    };

    // Add a small delay to prevent flash
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, [navigate, requireAuth, isAuthenticated, sessionExpiry]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-2" />
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
