import { useTranslation } from 'react-i18next';
import { useAzureAuth } from '@/hooks/useAzureAuth';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AzureAdLoginButtonProps {
  className?: string;
  fullWidth?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Microsoft/Azure AD SSO login button.
 * Only renders when Azure AD authentication is enabled.
 */
export function AzureAdLoginButton({ className, fullWidth, onSuccess, onError }: AzureAdLoginButtonProps) {
  const { t } = useTranslation();
  const { isAzureAdEnabled, isLoading, loginWithAzureAd, error } = useAzureAuth();

  // Don't render if Azure AD is not enabled
  if (!isAzureAdEnabled) {
    return null;
  }

  const handleClick = async () => {
    const result = await loginWithAzureAd();
    if (result) {
      onSuccess?.();
    } else if (error) {
      onError?.(error);
    }
  };

  return (
    <Button type='button' variant='outline' onClick={handleClick} disabled={isLoading} className={cn('gap-3', fullWidth && 'w-full', className)}>
      {/* Microsoft Logo */}
      <svg className='h-5 w-5 shrink-0' viewBox='0 0 21 21' xmlns='http://www.w3.org/2000/svg'>
        <rect x='1' y='1' width='9' height='9' fill='#f25022' />
        <rect x='11' y='1' width='9' height='9' fill='#7fba00' />
        <rect x='1' y='11' width='9' height='9' fill='#00a4ef' />
        <rect x='11' y='11' width='9' height='9' fill='#ffb900' />
      </svg>
      <span>{isLoading ? t('auth.signingIn', 'Signing in...') : t('auth.signInWithMicrosoft', 'Sign in with Microsoft')}</span>
    </Button>
  );
}
