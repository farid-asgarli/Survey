import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, useViewTransitionNavigate } from '@/hooks';
import { useAuthStore } from '@/stores';
import { toast, LanguageSwitcher } from '@/components/ui';
import { getErrorMessage } from '@/utils';
import { useForm, FormProvider, zodResolver, type SubmitHandler } from '@/lib/form';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { LoginForm, IllustrationPanel } from './sections';

/**
 * LoginPage Component
 *
 * Main login page with two-panel layout:
 * - Left: Illustration panel with marketing content (hidden on mobile)
 * - Right: Login form
 */

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Initialize form with React Hook Form
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('survey_remember_me') === 'true' ? localStorage.getItem('survey_saved_email') || '' : '',
      password: '',
      rememberMe: localStorage.getItem('survey_remember_me') === 'true',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (loginSuccess && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [loginSuccess, isAuthenticated, navigate, from]);

  const handleSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      await login({ email: data.email, password: data.password, rememberMe: data.rememberMe ?? false });

      if (data.rememberMe) {
        localStorage.setItem('survey_remember_me', 'true');
        localStorage.setItem('survey_saved_email', data.email);
      } else {
        localStorage.removeItem('survey_remember_me');
        localStorage.removeItem('survey_saved_email');
      }

      toast.success(t('auth.welcomeBack'));
      setLoginSuccess(true);
    } catch (err: unknown) {
      const message = getErrorMessage(err, t('auth.invalidCredentials'));
      setError(message);
      toast.error(t('auth.loginFailed'), { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="compact" />
      </div>

      {/* Left Panel - Illustration */}
      <IllustrationPanel />

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <FormProvider {...methods}>
          <LoginForm isLoading={isLoading} error={error} onSubmit={methods.handleSubmit(handleSubmit)} />
        </FormProvider>
      </div>

      {/* Custom animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--rotate, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--rotate, 0deg)); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
