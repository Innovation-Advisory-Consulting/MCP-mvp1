import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from './auth-context';

export function SignInForm() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async () => {
    setIsPending(true);
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Stack spacing={4}>
      <div>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h5">Sign in with Azure AD</Typography>
        </Box>
        <Typography color="text.secondary" variant="body2">
          Sign in with your Microsoft account
        </Typography>
      </div>
      <Stack spacing={3}>
        <Button
          disabled={isPending}
          fullWidth
          onClick={handleSignIn}
          size="large"
          variant="contained"
        >
          {isPending ? 'Signing in...' : 'Sign in with Microsoft'}
        </Button>
      </Stack>
    </Stack>
  );
}
