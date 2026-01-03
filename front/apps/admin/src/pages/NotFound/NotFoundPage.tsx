import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent } from '@/components/ui';
import { useViewTransitionNavigate } from '@/hooks';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 2) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-surface p-4'>
      {/* Background decoration */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl' />
      </div>

      <div className='relative z-10 w-full max-w-lg'>
        <Card variant='elevated' className='w-full text-center overflow-hidden'>
          {/* Hero section with gradient */}
          <div className='relative bg-linear-to-br from-primary-container/40 via-surface-container to-secondary-container/30 px-6 pt-12 pb-8'>
            {/* Animated floating icon */}
            <div className='relative mx-auto mb-6'>
              <div className='flex h-24 w-24 items-center justify-center rounded-3xl bg-surface-container-lowest border-2 border-outline-variant/30 shadow-lg mx-auto animate-[bounce_3s_ease-in-out_infinite]'>
                <FileQuestion className='h-12 w-12 text-on-surface-variant' />
              </div>
              {/* Decorative rings */}
              <div className='absolute inset-0 -m-4 rounded-4xl border-2 border-dashed border-outline-variant/20 animate-[spin_20s_linear_infinite]' />
            </div>

            {/* Large 404 text */}
            <h1 className='text-8xl font-black text-on-surface/10 select-none mb-2'>404</h1>
            <h2 className='text-2xl font-bold text-on-surface -mt-8'>{t('errors.notFound')}</h2>
          </div>

          <CardContent className='p-6 pt-5'>
            <p className='text-on-surface-variant mb-2'>{t('errors.notFoundDesc')}</p>
            {location.pathname !== '/' && (
              <p className='text-sm text-on-surface-variant/70 font-mono bg-surface-container-high/50 rounded-lg px-3 py-1.5 inline-block mb-6 break-all'>
                {location.pathname}
              </p>
            )}

            {/* Actions */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-3 mt-6'>
              <Button variant='outline' onClick={handleGoBack} className='w-full sm:w-auto'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                {t('errors.goBack')}
              </Button>
              <Button onClick={() => navigate('/')} className='w-full sm:w-auto'>
                <Home className='h-4 w-4 mr-2' />
                {t('errors.goHome')}
              </Button>
            </div>

            {/* Additional help */}
            <div className='mt-6 pt-6 border-t border-outline-variant/30'>
              <p className='text-sm text-on-surface-variant mb-3'>{t('common.search')}?</p>
              <div className='flex flex-wrap justify-center gap-2'>
                <Button variant='text' size='sm' onClick={() => navigate('/surveys')}>
                  {t('navigation.surveys')}
                </Button>
                <Button variant='text' size='sm' onClick={() => navigate('/templates')}>
                  {t('navigation.templates')}
                </Button>
                <Button variant='text' size='sm' onClick={() => navigate('/responses')}>
                  {t('navigation.responses')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer hint */}
        <p className='text-center text-xs text-on-surface-variant/60 mt-6'>{t('errors.generic')}</p>
      </div>
    </div>
  );
}
