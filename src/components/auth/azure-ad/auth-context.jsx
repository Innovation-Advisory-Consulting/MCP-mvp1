import * as React from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { graphConfig, loginRequest } from '@/lib/azure-ad/config';

export const AuthContext = React.createContext(undefined);

export function AuthProvider({ children }) {
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchUserProfile = React.useCallback(async () => {
    if (accounts.length === 0) {
      setUser(null);
      setLoading(false);
      return;
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

      setUser({
        id: profile.id,
        name: profile.displayName,
        email: profile.mail || profile.userPrincipalName,
        avatar: photoUrl,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [accounts, instance]);

  React.useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      fetchUserProfile();
    }
  }, [inProgress, fetchUserProfile]);

  const signIn = React.useCallback(async () => {
    try {
      const result = await instance.loginPopup(loginRequest);
      // Immediately fetch user profile after successful login
      if (result) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [instance, fetchUserProfile]);

  const signOut = React.useCallback(async () => {
    try {
      await instance.logoutPopup();
      setUser(null);
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
