import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useViewTransitionNavigate } from '@/hooks';
import { useAuthStore } from '@/stores';
import { toast, LanguageSwitcher, LogoIcon } from '@/components/ui';
import { getErrorMessage } from '@/utils';
import { useForm, FormProvider, zodResolver, type SubmitHandler } from '@/lib/form';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { DecorativeBlobs, CommunityIllustration, RegisterForm } from './sections';

/**
 * RegisterPage - M3 Expressive Design
 * User registration page with split-panel layout
 */

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const { register } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Initialize form with React Hook Form
  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (registerSuccess && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [registerSuccess, isAuthenticated, navigate]);

  const handleSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      const { email, password, firstName, lastName } = data;
      await register({ email, password, firstName, lastName });
      toast.success(t('auth.registrationSuccess'), { description: t('auth.welcomeBack') });
      setRegisterSuccess(true);
    } catch (err: unknown) {
      const message = getErrorMessage(err, t('errors.generic'));
      setError(message);
      toast.error(t('errors.generic'), { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex bg-surface'>
      {/* Language Switcher - Top Right */}
      <div className='absolute top-4 right-4 z-10'>
        <LanguageSwitcher variant='compact' />
      </div>

      {/* Left Panel - Form */}
      <div className='flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto'>
        <div className='w-full max-w-md'>
          {/* Logo & Welcome */}
          <div className='text-center mb-8'>
            <div className='inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-tertiary to-tertiary/80 shadow-lg shadow-tertiary/25 mb-6'>
              <LogoIcon size='lg' className='h-10 w-10' />
            </div>
            <h1 className='text-3xl sm:text-4xl font-bold text-on-surface mb-2'>{t('auth.createAccount')}</h1>
            <p className='text-on-surface-variant text-lg'>{t('auth.joinUs', 'Join thousands of teams creating better surveys')}</p>
          </div>

          {/* Form */}
          <FormProvider {...methods}>
            <RegisterForm onSubmit={methods.handleSubmit(handleSubmit)} isLoading={isLoading} error={error} />
          </FormProvider>
        </div>
      </div>

      {/* Right Panel - Illustration (Hidden on mobile) */}
      <div className='hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-linear-to-bl from-surface via-tertiary-container/20 to-primary-container/30 items-center justify-center p-12'>
        <DecorativeBlobs />

        <div className='relative z-10 text-center max-w-lg'>
          <CommunityIllustration />

          <h2 className='text-3xl xl:text-4xl font-bold text-on-surface mt-8 mb-4'>{t('auth.registerIllustrationTitle', 'Join our community')}</h2>
          <p className='text-lg text-on-surface-variant'>
            {t('auth.registerIllustrationSubtitle', 'Create, distribute, and analyze surveys with powerful tools designed for teams.')}
          </p>
        </div>
      </div>

      {/* Custom animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
