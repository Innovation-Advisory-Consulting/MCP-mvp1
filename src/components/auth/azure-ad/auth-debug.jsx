import * as React from 'react';
import { useAuth } from '@/components/auth/azure-ad/auth-context';

export function AuthDebug() {
  const auth = useAuth();
  
  React.useEffect(() => {
    console.log('=== AUTH DEBUG ===');
    console.log('User:', auth.user);
    console.log('Loading:', auth.loading);
    console.log('IsAuthenticated:', auth.isAuthenticated);
    console.log('==================');
  }, [auth]);

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h3>Auth Debug Info</h3>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
}
