import { Outlet } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { msalConfig } from '@/lib/azure-ad/config';
import { AuthProvider } from '@/components/auth/azure-ad/auth-context';

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(() => {
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
      const account = event.payload.account;
      msalInstance.setActiveAccount(account);
    }
  });

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }
});

export const azureAdRoutes = [
  {
    path: 'azure-ad',
    element: (
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </MsalProvider>
    ),
    children: [
      {
        path: 'sign-in',
        lazy: async () => {
          const { Page } = await import('@/pages/auth/azure-ad/sign-in');
          return { Component: Page };
        },
      },
    ],
  },
];
