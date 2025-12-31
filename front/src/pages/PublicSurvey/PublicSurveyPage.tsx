// Public Survey Page - Respondent-facing survey experience

import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublicSurveyStore } from '@/stores';
import { usePublicSurveyActions } from '@/hooks/queries/usePublicSurvey';
import { useDialogState } from '@/hooks';
import { ResumeProgressDialog } from '@/components/features/public-survey';
import { PublicSurveyLayout } from './components';
import { usePublicSurveySetup, useSubmitSurvey, useKeyboardNavigation } from './hooks';
import { WelcomeSection, OneByOneSection, AllAtOnceSection, ThankYouSection, LoadingSection, ErrorSection } from './sections';

export function PublicSurveyPage() {
  const { t } = useTranslation();
  const { shareToken } = useParams<{ shareToken: string }>();
  const resumeDialog = useDialogState();

  // React Query
  const {
    survey: fetchedSurvey,
    isLoading: isFetching,
    isError,
    error: fetchError,
    refetch,
    submitResponseAsync,
    isSubmitting: isApiSubmitting,
    submitError,
  } = usePublicSurveyActions(shareToken);

  // Zustand store
  const {
    survey,
    viewMode,
    displayMode,
    currentQuestionIndex,
    answers,
    errors,
    visibleQuestions,
    isSubmitting,
    canGoPrevious,
    setAnswer,
    startSurvey,
    goToNextQuestion,
    goToPreviousQuestion,
    restoreProgress,
    clearSavedProgress,
  } = usePublicSurveyStore();

  // Custom hooks
  usePublicSurveySetup({
    fetchedSurvey,
    shareToken,
    isError,
    fetchError,
    onShowResumeDialog: resumeDialog.setOpen,
  });

  const { handleSubmit } = useSubmitSurvey({
    survey,
    shareToken,
    submitResponseAsync,
  });

  useKeyboardNavigation({ survey, onSubmit: handleSubmit });

  // Handle resume dialog
  const handleResumeProgress = () => {
    restoreProgress();
    resumeDialog.close();
  };

  const handleStartFresh = () => {
    clearSavedProgress();
    resumeDialog.close();
    startSurvey();
  };

  // Loading state
  if (isFetching) {
    return <LoadingSection title={fetchedSurvey?.title} />;
  }

  // Error state
  if (viewMode === 'error' || isError) {
    const errorMessage =
      (fetchError as { response?: { data?: { message?: string } } })?.response?.data?.message || t('publicSurveyPage.notAvailable');
    return <ErrorSection message={errorMessage} onRetry={() => refetch()} />;
  }

  // No survey loaded
  if (!survey) {
    return null;
  }

  // Current question and totals
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const totalQuestions = visibleQuestions.length;
  const combinedSubmitting = isSubmitting || isApiSubmitting;

  // Show logo in header only when NOT on welcome screen (to avoid duplication)
  const showLogoInHeader = viewMode !== 'welcome' && !!survey.theme?.logoUrl;

  return (
    <PublicSurveyLayout title={survey.title} theme={survey.theme} showLogoInHeader={showLogoInHeader}>
      {/* Welcome Screen */}
      {viewMode === 'welcome' && <WelcomeSection survey={survey} totalQuestions={totalQuestions} onStart={startSurvey} />}

      {/* Questions - One by One Mode */}
      {viewMode === 'questions' && displayMode === 'one-by-one' && currentQuestion && (
        <OneByOneSection
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          answer={answers[currentQuestion.id]}
          error={errors[currentQuestion.id]}
          canGoPrevious={canGoPrevious}
          isSubmitting={combinedSubmitting}
          submitError={submitError}
          onAnswerChange={setAnswer}
          onPrevious={goToPreviousQuestion}
          onNext={goToNextQuestion}
          onSubmit={handleSubmit}
        />
      )}

      {/* All-at-once mode */}
      {viewMode === 'questions' && displayMode === 'all-at-once' && (
        <AllAtOnceSection
          questions={visibleQuestions}
          answers={answers}
          errors={errors}
          isSubmitting={combinedSubmitting}
          submitError={submitError}
          onAnswerChange={setAnswer}
          onSubmit={handleSubmit}
        />
      )}

      {/* Thank You Screen */}
      {viewMode === 'thank-you' && <ThankYouSection message={survey.thankYouMessage} />}

      {/* Resume Progress Dialog */}
      <ResumeProgressDialog open={resumeDialog.isOpen} onResume={handleResumeProgress} onStartFresh={handleStartFresh} />
    </PublicSurveyLayout>
  );
}

export default PublicSurveyPage;
