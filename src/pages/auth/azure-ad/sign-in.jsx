import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { CenteredLayout } from '@/components/auth/centered-layout';
import { SignInForm } from '@/components/auth/azure-ad/sign-in-form';

const metadata = { title: 'Sign In | Azure AD' };

export function Page() {
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
