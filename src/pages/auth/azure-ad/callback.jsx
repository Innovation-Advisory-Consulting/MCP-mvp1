import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/azure-ad/auth-context';

export function Page() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();

  React.useEffect(() => {
    console.log('Callback - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);
    
    if (!loading) {
      if (isAuthenticated) {
        console.log('Redirigiendo a dashboard...');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('No autenticado, redirigiendo a sign-in...');
        navigate('/auth/azure-ad/sign-in', { replace: true });
      }
    }
  }, [isAuthenticated, loading, user, navigate]);

  return (
    <div style={{ padding: '20px' }}>
      <p>Procesando autenticación...</p>
      <p>Loading: {loading ? 'Sí' : 'No'}</p>
      <p>Autenticado: {isAuthenticated ? 'Sí' : 'No'}</p>
    </div>
  );
}
