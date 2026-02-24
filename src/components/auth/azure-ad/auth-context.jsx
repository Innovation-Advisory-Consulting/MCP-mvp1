import * as React from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { graphConfig, loginRequest } from '@/lib/azure-ad/config';

export const AuthContext = React.createContext(undefined);

export function AuthProvider({ children }) {
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [redirectHandled, setRedirectHandled] = React.useState(false);

  const fetchUserProfile = React.useCallback(async () => {
    if (accounts.length === 0) {
      setUser(null);
      setLoading(false);
      setIsInitialized(true);
      return null;
    }

    try {
      const account = accounts[0];
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      const profileResponse = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });
      const profile = await profileResponse.json();

      let photoUrl = null;
      try {
        const photoResponse = await fetch(graphConfig.graphPhotoEndpoint, {
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        });
        if (photoResponse.ok) {
          const photoBlob = await photoResponse.blob();
          photoUrl = URL.createObjectURL(photoBlob);
        }
      } catch (photoError) {
        console.warn('Unable to fetch user photo:', photoError);
      }

      const userData = {
        id: profile.id,
        name: profile.displayName,
        email: profile.mail || profile.userPrincipalName,
        avatar: photoUrl,
      };

      setUser(userData);
      setLoading(false);
      setIsInitialized(true);
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setLoading(false);
      setIsInitialized(true);
      return null;
    }
  }, [accounts, instance]);

  React.useEffect(() => {
    if (!redirectHandled) {
      instance.handleRedirectPromise()
        .then((response) => {
          setRedirectHandled(true);
          if (response && response.account) {
            instance.setActiveAccount(response.account);
          }
        })
        .catch((error) => {
          console.error('Redirect error:', error);
          setRedirectHandled(true);
          setLoading(false);
          setIsInitialized(true);
        });
    }
  }, [instance, redirectHandled]);

  React.useEffect(() => {
    if (redirectHandled && inProgress === InteractionStatus.None && !isInitialized) {
      fetchUserProfile();
    }
  }, [redirectHandled, inProgress, isInitialized, fetchUserProfile]);

  const signIn = React.useCallback(async () => {
    try {
      setLoading(true);
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    }
  }, [instance]);

  const signOut = React.useCallback(async () => {
    try {
      setUser(null);
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin + '/auth/azure-ad/sign-in',
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [instance]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context.user || { name: '', email: '', avatar: null };
}
