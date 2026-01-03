import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Button } from '@/components/ui';
import { FileText, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { resetPasswordSchema, type ResetPasswordFormData, getPasswordRequirements } from '@/lib/validations';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { PasswordRequirements } from './PasswordRequirements';

interface ResetPasswordFormProps {
  email: string;
  onSubmit: (password: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export function ResetPasswordForm({ email, onSubmit, isLoading, error }: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const password = watch('password');
  const passwordRequirements = getPasswordRequirements(password || '');
  const allRequirementsMet = passwordRequirements.every((r) => r.met);

  const handleFormSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!allRequirementsMet) return;
    await onSubmit(data.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container border border-primary/20 mb-4">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{t('resetPassword.title')}</h1>
          <p className="text-on-surface-variant">
            {t('resetPassword.subtitle')} <strong>{email}</strong>
          </p>
        </div>

        <Card variant="elevated" className="p-2">
          <CardHeader>
            <CardTitle>{t('resetPassword.newPassword')}</CardTitle>
            <CardDescription>{t('resetPassword.description')}</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-error-container text-on-error-container text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <Input
                  label={t('resetPassword.newPasswordLabel')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('resetPassword.newPasswordPlaceholder')}
                  {...register('password')}
                  autoComplete="new-password"
                  autoFocus
                  endIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-on-surface-variant hover:text-on-surface">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />

                {/* Password strength and requirements */}
                {password && (
                  <div className="mt-2 space-y-2">
                    <PasswordStrengthIndicator password={password} />
                    <PasswordRequirements password={password} />
                  </div>
                )}
              </div>

              <Input
                label={t('resetPassword.confirmPasswordLabel')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                {...register('confirmPassword')}
                error={touchedFields.confirmPassword ? errors.confirmPassword?.message : undefined}
                autoComplete="new-password"
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" loading={isLoading}>
                {t('resetPassword.submit')}
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
