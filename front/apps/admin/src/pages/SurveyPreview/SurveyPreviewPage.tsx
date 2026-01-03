import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Button, LoadingIndicator, toast } from '@/components/ui';
import { useSurveyDetail, useViewTransitionNavigate, useThemeDetail, useDialogState, useCopyToClipboard, useEscapeKey, useSurveyTranslations } from '@/hooks';
import { useLogicMap } from '@/hooks/queries/useQuestionLogic';
import { useNamespaceStore } from '@/stores';
import type { AnswerValue, PublicSurveyViewMode, PublicSurveyTheme } from '@/types/public-survey';
import { cn } from '@/lib/utils';
import { evaluateQuestionVisibility, type QuestionWithLogic } from '@/utils/logicEvaluator';
import { DEVICE_PRESETS } from './constants/devices';
import { surveyToPublicSurvey, mergeLogicMapWithQuestions, validateQuestion, type PublicQuestionWithLogic } from './utils';
import { PreviewToolbar, DevicePreview, ResponseDrawer, QRCodeDialog, PreviewStatusBar } from './components';
import type { DevicePreset, Orientation, DisplayMode, ThemeMode } from './types';

// ============ Main Component ============

export function SurveyPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useViewTransitionNavigate();
  const { t } = useTranslation();
  const { copy } = useCopyToClipboard();

  // Namespace context
  const activeNamespace = useNamespaceStore((s) => s.activeNamespace);

  // Fetch survey data
  const { data: surveyData, isLoading, error } = useSurveyDetail(id);

  // Fetch theme data if survey has a theme
  const { data: themeData } = useThemeDetail(surveyData?.themeId);

  // Fetch logic map for conditional logic
  const { data: logicMap } = useLogicMap(id);

  // Preview language state
  const [previewLanguage, setPreviewLanguage] = useState<string>('');

  // Set initial preview language when survey loads
  useEffect(() => {
    if (surveyData && !previewLanguage) {
      setPreviewLanguage(surveyData.defaultLanguage || surveyData.language || 'en');
    }
  }, [surveyData, previewLanguage]);

  // Fetch translations for preview
  const { data: translationsData } = useSurveyTranslations(previewLanguage !== (surveyData?.defaultLanguage || 'en') ? id : undefined);

  // Device/viewport state
  const [selectedPreset, setSelectedPreset] = useState<DevicePreset>(DEVICE_PRESETS[0]);
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [useCustomDimensions, setUseCustomDimensions] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Theme mode
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  // UI panels state
  const [showResponseDrawer, setShowResponseDrawer] = useState(false);
  const qrDialog = useDialogState();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);

  // Preview state
  const [viewMode, setViewMode] = useState<PublicSurveyViewMode>('welcome');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('one-by-one');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTestMode, setIsTestMode] = useState(true);

  // Calculate effective dimensions
  const effectiveDimensions = useMemo(() => {
    if (selectedPreset.id === 'responsive') {
      return { width: 0, height: 0 }; // Full container
    }

    if (useCustomDimensions) {
      return {
        width: parseInt(customWidth) || 375,
        height: parseInt(customHeight) || 812,
      };
    }

    const baseWidth = selectedPreset.width;
    const baseHeight = selectedPreset.height;

    // Apply orientation swap for non-desktop devices
    if (selectedPreset.category !== 'desktop' && orientation === 'landscape') {
      return { width: baseHeight, height: baseWidth };
    }

    return { width: baseWidth, height: baseHeight };
  }, [selectedPreset, orientation, useCustomDimensions, customWidth, customHeight]);

  // Generate preview URL for QR code
  const previewUrl = useMemo(() => {
    if (!surveyData) return '';
    // In production, this would be the actual survey URL
    return `${window.location.origin}/s/${surveyData.id}`;
  }, [surveyData]);

  // Convert survey to public format with theme
  const publicSurvey = useMemo(() => {
    if (!surveyData) return null;

    const survey = surveyToPublicSurvey(surveyData);

    // Add theme data if available with full M3 color support
    if (themeData) {
      survey.theme = {
        // Primary
        primaryColor: themeData.colors.primary,
        onPrimaryColor: themeData.colors.onPrimary,
        primaryContainerColor: themeData.colors.primaryContainer,
        onPrimaryContainerColor: themeData.colors.onPrimaryContainer,
        // Secondary
        secondaryColor: themeData.colors.secondary,
        onSecondaryColor: themeData.colors.onSecondary,
        secondaryContainerColor: themeData.colors.secondaryContainer,
        onSecondaryContainerColor: themeData.colors.onSecondaryContainer,
        // Surface
        surfaceColor: themeData.colors.surface,
        surfaceContainerLowestColor: themeData.colors.surfaceContainerLowest,
        surfaceContainerLowColor: themeData.colors.surfaceContainerLow,
        surfaceContainerColor: themeData.colors.surfaceContainer,
        surfaceContainerHighColor: themeData.colors.surfaceContainerHigh,
        surfaceContainerHighestColor: themeData.colors.surfaceContainerHighest,
        onSurfaceColor: themeData.colors.onSurface,
        onSurfaceVariantColor: themeData.colors.onSurfaceVariant,
        // Outline
        outlineColor: themeData.colors.outline,
        outlineVariantColor: themeData.colors.outlineVariant,
        // Legacy
        backgroundColor: themeData.colors.background || themeData.colors.surface,
        textColor: themeData.colors.text || themeData.colors.onSurface,
        // Typography
        fontFamily: themeData.typography.fontFamily,
        headingFontFamily: themeData.typography.headingFontFamily,
        baseFontSize: themeData.typography.baseFontSize,
        // Button
        buttonStyle: themeData.button.style,
        buttonTextColor: themeData.button.textColor,
        // Branding
        logoUrl: themeData.branding.logoUrl,
        logoSize: themeData.branding.logoSize,
        showLogoBackground: themeData.branding.showLogoBackground,
        logoBackgroundColor: themeData.branding.logoBackgroundColor,
        brandingTitle: themeData.branding.brandingTitle,
        brandingSubtitle: themeData.branding.brandingSubtitle,
        showPoweredBy: themeData.branding.showPoweredBy,
        // Layout
        backgroundImageUrl: themeData.layout.backgroundImageUrl,
        backgroundPosition: themeData.layout.backgroundPosition !== undefined ? String(themeData.layout.backgroundPosition) : undefined,
        showProgressBar: themeData.layout.showProgressBar,
        progressBarStyle: themeData.layout.progressBarStyle,
      } as PublicSurveyTheme;

      // Apply theme customizations if they exist
      if (surveyData.themeCustomizations) {
        try {
          const customizations = JSON.parse(surveyData.themeCustomizations);

          // Apply custom colors if present
          if (customizations.colors) {
            if (customizations.colors.primary) survey.theme.primaryColor = customizations.colors.primary;
            if (customizations.colors.secondary) survey.theme.secondaryColor = customizations.colors.secondary;
            if (customizations.colors.accent) survey.theme.primaryContainerColor = customizations.colors.accent;
            if (customizations.colors.background) {
              survey.theme.backgroundColor = customizations.colors.background;
              survey.theme.surfaceColor = customizations.colors.background;
            }
          }

          // Apply custom font if present
          if (customizations.fontFamily) {
            survey.theme.fontFamily = customizations.fontFamily;
          }
        } catch (error) {
          console.error('Failed to parse theme customizations in preview:', error);
        }
      }
    }

    // Apply translations if previewing a non-default language
    if (translationsData && previewLanguage !== surveyData.defaultLanguage) {
      // Find survey translation for the preview language
      const surveyTranslation = translationsData.translations?.find((t) => t.languageCode === previewLanguage);
      if (surveyTranslation) {
        survey.title = surveyTranslation.title || survey.title;
        survey.description = surveyTranslation.description || survey.description;
        survey.welcomeMessage = surveyTranslation.welcomeMessage || survey.welcomeMessage;
        survey.thankYouMessage = surveyTranslation.thankYouMessage || survey.thankYouMessage;
      }

      // Apply question translations
      if (translationsData.questions) {
        survey.questions = survey.questions.map((question) => {
          const questionTranslations = translationsData.questions?.find((qt) => qt.questionId === question.id);
          const translation = questionTranslations?.translations?.find((t) => t.languageCode === previewLanguage);

          if (translation) {
            // Map translated option texts back to QuestionOption[], preserving original IDs
            let translatedOptions = question.settings?.options;
            if (translation.translatedSettings?.options && question.settings?.options) {
              translatedOptions = question.settings.options.map((opt, index) => ({
                ...opt,
                text: translation.translatedSettings?.options?.[index] ?? opt.text,
              }));
            }

            return {
              ...question,
              text: translation.text || question.text,
              description: translation.description || question.description,
              settings: {
                ...question.settings,
                // Apply translated settings if available
                options: translatedOptions,
                minLabel: translation.translatedSettings?.minLabel || question.settings?.minLabel,
                maxLabel: translation.translatedSettings?.maxLabel || question.settings?.maxLabel,
                placeholder: translation.translatedSettings?.placeholder || question.settings?.placeholder,
                matrixRows: translation.translatedSettings?.matrixRows || question.settings?.matrixRows,
                matrixColumns: translation.translatedSettings?.matrixColumns || question.settings?.matrixColumns,
                validationMessage: translation.translatedSettings?.validationMessage || question.settings?.validationMessage,
              },
            };
          }
          return question;
        });
      }
    }

    // Update the language in the survey
    survey.language = previewLanguage || surveyData.defaultLanguage || 'en';

    return survey;
  }, [surveyData, themeData, translationsData, previewLanguage]);

  // Merge questions with logic rules from the logic map
  const questionsWithLogic = useMemo(() => {
    if (!publicSurvey) return [];
    return mergeLogicMapWithQuestions(publicSurvey.questions, logicMap);
  }, [publicSurvey, logicMap]);

  // Compute visible questions based on conditional logic and current answers
  const visibleQuestions = useMemo(() => {
    if (questionsWithLogic.length === 0) return [];

    const sortedQuestions = [...questionsWithLogic].sort((a, b) => a.order - b.order);
    const visible: PublicQuestionWithLogic[] = [];

    // Convert to QuestionWithLogic for evaluation
    const allQuestionsForLogic: QuestionWithLogic[] = questionsWithLogic.map((q) => ({
      id: q.id,
      order: q.order,
      logicRules: q.logicRules,
    }));

    for (const question of sortedQuestions) {
      const result = evaluateQuestionVisibility(question.id, allQuestionsForLogic, answers);

      if (result.visible) {
        visible.push(question);
      }

      // Check for end survey condition
      if (result.endSurvey) {
        break;
      }
    }

    return visible;
  }, [questionsWithLogic, answers]);

  // Current question and counts based on visible questions
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const totalQuestions = visibleQuestions.length;

  // Answer count
  const answeredCount = Object.keys(answers).filter((k) => {
    const val = answers[k];
    if (val === null || val === undefined) return false;
    if (typeof val === 'string' && val.trim() === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }).length;

  // Fullscreen handling - toggles preview container to fill screen (not browser fullscreen)
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Escape key to exit fullscreen
  useEscapeKey(() => setIsFullscreen(false), isFullscreen);

  // Screenshot capture - copies preview to clipboard or downloads
  const captureScreenshot = useCallback(async () => {
    try {
      // Dynamic import html-to-image for screenshot
      const { toPng } = await import('html-to-image');

      const previewElement = document.querySelector('[data-preview-container]') as HTMLElement;
      if (!previewElement) return;

      const dataUrl = await toPng(previewElement, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `survey-preview-${surveyData?.title?.replace(/\s+/g, '-').toLowerCase() || 'screenshot'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast.success(t('surveyPreview.screenshotSuccess'));
    } catch {
      // Fallback message if html-to-image is not installed
      toast.info(t('surveyPreview.screenshotInfo'), {
        description: t('surveyPreview.screenshotHint'),
      });
    }
  }, [t, surveyData?.title]);

  // Copy preview link
  const copyPreviewLink = useCallback(() => {
    copy(previewUrl, {
      successMessage: t('surveyPreview.linkCopied'),
      errorMessage: t('surveyPreview.linkCopyError'),
    });
  }, [previewUrl, copy, t]);

  // Reset preview state
  const handleReset = useCallback(() => {
    setViewMode('welcome');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setErrors({});
  }, []);

  // Start survey
  const handleStart = useCallback(() => {
    setViewMode('questions');
  }, []);

  // Set answer
  const handleSetAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear error when user answers
    setErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  // Validate current question
  const validateCurrentQuestion = useCallback((): boolean => {
    if (!currentQuestion) return true;
    const errorKey = validateQuestion(currentQuestion, answers[currentQuestion.id]);
    if (errorKey) {
      setErrors((prev) => ({ ...prev, [currentQuestion.id]: t(errorKey) }));
      return false;
    }
    return true;
  }, [currentQuestion, answers, t]);

  // Validate all questions (only visible ones due to conditional logic)
  const validateAllQuestions = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    visibleQuestions.forEach((question) => {
      const errorKey = validateQuestion(question, answers[question.id]);
      if (errorKey) {
        newErrors[question.id] = t(errorKey);
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [visibleQuestions, answers, t]);

  // Navigate to next question
  const handleNext = useCallback(() => {
    if (!validateCurrentQuestion()) return;

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, totalQuestions, validateCurrentQuestion]);

  // Navigate to previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Submit survey (test mode - no actual submission)
  const handleSubmit = useCallback(() => {
    if (displayMode === 'all-at-once') {
      if (!validateAllQuestions()) {
        toast.error(t('surveyPreview.completeRequired'));
        return;
      }
    } else {
      if (!validateCurrentQuestion()) return;
    }

    if (isTestMode) {
      toast.success(t('surveyPreview.testSubmitSuccess'), {
        description: `Collected ${Object.keys(answers).length} answers`,
      });
    }
    setViewMode('thank-you');
  }, [displayMode, validateAllQuestions, validateCurrentQuestion, isTestMode, answers, t]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(`/surveys/${id}/edit`);
  }, [navigate, id]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 150));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 50));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
  }, []);

  // Toggle orientation
  const toggleOrientation = useCallback(() => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  }, []);

  // Select device preset
  const handleSelectPreset = useCallback((preset: DevicePreset) => {
    setSelectedPreset(preset);
    setUseCustomDimensions(false);
    // Reset orientation for desktop
    if (preset.category === 'desktop') {
      setOrientation('portrait');
    }
  }, []);

  // Apply custom dimensions
  const handleApplyCustomDimensions = useCallback(() => {
    if (customWidth && customHeight) {
      setUseCustomDimensions(true);
    }
  }, [customWidth, customHeight]);

  // Loading state
  if (!activeNamespace || isLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-surface'>
        <LoadingIndicator size='lg' label={t('surveyPreview.loadingPreview')} />
      </div>
    );
  }

  // Error state
  if (error || !surveyData || !publicSurvey) {
    return (
      <div className='h-screen flex flex-col items-center justify-center bg-surface gap-4'>
        <div className='text-error text-lg'>{t('surveys.unknown')}</div>
        <Button onClick={() => navigate('/surveys')}>{t('surveyBuilder.backToSurveys')}</Button>
      </div>
    );
  }

  const isResponsive = selectedPreset.id === 'responsive';

  return (
    <div className={cn('h-screen flex flex-col bg-surface-container-lowest overflow-hidden', isFullscreen && 'fixed inset-0 z-50')}>
      {/* Top Toolbar */}
      <PreviewToolbar
        surveyTitle={surveyData.title}
        selectedPreset={selectedPreset}
        orientation={orientation}
        effectiveDimensions={effectiveDimensions}
        zoom={zoom}
        themeMode={themeMode}
        isTestMode={isTestMode}
        displayMode={displayMode}
        showResponseDrawer={showResponseDrawer}
        showKeyboardHints={showKeyboardHints}
        isFullscreen={isFullscreen}
        customWidth={customWidth}
        customHeight={customHeight}
        previewUrl={previewUrl}
        previewLanguage={previewLanguage || surveyData.defaultLanguage || 'en'}
        availableLanguages={surveyData.availableLanguages || ['en']}
        defaultLanguage={surveyData.defaultLanguage || 'en'}
        onLanguageChange={setPreviewLanguage}
        onBack={handleBack}
        onSelectPreset={handleSelectPreset}
        onToggleOrientation={toggleOrientation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onThemeModeChange={setThemeMode}
        onTestModeChange={setIsTestMode}
        onDisplayModeChange={setDisplayMode}
        onToggleResponseDrawer={() => setShowResponseDrawer(!showResponseDrawer)}
        onToggleKeyboardHints={() => setShowKeyboardHints(!showKeyboardHints)}
        onToggleFullscreen={toggleFullscreen}
        onShowQRCode={() => qrDialog.open()}
        onCaptureScreenshot={captureScreenshot}
        onReset={handleReset}
        onCopyLink={copyPreviewLink}
        onCustomWidthChange={setCustomWidth}
        onCustomHeightChange={setCustomHeight}
        onApplyCustomDimensions={handleApplyCustomDimensions}
      />

      {/* Preview Area */}
      <main className='flex-1 flex overflow-hidden bg-surface-container-low'>
        {/* Device Preview */}
        <DevicePreview
          survey={publicSurvey}
          visibleQuestions={visibleQuestions}
          selectedPreset={selectedPreset}
          effectiveDimensions={effectiveDimensions}
          zoom={zoom}
          themeMode={themeMode}
          isFullscreen={isFullscreen}
          viewMode={viewMode}
          displayMode={displayMode}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          errors={errors}
          onStart={handleStart}
          onSetAnswer={handleSetAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          onReset={handleReset}
          showKeyboardHints={showKeyboardHints}
        />

        {/* Response Summary Drawer (inline, not overlay) */}
        {showResponseDrawer && (
          <ResponseDrawer
            questions={visibleQuestions}
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            displayMode={displayMode}
            onClose={() => setShowResponseDrawer(false)}
          />
        )}
      </main>

      {/* Bottom status bar */}
      <PreviewStatusBar
        totalQuestions={totalQuestions}
        effectiveDimensions={effectiveDimensions}
        zoom={zoom}
        themeMode={themeMode}
        isResponsive={isResponsive}
        viewMode={viewMode}
        displayMode={displayMode}
        currentQuestionIndex={currentQuestionIndex}
        answeredCount={answeredCount}
      />

      {/* QR Code Dialog */}
      <QRCodeDialog open={qrDialog.isOpen} previewUrl={previewUrl} onOpenChange={qrDialog.setOpen} onCopyLink={copyPreviewLink} />
    </div>
  );
}

export default SurveyPreviewPage;
