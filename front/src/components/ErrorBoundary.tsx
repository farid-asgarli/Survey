import { Component, type ReactNode, type ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { useState } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center bg-surface p-4'>
          <Card variant='elevated' className='max-w-md w-full'>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-error-container'>
                  <AlertTriangle className='h-6 w-6 text-error' />
                </div>
                <div>
                  <CardTitle className='error-boundary-title'>Something went wrong</CardTitle>
                  <CardDescription className='error-boundary-desc'>An unexpected error has occurred</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {import.meta.env.DEV && this.state.error && (
                <div className='p-3 rounded-xl bg-error-container/30 border border-error/20'>
                  <p className='text-sm font-mono text-error break-all'>{this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <details className='mt-2'>
                      <summary className='text-xs text-error/70 cursor-pointer hover:text-error'>View stack trace</summary>
                      <pre className='mt-2 text-xs text-error/60 overflow-auto max-h-40'>{this.state.errorInfo.componentStack}</pre>
                    </details>
                  )}
                </div>
              )}
              {!import.meta.env.DEV && (
                <p className='text-on-surface-variant text-sm'>
                  We apologize for the inconvenience. Please try refreshing the page or go back to the home page.
                </p>
              )}
            </CardContent>
            <CardFooter className='flex gap-3'>
              <Button variant='outline' onClick={this.handleGoHome} className='flex-1'>
                <Home className='h-4 w-4 mr-2' />
                Go Home
              </Button>
              <Button onClick={this.handleRetry} className='flex-1'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { t } = useTranslation();

  return (
    <div className='min-h-screen flex items-center justify-center bg-surface p-4'>
      {/* Background decoration */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 -right-20 w-96 h-96 bg-error/5 rounded-full blur-3xl' />
        <div className='absolute -bottom-20 left-1/4 w-80 h-80 bg-error/3 rounded-full blur-3xl' />
      </div>

      <div className='relative z-10 w-full max-w-lg'>
        <Card variant='elevated' className='w-full overflow-hidden'>
          {/* Hero section */}
          <div className='relative bg-linear-to-br from-error-container/40 via-surface-container to-error-container/20 px-6 pt-10 pb-8 text-center'>
            <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-error-container border-2 border-error/30 mx-auto mb-4'>
              <AlertTriangle className='h-10 w-10 text-error' />
            </div>
            <h1 className='text-2xl font-bold text-on-surface'>{t('errorBoundary.title')}</h1>
            <p className='text-on-surface-variant mt-1'>{t('errorBoundary.description')}</p>
          </div>

          <CardContent className='p-6'>
            {/* Error details */}
            {import.meta.env.DEV && (
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
                    <pre className='text-xs font-mono text-error whitespace-pre-wrap break-all'>
                      <strong>{t('errorBoundary.message')}:</strong> {error.message}
                      {error.stack && (
                        <>
                          {'\n\n'}
                          <strong>{t('errorBoundary.stack')}:</strong>
                          {'\n'}
                          {error.stack}
                        </>
                      )}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {!import.meta.env.DEV && (
              <p className='text-on-surface-variant text-center mb-6'>We apologize for the inconvenience. Please try refreshing or go back to the home page.</p>
            )}

            {/* Actions */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
              <Button variant='outline' onClick={() => (window.location.href = '/')} className='w-full sm:w-auto'>
                <Home className='h-4 w-4 mr-2' />
                {t('errors.goHome')}
              </Button>
              <Button onClick={resetError} className='w-full sm:w-auto'>
                <RefreshCw className='h-4 w-4 mr-2' />
                {t('errors.tryAgain')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
