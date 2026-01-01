import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { PublicSurveyTheme } from '@/types/public-survey';

interface PublicSurveyLayoutProps {
  children: React.ReactNode;
  title?: string;
  theme?: PublicSurveyTheme;
  /** Whether to show the logo in the layout header (default: false, logo is shown in WelcomeScreen) */
  showLogoInHeader?: boolean;
}

export function PublicSurveyLayout({ children, title, theme, showLogoInHeader = false }: PublicSurveyLayoutProps) {
  const { t } = useTranslation();

  // Update page title
  useEffect(() => {
    if (title) {
      document.title = `${title} | ${t('common.surveyFallback')}`;
    } else {
      document.title = t('common.surveyFallback');
    }
    return () => {
      document.title = t('common.appTitle');
    };
  }, [title, t]);

  const hasBackgroundImage = !!theme?.backgroundImageUrl;

  // Get logo size class based on logoSize value
  const getLogoSizeClass = () => {
    switch (theme?.logoSize) {
      case 0:
        return 'h-6 sm:h-7 max-w-20 sm:max-w-24'; // Small
      case 2:
        return 'h-10 sm:h-12 max-w-32 sm:max-w-40'; // Large
      case 3:
        return 'h-12 sm:h-14 max-w-40 sm:max-w-48'; // Extra Large
      default:
        return 'h-8 sm:h-10 max-w-24 sm:max-w-32'; // Medium (default)
    }
  };

  return (
    <div
      className='min-h-screen bg-surface'
      style={{
        ...(hasBackgroundImage && {
          backgroundImage: `url(${theme.backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }),
      }}
    >
      {/* M3 Expressive Background - Solid colors with opacity, NO gradients */}
      {!hasBackgroundImage && (
        <div className='fixed inset-0 -z-10 overflow-hidden'>
          {/* Primary shape - top left */}
          <div className='absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full' />
          {/* Secondary shape - bottom right */}
          <div className='absolute -bottom-32 -right-32 w-80 h-80 bg-secondary/5 rounded-full' />
        </div>
      )}

      {/* Content */}
      <div className='relative max-w-4xl mx-auto min-h-screen flex flex-col'>
        {/* Logo in header - only if explicitly enabled and not on welcome screen */}
        {showLogoInHeader && theme?.logoUrl && (
          <div className='sticky top-0 z-10 px-4 py-3 sm:px-6 sm:py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15'>
            <div className='flex items-center gap-3'>
              {/* Logo with optional background */}
              <div
                className={cn('shrink-0 flex items-center justify-center rounded-xl', theme.showLogoBackground && 'p-1.5 border border-outline-variant/20')}
                style={theme.showLogoBackground ? { backgroundColor: theme.logoBackgroundColor || '#ffffff' } : undefined}
              >
                <img src={theme.logoUrl} alt={t('a11y.surveyLogo')} className={cn('w-auto object-contain rounded', getLogoSizeClass())} />
              </div>
              {/* Branding title and subtitle */}
              {(theme.brandingTitle || theme.brandingSubtitle) && (
                <div className='min-w-0 flex-1'>
                  {theme.brandingTitle && <p className='text-sm sm:text-base font-semibold text-on-surface truncate'>{theme.brandingTitle}</p>}
                  {theme.brandingSubtitle && <p className='text-xs sm:text-sm text-on-surface-variant truncate'>{theme.brandingSubtitle}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className='flex-1 flex flex-col justify-center py-8'>{children}</main>

        {/* Footer - only show "Powered by" if enabled in theme (default: true) */}
        {theme?.showPoweredBy !== false && (
          <footer className='py-6 text-center shrink-0'>
            <p className='text-sm text-on-surface-variant/40 font-medium'>{t('publicSurveyPage.poweredBy')}</p>
          </footer>
        )}
      </div>
    </div>
  );
}
