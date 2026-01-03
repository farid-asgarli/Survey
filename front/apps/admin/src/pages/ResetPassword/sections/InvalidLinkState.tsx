import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, Button } from '@/components/ui';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useViewTransitionNavigate } from '@/hooks';

export function InvalidLinkState() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-container border border-warning/20 mb-4">
            <AlertTriangle className="h-7 w-7 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{t('resetPassword.invalidLink.title')}</h1>
        </div>

        <Card variant="elevated" className="p-2">
          <CardContent className="pt-6 text-center">
            <p className="text-on-surface-variant mb-4">{t('resetPassword.invalidLink.description')}</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={() => navigate('/forgot-password')} className="w-full">
              {t('resetPassword.invalidLink.requestNewLink')}
            </Button>
            <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              {t('auth.backToLogin')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
