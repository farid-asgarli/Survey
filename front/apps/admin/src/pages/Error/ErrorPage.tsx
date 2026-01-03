import { ServerCrash, RefreshCw, Home, Bug, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { useViewTransitionNavigate } from '@/hooks';
import { getCurrentISOTimestamp } from '@/utils';

interface ErrorPageProps {
  error?: Error | unknown;
  resetErrorBoundary?: () => void;
}

// Generate a unique error ID outside of render
let errorIdCounter = 0;
function generateErrorId() {
  return `ERR-${(++errorIdCounter).toString(16).padStart(4, '0').toUpperCase()}`;
}

// Helper to format error for display
function formatErrorForDisplay(error: unknown): string {
  if (error instanceof Error) {
    let result = `Message: ${error.message}`;
    if (error.stack) {
      result += `\n\nStack:\n${error.stack}`;
    }
    return result;
  }
  if (typeof error === 'object' && error !== null) {
    return JSON.stringify(error, null, 2);
  }
  return String(error);
}

export function ErrorPage({ error: propError, resetErrorBoundary }: ErrorPageProps) {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const routeError = useRouteError();
  const [showDetails, setShowDetails] = useState(false);
  // Use lazy initial state to generate error ID once
  const [errorId] = useState(generateErrorId);

  // Use prop error or route error
  const error = propError || routeError;

  // Determine error type and message
  let statusCode = 500;
  let title = t('errors.serverError');
  let message = t('errors.serverErrorDesc');

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      title = t('errors.notFound');
      message = t('errors.notFoundDesc');
    } else if (error.status === 403) {
      title = t('errors.accessDenied');
      message = t('errors.accessDeniedDesc');
    } else if (error.status === 401) {
      title = t('errors.unauthorized');
      message = t('errors.unauthorizedDesc');
    }
  } else if (error instanceof Error) {
    message = import.meta.env.DEV ? error.message : t('errors.serverErrorDesc');
  }

  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReportBug = () => {
    // In a real app, this would open a bug report form or email
    const subject = encodeURIComponent(`Bug Report: ${title}`);
    const body = encodeURIComponent(
      `Error: ${title}\nURL: ${window.location.href}\nTime: ${getCurrentISOTimestamp()}\n\nPlease describe what you were doing when this error occurred:\n\n`
    );
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-surface p-4'>
      {/* Background decoration */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 -right-20 w-96 h-96 bg-error/5 rounded-full blur-3xl' />
        <div className='absolute -bottom-20 left-1/4 w-80 h-80 bg-error/3 rounded-full blur-3xl' />
      </div>

      <div className='relative z-10 w-full max-w-lg'>
        <Card variant='elevated' className='w-full overflow-hidden'>
          {/* Hero section with error styling */}
          <div className='relative bg-linear-to-br from-error-container/40 via-surface-container to-error-container/20 px-6 pt-10 pb-8 text-center'>
            {/* Error icon with pulse animation */}
            <div className='relative mx-auto mb-6'>
              <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-error-container border-2 border-error/30 mx-auto'>
                <ServerCrash className='h-10 w-10 text-error' />
              </div>
              {/* Pulse rings */}
              <div className='absolute inset-0 -m-2 rounded-3xl border-2 border-error/20 animate-ping' style={{ animationDuration: '2s' }} />
            </div>

            {/* Status code */}
            <div className='text-6xl font-black text-error/20 select-none mb-1'>{statusCode}</div>
            <h1 className='text-2xl font-bold text-on-surface -mt-6'>{title}</h1>
          </div>

          <CardContent className='p-6'>
            <p className='text-on-surface-variant text-center mb-6'>{message}</p>

            {/* Error details for development */}
            {import.meta.env.DEV && error != null && (
              <div className='mb-6'>
                <button
                  type='button'
                  onClick={() => setShowDetails(!showDetails)}
                  className='flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors w-full justify-center'
                >
                  <Bug className='h-4 w-4' />
                  {showDetails ? t('errors.hideDetails') : t('errors.showDetails')}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                </button>
                {showDetails && (
                  <div className='mt-3 p-4 rounded-xl bg-error-container/30 border border-error/20 overflow-auto max-h-48'>
                    <pre className='text-xs font-mono text-error whitespace-pre-wrap break-all'>{formatErrorForDisplay(error)}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
              <Button variant='outline' onClick={handleGoHome} className='w-full sm:w-auto'>
                <Home className='h-4 w-4 mr-2' />
                {t('errors.goHome')}
              </Button>
              <Button onClick={handleRetry} className='w-full sm:w-auto'>
                <RefreshCw className='h-4 w-4 mr-2' />
                {t('errors.tryAgain')}
              </Button>
            </div>

            {/* Report bug option */}
            <div className='mt-6 pt-6 border-t border-outline-variant/30 text-center'>
              <p className='text-sm text-on-surface-variant mb-3'>{t('errors.thinkBug')}</p>
              <Button variant='text' size='sm' onClick={handleReportBug}>
                <Bug className='h-4 w-4 mr-2' />
                {t('errors.reportIssue')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className='text-center text-xs text-on-surface-variant/60 mt-6'>
          {t('errors.errorId')}: {errorId}
        </p>
      </div>
    </div>
  );
}

// Wrapper for use as React Router errorElement
export function RouteErrorPage() {
  return <ErrorPage />;
}
