import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';

export function AuthGuard({ children }) {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        navigate('/auth/azure-ad/sign-in', { replace: true });
      } else {
        setChecked(true);
      }
    }
  }, [user, loading, isAuthenticated, navigate]);

  if (loading || !checked) {
    return null;
  }

  return <>{children}</>;
}
