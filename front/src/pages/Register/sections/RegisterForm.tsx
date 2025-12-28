import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input, Button } from '@/components/ui';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useFormContext } from '@/lib/form';
import type { RegisterFormData } from '@/lib/validations';

interface RegisterFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string;
}

/**
 * RegisterForm
 * Main registration form using React Hook Form
 */
export function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    formState: { errors, touchedFields },
    watch,
  } = useFormContext<RegisterFormData>();
  const password = watch('password');

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-error-container/80 text-on-error-container animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('register.firstName')}
          type="text"
          variant="filled"
          placeholder={t('register.firstNamePlaceholder')}
          {...register('firstName')}
          error={touchedFields.firstName ? errors.firstName?.message : undefined}
        />
        <Input
          label={t('register.lastName')}
          type="text"
          variant="filled"
          placeholder={t('register.lastNamePlaceholder')}
          {...register('lastName')}
          error={touchedFields.lastName ? errors.lastName?.message : undefined}
        />
      </div>

      {/* Email */}
      <Input
        label={t('auth.email')}
        type="email"
        variant="filled"
        size="lg"
        placeholder="you@example.com"
        {...register('email')}
        error={touchedFields.email ? errors.email?.message : undefined}
        autoComplete="email"
      />

      {/* Password */}
      <div>
        <Input
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          variant="filled"
          size="lg"
          placeholder={t('register.createPassword')}
          {...register('password')}
          autoComplete="new-password"
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-on-surface/8"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
        />

        <PasswordStrengthIndicator password={password || ''} />
      </div>

      {/* Confirm Password */}
      <Input
        label={t('auth.confirmPassword')}
        type={showConfirmPassword ? 'text' : 'password'}
        variant="filled"
        size="lg"
        placeholder={t('auth.confirmPassword')}
        {...register('confirmPassword')}
        error={touchedFields.confirmPassword ? errors.confirmPassword?.message : undefined}
        autoComplete="new-password"
        endIcon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-on-surface/8"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        }
      />

      {/* Submit Button */}
      <Button type="submit" className="w-full group" size="xl" loading={isLoading} disabled={isLoading}>
        <span>{t('auth.createAccount')}</span>
        <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>

      {/* Sign In Link */}
      <p className="text-center text-on-surface-variant pt-2">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          {t('auth.signIn')}
        </Link>
      </p>
    </form>
  );
}
