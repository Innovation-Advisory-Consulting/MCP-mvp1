import * as React from 'react';
import Button from '@mui/material/Button';
import { useAuth } from '@/components/auth/azure-ad/auth-context';

export function AzureAdSignOut() {
  const { signOut } = useAuth();
  const [isPending, setIsPending] = React.useState(false);

  const handleSignOut = React.useCallback(async () => {
    setIsPending(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsPending(false);
    }
  }, [signOut]);

  return (
    <Button color="secondary" disabled={isPending} onClick={handleSignOut} size="small">
      Sign out
    </Button>
  );
}
