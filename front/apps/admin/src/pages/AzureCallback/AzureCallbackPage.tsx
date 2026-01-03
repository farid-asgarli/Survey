import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAzureAuth } from '@/hooks/useAzureAuth';
import { LoadingSpinner, Button } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

/**
 * Azure AD OAuth callback page.
 * Handles the redirect from Azure AD and completes the authentication flow.
 */
export function AzureCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleAzureAdCallback, error, isLoading } = useAzureAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [callbackError, setCallbackError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await handleAzureAdCallback();
        if (result) {
          // Success - redirect to dashboard
          navigate('/', { replace: true });
        } else if (!isLoading) {
          // No result and not loading - might be a direct navigation
          // Check if there's an error in URL params
          const urlParams = new URLSearchParams(window.location.search);
          const errorDescription = urlParams.get('error_description');
          if (errorDescription) {
            setCallbackError(errorDescription);
          } else {
            // No error, might be direct navigation - redirect to login
            navigate('/login', { replace: true });
          }
        }
      } catch (err) {
        setCallbackError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [handleAzureAdCallback, navigate, isLoading]);

  const displayError = callbackError || error;

  if (displayError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-surface p-4'>
        <div className='w-full max-w-md text-center'>
          <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-container'>
            <AlertCircle className='h-8 w-8 text-on-error-container' />
          </div>
          <h1 className='text-2xl font-bold text-on-surface mb-2'>{t('auth.authenticationFailed', 'Authentication Failed')}</h1>
          <p className='text-on-surface-variant mb-6'>{displayError}</p>
          <Button onClick={() => navigate('/login', { replace: true })} variant='filled'>
            {t('auth.returnToLogin', 'Return to Login')}
          </Button>
        </div>
      </div>
    );
  }

  if (isProcessing || isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-surface'>
        <div className='text-center'>
          <LoadingSpinner size='lg' className='mx-auto mb-4' />
          <p className='text-on-surface-variant text-lg'>{t('auth.completingSignIn', 'Completing sign in...')}</p>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here normally
  return null;
}

export default AzureCallbackPage;
