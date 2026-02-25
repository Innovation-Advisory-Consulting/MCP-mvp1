import { useAuth as useAzureAd } from '@/components/auth/azure-ad/auth-context';
import { appConfig } from '@/config/app';
import { AuthStrategy } from '@/lib/auth-strategy';

export function useUser() {
  if (appConfig.authStrategy === AuthStrategy.AZURE_AD) {
    const { user } = useAzureAd();
    return user;
  }

  return null;
}
