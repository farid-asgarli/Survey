import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Input, Button, Checkbox } from '@/components/ui';
import { Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useFormContext } from '@/lib/form';
import type { LoginFormData } from '@/lib/validations';

interface LoginFormProps {
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * LoginForm Component
 *
 * Handles the login form UI using React Hook Form.
 * Form state is managed by the parent via FormProvider.
 */
export function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    formState: { errors, touchedFields },
    control,
  } = useFormContext<LoginFormData>();

  return (
    <div className="w-full max-w-md">
      {/* Logo & Welcome */}
      <div className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-6">
          <Sparkles className="h-8 w-8 text-on-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-on-surface mb-2">{t('auth.welcomeBack', 'Welcome back')}</h1>
        <p className="text-on-surface-variant text-lg">{t('auth.signInToContinue', 'Sign in to continue to your account')}</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-error-container/80 text-on-error-container animate-in slide-in-from-top-2 duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Email Input */}
        <Input
          label={t('auth.email')}
          type="email"
          variant="filled"
          size="lg"
          placeholder={t('auth.emailPlaceholder')}
          {...register('email')}
          error={touchedFields.email ? errors.email?.message : undefined}
          autoComplete="email"
          autoFocus
        />

        {/* Password Input */}
        <Input
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          variant="filled"
          size="lg"
          placeholder="••••••••"
          {...register('password')}
          error={touchedFields.password ? errors.password?.message : undefined}
          autoComplete="current-password"
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

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <Checkbox label={t('auth.rememberMe')} checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />
            )}
          />
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            {t('auth.forgotPassword')}
          </Link>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full group" size="xl" loading={isLoading}>
          <span>{t('auth.signIn')}</span>
          <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>

        {/* Sign Up Link */}
        <p className="text-center text-on-surface-variant pt-4">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            {t('auth.signUp')}
          </Link>
        </p>
      </form>
    </div>
  );
}
