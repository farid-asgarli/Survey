import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getErrorMessage } from '@/utils';
import { InvalidLinkState, SuccessState, ResetPasswordForm } from './sections';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const handleSubmit = async (password: string) => {
    setError('');
    setIsLoading(true);

    try {
      await resetPassword({ email, token, newPassword: password });
      setIsSuccess(true);
      toast.success(t('resetPassword.successTitle'), { description: t('resetPassword.successDescription') });
    } catch (err: unknown) {
      const message = getErrorMessage(err, t('resetPassword.errors.failed'));
      setError(message);
      toast.error(t('resetPassword.errors.resetFailed'), { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return <InvalidLinkState />;
  }

  if (isSuccess) {
    return <SuccessState />;
  }

  return <ResetPasswordForm email={email} onSubmit={handleSubmit} isLoading={isLoading} error={error} />;
}
