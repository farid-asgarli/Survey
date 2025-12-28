import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Button, toast } from '@/components/ui';
import { useViewTransitionNavigate } from '@/hooks';
import { FileText, ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getErrorMessage } from '@/utils';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      await forgotPassword({ email: data.email });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success(t('forgotPassword.toast.success'), { description: t('forgotPassword.toast.successDescription') });
    } catch (err: unknown) {
      const message = getErrorMessage(err, t('forgotPassword.toast.error'));
      setError(message);
      toast.error(t('forgotPassword.toast.requestFailed'), { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-container border border-success/20 mb-4">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">{t('forgotPassword.emailSent.title')}</h1>
          </div>

          <Card variant="elevated" className="p-2">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-success" />
              </div>
              <p className="text-on-surface-variant mb-4">
                {t('forgotPassword.emailSent.description')} <strong className="text-on-surface">{submittedEmail}</strong>
              </p>
              <p className="text-on-surface-variant text-sm mb-4">{t('forgotPassword.emailSent.expiry')}</p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setError('');
                  reset();
                }}
                className="text-sm text-primary hover:underline"
              >
                {t('forgotPassword.emailSent.tryAgain')}
              </button>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('auth.backToLogin')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container border border-primary/20 mb-4">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{t('forgotPassword.title')}</h1>
          <p className="text-on-surface-variant">{t('forgotPassword.subtitle')}</p>
        </div>

        <Card variant="elevated" className="p-2">
          <CardHeader>
            <CardTitle>{t('forgotPassword.cardTitle')}</CardTitle>
            <CardDescription>{t('forgotPassword.cardDescription')}</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-error-container text-on-error-container text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label={t('auth.email')}
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                error={touchedFields.email ? errors.email?.message : undefined}
                autoComplete="email"
                autoFocus
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" loading={isLoading}>
                {t('forgotPassword.sendResetLink')}
              </Button>
              <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                {t('auth.backToLogin')}
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
