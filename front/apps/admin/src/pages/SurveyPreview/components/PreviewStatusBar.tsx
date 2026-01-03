import { useTranslation } from 'react-i18next';

interface PreviewStatusBarProps {
  totalQuestions: number;
  effectiveDimensions: { width: number; height: number };
  zoom: number;
  themeMode: 'light' | 'dark' | 'system';
  isResponsive: boolean;
  viewMode: string;
  displayMode: 'one-by-one' | 'all-at-once';
  currentQuestionIndex: number;
  answeredCount: number;
}

export function PreviewStatusBar({
  totalQuestions,
  effectiveDimensions,
  zoom,
  themeMode,
  isResponsive,
  viewMode,
  displayMode,
  currentQuestionIndex,
  answeredCount,
}: PreviewStatusBarProps) {
  const { t } = useTranslation();

  return (
    <footer className="shrink-0 h-9 flex items-center justify-between px-4 bg-surface border-t border-outline-variant/30 text-xs text-on-surface-variant">
      <div className="flex items-center gap-3">
        <span>{t('surveyPreview.questionCount', { count: totalQuestions })}</span>
        {!isResponsive && (
          <>
            <span>•</span>
            <span className="tabular-nums">
              {effectiveDimensions.width}×{effectiveDimensions.height} @ {zoom}%
            </span>
          </>
        )}
        <span>•</span>
        <span className="capitalize">
          {themeMode} {t('surveyPreview.mode')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {viewMode === 'questions' && displayMode === 'one-by-one' && (
          <span>{t('surveyPreview.questionProgress', { current: currentQuestionIndex + 1, total: totalQuestions })}</span>
        )}
        {answeredCount > 0 && <span>{t('surveyPreview.answeredCount', { count: answeredCount })}</span>}
      </div>
    </footer>
  );
}
