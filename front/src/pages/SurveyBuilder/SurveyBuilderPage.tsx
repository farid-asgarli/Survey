// Survey Builder Page - The main survey editing experience (Hero Moment!)
//
// This page provides a full-featured survey editor with:
// - Survey metadata editing (title, description, completion message, redirect URL)
// - Question list with drag-and-drop reordering
// - Question type editors for all 10 question types
// - Theme preview panel
// - Autosave functionality (2-second debounce)
// - Undo/Redo support (Ctrl+Z / Ctrl+Y)
// - Question persistence to backend API (create, update, delete, reorder)
// - Unsaved changes warning when navigating away

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useBlocker } from 'react-router-dom';
import { Loader2, AlertTriangle, Plus } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';
import { QuestionEditor, AddQuestionMenu } from '@/components/features/questions';
import { ThemePreviewPanel } from '@/components/features/surveys';
import { useSurveyBuilderStore, useSelectedQuestion, useNamespaceStore } from '@/stores';
import { useSurveyDetail, useViewTransitionNavigate } from '@/hooks';
import type { QuestionType } from '@/types';
import { SurveyBuilderHeader, QuestionListSidebar, SurveySettingsDialog, UnsavedChangesDialog } from './components';
import { useSurveyBuilderSave, useAutosave, useKeyboardShortcuts } from './hooks';
import { AUTOSAVE_DELAY } from './constants';

