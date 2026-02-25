import { Outlet } from 'react-router-dom';

export const azureAdRoutes = [
  {
    path: 'azure-ad',
    element: <Outlet />,
    children: [
      {
        path: 'sign-in',
        lazy: async () => {
          const { Page } = await import('@/pages/auth/azure-ad/sign-in');
          return { Component: Page };
        },
      },
      {
        path: 'callback',
        lazy: async () => {
          const { Page } = await import('@/pages/auth/azure-ad/callback');
          return { Component: Page };
        },
      },
    ],
  },
];
