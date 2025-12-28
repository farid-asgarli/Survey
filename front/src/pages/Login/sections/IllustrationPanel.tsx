import { useTranslation } from 'react-i18next';
import { DecorativeBlobs, SurveyIllustration } from '../components';

/**
 * IllustrationPanel Component
 *
 * Left panel section displaying the illustration and marketing content.
 * Hidden on mobile devices, visible on large screens.
 */
export function IllustrationPanel() {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-linear-to-br from-surface via-primary-container/20 to-tertiary-container/30 items-center justify-center p-12">
      <DecorativeBlobs />

      <div className="relative z-10 text-center max-w-lg">
        <SurveyIllustration />

        <h2 className="text-3xl xl:text-4xl font-bold text-on-surface mt-8 mb-4">{t('auth.illustrationTitle', 'Create surveys that inspire')}</h2>
        <p className="text-lg text-on-surface-variant">
          {t('auth.illustrationSubtitle', 'Gather insights, understand your audience, and make data-driven decisions.')}
        </p>
      </div>
    </div>
  );
}