export function SurveyBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useViewTransitionNavigate();
  const { t } = useTranslation();

  // Namespace context
  const activeNamespace = useNamespaceStore((s) => s.activeNamespace);

  // Local state
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);

  // Store
  const {
    survey,
    questions,
    selectedQuestionId,
    isDirty,
    isSaving,
    isReadOnly,
    initializeSurvey,
    resetBuilder,
    updateSurveyMetadata,
    addQuestion,
    selectQuestion,
    reorderQuestions,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useSurveyBuilderStore();

  const selectedQuestion = useSelectedQuestion();

  // Fetch survey data (requires namespace context)
  const { data: surveyData, isLoading, error } = useSurveyDetail(id);

  // Custom hooks for save, autosave, and keyboard shortcuts
  // Custom hooks for save, autosave, and keyboard shortcuts
  const { handleSave } = useSurveyBuilderSave();
  // Pause autosave when unsaved changes dialog is open to prevent conflicts
  useAutosave(isDirty, survey, handleSave, AUTOSAVE_DELAY, { isPaused: showUnsavedDialog || isSaving });
  useKeyboardShortcuts({
    onSave: handleSave,
    onUndo: undo,
    onRedo: redo,
    canUndo,
    canRedo,
  });

  // Initialize builder when survey data loads
  // We track initialization to prevent re-initialization when surveyData updates after save
  // Using survey ID from store to detect if we need to reinitialize (e.g., after returning from preview)
  const storeSurveyId = survey?.id;
  const initializedSurveyIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize if:
    // 1. We have survey data from the API
    // 2. Either we haven't initialized yet OR the store was reset (survey is null/different)
    if (surveyData) {
      const needsInit = !storeSurveyId || storeSurveyId !== surveyData.id;
      const notInitializedYet = initializedSurveyIdRef.current !== surveyData.id;

      if (needsInit || notInitializedYet) {
        initializedSurveyIdRef.current = surveyData.id;
        initializeSurvey(surveyData);
      }
    }
  }, [surveyData, storeSurveyId, initializeSurvey]);

  // Cleanup on unmount only - reset the ref but keep store state until component mounts again
  // This allows the store to be properly reinitialized when returning from preview
  useEffect(() => {
    return () => {
      // Reset ref so we reinitialize on next mount
      initializedSurveyIdRef.current = null;
      // Only reset builder when actually leaving the survey (not just going to preview)
      // The blocker will handle unsaved changes warning
      resetBuilder();
    };
  }, [resetBuilder]);

  // Block navigation when dirty (not in read-only mode)
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return !isReadOnly && isDirty && currentLocation.pathname !== nextLocation.pathname;
  });

  // Derive dialog visibility from blocker state instead of using effect
  const isBlockerActive = blocker.state === 'blocked';

  useEffect(() => {
    if (isBlockerActive && !showUnsavedDialog) {
      // Use queueMicrotask to defer state update to avoid sync setState in effect
      queueMicrotask(() => setShowUnsavedDialog(true));
    }
  }, [isBlockerActive, showUnsavedDialog]);

  // Add question handler
  const handleAddQuestion = (type: QuestionType) => {
    addQuestion(type, selectedQuestionId || undefined);
    setIsAddMenuOpen(false);
  };

  // Navigation handlers
  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      navigate('/surveys');
    }
  };

  const handleDiscardAndLeave = () => {
    // Cancel any pending autosave by marking as not dirty before proceeding
    setShowUnsavedDialog(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else {
      navigate('/surveys');
    }
  };

  const handleSaveAndLeave = async () => {
    // Prevent double-save if already saving
    if (isSaving) return;

    try {
      await handleSave();
      setShowUnsavedDialog(false);
      if (blocker.state === 'blocked') {
        blocker.proceed();
      } else {
        navigate('/surveys');
      }
    } catch (error) {
      // Don't close dialog or navigate on save error
      console.error('Save failed:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex !== dropIndex) {
      reorderQuestions(dragIndex, dropIndex);
    }
  };

  // Loading state - only show on initial load, not during background refetches
  // Using isLoading (not isFetching) prevents flash during autosave refetches
  if (!activeNamespace || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-on-surface-variant">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !surveyData) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-error" />
          <h2 className="text-xl font-semibold text-on-surface">{t('surveys.unknown')}</h2>
          <p className="text-on-surface-variant">{t('errors.notFoundDesc')}</p>
          <Button onClick={() => navigate('/surveys')}>{t('surveyBuilder.backToSurveys')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest overflow-hidden">
      {/* Top App Bar */}
      <SurveyBuilderHeader
        surveyTitle={survey?.title || ''}
        surveyStatus={survey?.status}
        questionsCount={questions.length}
        isDirty={isDirty}
        isSaving={isSaving}
        isReadOnly={isReadOnly}
        canUndo={canUndo()}
        canRedo={canRedo()}
        showThemePanel={showThemePanel}
        onBack={handleBack}
        onTitleChange={(title) => updateSurveyMetadata({ title })}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onToggleThemePanel={() => setShowThemePanel(!showThemePanel)}
        onOpenSettings={() => setShowSettingsDialog(true)}
        onPreview={() => navigate(`/surveys/${id}/preview`)}
      />

      {/* Main Content - 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question List */}
        <QuestionListSidebar
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          isReadOnly={isReadOnly}
          onQuestionSelect={selectQuestion}
          onQuestionDuplicate={duplicateQuestion}
          onQuestionDelete={deleteQuestion}
          onQuestionRequiredChange={(id, required) => updateQuestion(id, { isRequired: required })}
          onAddQuestion={() => setIsAddMenuOpen(true)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />

        {/* Center Panel - Question Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedQuestion ? (
            <QuestionEditor question={selectedQuestion} isReadOnly={isReadOnly} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={<Plus className="h-6 w-6" />}
                title={questions.length === 0 ? t('surveyBuilder.noQuestions') : t('surveyBuilder.selectQuestion', 'Select a question')}
                description={
                  questions.length === 0
                    ? t('surveyBuilder.addFirstQuestion')
                    : t('surveyBuilder.selectQuestionDesc', 'Choose a question from the list to edit, or add a new one')
                }
                iconVariant={questions.length === 0 ? 'primary' : 'default'}
                size="default"
                action={
                  !isReadOnly
                    ? {
                        label: t('surveyBuilder.addQuestion'),
                        onClick: () => setIsAddMenuOpen(true),
                        icon: <Plus className="h-4 w-4" />,
                      }
                    : undefined
                }
              />
            </div>
          )}
        </main>

        {/* Right Panel - Theme Preview */}
        {showThemePanel && <ThemePreviewPanel isReadOnly={isReadOnly} />}
      </div>

      {/* Add Question Menu - only show in edit mode */}
      {!isReadOnly && <AddQuestionMenu isOpen={isAddMenuOpen} onOpenChange={setIsAddMenuOpen} onSelectType={handleAddQuestion} />}

      {/* Settings Dialog - only show in edit mode */}
      {!isReadOnly && (
        <SurveySettingsDialog
          isOpen={showSettingsDialog}
          description={survey?.description || ''}
          thankYouMessage={survey?.thankYouMessage || ''}
          welcomeMessage={survey?.welcomeMessage || ''}
          onOpenChange={setShowSettingsDialog}
          onDescriptionChange={(value) => updateSurveyMetadata({ description: value })}
          onThankYouMessageChange={(value) => updateSurveyMetadata({ thankYouMessage: value })}
          onWelcomeMessageChange={(value) => updateSurveyMetadata({ welcomeMessage: value })}
        />
      )}

      {/* Unsaved Changes Dialog - only relevant in edit mode */}
      {!isReadOnly && (
        <UnsavedChangesDialog
          isOpen={showUnsavedDialog}
          isSaving={isSaving}
          onOpenChange={setShowUnsavedDialog}
          onDiscard={handleDiscardAndLeave}
          onSave={handleSaveAndLeave}
        />
      )}
    </div>
  );
}
