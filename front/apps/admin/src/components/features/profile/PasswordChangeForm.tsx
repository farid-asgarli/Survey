import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Check, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button, toast } from '@/components/ui';
import { useChangePassword } from '@/hooks';
import { getPasswordRequirements, calculatePasswordStrength } from '@/lib/validations';
import { cn } from '@/lib/utils';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations';

interface PasswordChangeFormProps {
  className?: string;
}

export function PasswordChangeForm({ className }: PasswordChangeFormProps) {
  const { t } = useTranslation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, touchedFields, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const newPassword = watch('newPassword') || '';
  const confirmPassword = watch('confirmPassword') || '';

  const rawPasswordRequirements = getPasswordRequirements(newPassword);
  const rawPasswordStrength = calculatePasswordStrength(newPassword);

  // Translate password requirements labels
  const passwordRequirements = useMemo(() => {
    const requirementKeys = [
      'password.requirements.minLength',
      'password.requirements.uppercase',
      'password.requirements.lowercase',
      'password.requirements.number',
      'password.requirements.special',
    ];
    return rawPasswordRequirements.map((req, index) => ({
      ...req,
      label: t(requirementKeys[index]),
    }));
  }, [rawPasswordRequirements, t]);

  // Translate password strength label
  const passwordStrength = useMemo(() => {
    const strengthKeys: Record<string, string> = {
      'Very weak': 'password.strength.veryWeak',
      Weak: 'password.strength.weak',
      Fair: 'password.strength.fair',
      Good: 'password.strength.good',
      Strong: 'password.strength.strong',
    };
    return {
      ...rawPasswordStrength,
      label: t(strengthKeys[rawPasswordStrength.label] || rawPasswordStrength.label),
    };
  }, [rawPasswordStrength, t]);

  const onSubmit: SubmitHandler<ChangePasswordFormData> = async (data) => {
    setSuccess(false);

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      reset();
      setSuccess(true);
      toast.success(t('password.toast.success'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || t('password.toast.failed');
      toast.error(t('password.toast.failedTitle'), { description: message });
    }
  };

  const handleReset = () => {
    reset();
    setSuccess(false);
  };

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <CardTitle>{t('password.title')}</CardTitle>
        <CardDescription>{t('password.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-success-container text-on-success-container flex items-center gap-2">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{t('password.successMessage')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="relative">
            <Input
              label={t('password.currentPassword')}
              type={showCurrentPassword ? 'text' : 'password'}
              {...register('currentPassword')}
              error={touchedFields.currentPassword ? errors.currentPassword?.message : undefined}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-on-surface-variant hover:text-on-surface transition-colors"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                label={t('password.newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                error={touchedFields.newPassword ? errors.newPassword?.message : undefined}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={cn('h-full transition-all duration-300', passwordStrength.color)}
                      style={{ width: `${((passwordStrength.score + 1) / 5) * 100}%` }}
                    />
                  </div>
                  <span className={cn('text-xs font-medium', passwordStrength.score >= 3 ? 'text-success' : 'text-on-surface-variant')}>
                    {passwordStrength.label}
                  </span>
                </div>

                {/* Password Requirements */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className={cn('flex items-center gap-1.5', req.met ? 'text-success' : 'text-on-surface-variant')}>
                      {req.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <Input
              label={t('password.confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={touchedFields.confirmPassword ? errors.confirmPassword?.message : undefined}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-on-surface-variant hover:text-on-surface transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>

            {/* Match indicator */}
            {confirmPassword && newPassword && (
              <div className="absolute right-12 top-9">
                {confirmPassword === newPassword ? <Check className="h-5 w-5 text-success" /> : <AlertCircle className="h-5 w-5 text-error" />}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {isDirty && (
              <Button type="button" variant="outline" onClick={handleReset} disabled={changePasswordMutation.isPending}>
                {t('common.cancel')}
              </Button>
            )}
            <Button type="submit" disabled={changePasswordMutation.isPending || !isDirty}>
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('password.updating')}
                </>
              ) : (
                t('password.updatePassword')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
