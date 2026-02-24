import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { CenteredLayout } from '@/components/auth/centered-layout';
import { SignInForm } from '@/components/auth/azure-ad/sign-in-form';
import { useAuth } from '@/components/auth/azure-ad/auth-context';

const metadata = { title: 'Sign In | Azure AD' };

export function Page() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <CenteredLayout>
        <SignInForm />
      </CenteredLayout>
    </>
  );
}
