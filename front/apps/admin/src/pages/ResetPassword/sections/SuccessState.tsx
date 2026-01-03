import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, Button } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';
import { useViewTransitionNavigate } from '@/hooks';

export function SuccessState() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-container border border-success/20 mb-4">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{t('resetPassword.success.title')}</h1>
        </div>

        <Card variant="elevated" className="p-2">
          <CardContent className="pt-6 text-center">
            <p className="text-on-surface-variant mb-4">{t('resetPassword.success.description')}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full">
              {t('resetPassword.success.goToLogin')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
