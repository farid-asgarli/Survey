// Survey Builder Page - The main survey editing experience (Hero Moment!)
//
// M3 Expressive Design Implementation:
// - No shadows (uses color elevation via surface-container tokens)
// - Dynamic shapes (rounded-full buttons, shape morphing cards)
// - Semantic color tokens throughout
// - Accessible and responsive
//
// This page provides a full-featured survey editor with:
// - Survey metadata editing (title, description, completion message, redirect URL)
// - Question list with drag-and-drop reordering
// - Question type editors for all 10 question types
// - Theme preview panel
// - Languages tab for translation management
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
import { AddLanguageDialog, TranslationEditorDialog, LanguagesTab } from '@/components/features/localization';
import { useSurveyBuilderStore, useSelectedQuestion, useNamespaceStore } from '@/stores';
import { useSurveyDetail, useViewTransitionNavigate, useAddSurveyTranslation, useDialogState } from '@/hooks';
import type { QuestionType } from '@/types';
import {
  SurveyBuilderHeader,
  QuestionListSidebar,
  SurveySettingsDialog,
  UnsavedChangesDialog,
  SurveyBuilderTabs,
  type BuilderTab,
} from './components';
import { useSurveyBuilderSave } from './hooks';
import { useEditorShortcuts, useEditorAutoSave } from '@/hooks';
import { AUTOSAVE_DELAY } from './constants';

export function SurveyBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useViewTransitionNavigate();
  const { t } = useTranslation();

  // Namespace context
  const activeNamespace = useNamespaceStore((s) => s.activeNamespace);

  // Local state
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const settingsDialog = useDialogState();
  const unsavedDialog = useDialogState();
  const [showThemePanel, setShowThemePanel] = useState(false);
  const addLanguageDialog = useDialogState();
  const translationEditorDialog = useDialogState();
  const [activeBuilderTab, setActiveBuilderTab] = useState<BuilderTab>('questions');

  // Store
  const {
    survey,
    questions,
    selectedQuestionId,
    isDirty,
    isSaving,
    isReadOnly,
    editingLanguage,
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
    setEditingLanguage,
    addLanguage,
  } = useSurveyBuilderStore();

  const selectedQuestion = useSelectedQuestion();

  // Fetch survey data (requires namespace context)
  const { data: surveyData, isLoading, error } = useSurveyDetail(id);

  // Translation mutation for adding new languages
  const addTranslationMutation = useAddSurveyTranslation();

  // Custom hooks for save, autosave, and keyboard shortcuts
  // Custom hooks for save, autosave, and keyboard shortcuts
  const { handleSave } = useSurveyBuilderSave();
  // Pause autosave when unsaved changes dialog is open to prevent conflicts
  useEditorAutoSave(survey, isDirty, handleSave, AUTOSAVE_DELAY, { isPaused: unsavedDialog.isOpen || isSaving });
  useEditorShortcuts({
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
    if (isBlockerActive && !unsavedDialog.isOpen) {
      // Use queueMicrotask to defer state update to avoid sync setState in effect
      queueMicrotask(() => unsavedDialog.open());
    }
  }, [isBlockerActive, unsavedDialog]);

  // Add question handler
  const handleAddQuestion = (type: QuestionType) => {
    addQuestion(type, selectedQuestionId || undefined);
    setIsAddMenuOpen(false);
  };

  // Navigation handlers
  const handleBack = () => {
    if (isDirty) {
      unsavedDialog.open();
    } else {
      navigate('/surveys');
    }
  };

  const handleDiscardAndLeave = () => {
    // Cancel any pending autosave by marking as not dirty before proceeding
    unsavedDialog.close();
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
      unsavedDialog.close();
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
        editingLanguage={editingLanguage}
        defaultLanguage={survey?.defaultLanguage || 'en'}
        availableLanguages={survey?.availableLanguages || ['en']}
        onBack={handleBack}
        onTitleChange={(title) => updateSurveyMetadata({ title })}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onToggleThemePanel={() => setShowThemePanel(!showThemePanel)}
        onOpenSettings={() => settingsDialog.open()}
        onPreview={() => navigate(`/surveys/${id}/preview`)}
        onLanguageChange={setEditingLanguage}
        onAddLanguage={() => addLanguageDialog.open()}
        onEditTranslation={() => translationEditorDialog.open()}
      />

      {/* Tab Navigation */}
      <SurveyBuilderTabs
        activeTab={activeBuilderTab}
        onTabChange={setActiveBuilderTab}
        questionCount={questions.length}
        languageCount={survey?.availableLanguages?.length || 1}
        hasIncompleteTranslations={(survey?.availableLanguages?.length || 1) > 1}
      />

      {/* Main Content - Conditional based on active tab */}
      {activeBuilderTab === 'questions' ? (
        /* Questions Tab - 3-panel layout */
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
      ) : (
        /* Languages Tab - Full-width language management */
        <div className="flex-1 overflow-hidden">
          {survey?.id && (
            <LanguagesTab
              surveyId={survey.id}
              defaultLanguage={survey.defaultLanguage || 'en'}
              availableLanguages={survey.availableLanguages || ['en']}
              questions={questions}
              isReadOnly={isReadOnly}
              onAddLanguage={async (languageCode, autoTranslate) => {
                try {
                  await addTranslationMutation.mutateAsync({
                    surveyId: survey.id,
                    translation: {
                      languageCode,
                      title: survey.title,
                      description: autoTranslate ? survey.description : undefined,
                      welcomeMessage: autoTranslate ? survey.welcomeMessage : undefined,
                      thankYouMessage: autoTranslate ? survey.thankYouMessage : undefined,
                      isDefault: false,
                    },
                  });
                  addLanguage(languageCode);
                } catch (error) {
                  console.error('Failed to add language:', error);
                  throw error;
                }
              }}
              onDeleteLanguage={() => {
                // Update local store when language is deleted
                // The actual deletion is handled by LanguagesTab
              }}
            />
          )}
        </div>
      )}

      {/* Add Question Menu - only show in edit mode */}
      {!isReadOnly && <AddQuestionMenu isOpen={isAddMenuOpen} onOpenChange={setIsAddMenuOpen} onSelectType={handleAddQuestion} />}

      {/* Settings Dialog - only show in edit mode */}
      {!isReadOnly && (
        <SurveySettingsDialog
          isOpen={settingsDialog.isOpen}
          description={survey?.description || ''}
          thankYouMessage={survey?.thankYouMessage || ''}
          welcomeMessage={survey?.welcomeMessage || ''}
          onOpenChange={settingsDialog.setOpen}
          onDescriptionChange={(value) => updateSurveyMetadata({ description: value })}
          onThankYouMessageChange={(value) => updateSurveyMetadata({ thankYouMessage: value })}
          onWelcomeMessageChange={(value) => updateSurveyMetadata({ welcomeMessage: value })}
        />
      )}

      {/* Unsaved Changes Dialog - only relevant in edit mode */}
      {!isReadOnly && (
        <UnsavedChangesDialog
          isOpen={unsavedDialog.isOpen}
          isSaving={isSaving}
          onOpenChange={unsavedDialog.setOpen}
          onDiscard={handleDiscardAndLeave}
          onSave={handleSaveAndLeave}
        />
      )}

      {/* Add Language Dialog */}
      <AddLanguageDialog
        open={addLanguageDialog.isOpen}
        onOpenChange={addLanguageDialog.setOpen}
        existingLanguages={survey?.availableLanguages || ['en']}
        defaultLanguage={survey?.defaultLanguage || 'en'}
        isLoading={addTranslationMutation.isPending}
        onAddLanguage={async (languageCode, autoTranslate) => {
          if (!survey?.id) return;

          try {
            // Create a new translation
            // Title is always required by the backend, so we copy from the default language
            // When autoTranslate is true, we copy all content; otherwise only title is copied
            await addTranslationMutation.mutateAsync({
              surveyId: survey.id,
              translation: {
                languageCode,
                title: survey.title, // Title is always required
                description: autoTranslate ? survey.description : undefined,
                welcomeMessage: autoTranslate ? survey.welcomeMessage : undefined,
                thankYouMessage: autoTranslate ? survey.thankYouMessage : undefined,
                isDefault: false,
              },
            });

            // Update local store with new language
            addLanguage(languageCode);
            addLanguageDialog.close();
            // Switch to the new language for editing
            setEditingLanguage(languageCode);
          } catch (error) {
            console.error('Failed to add language:', error);
            // Error toast is handled by API interceptor
          }
        }}
      />

      {/* Translation Editor Dialog */}
      {survey?.id && (
        <TranslationEditorDialog
          open={translationEditorDialog.isOpen}
          onOpenChange={translationEditorDialog.setOpen}
          surveyId={survey.id}
          defaultLanguage={survey.defaultLanguage || 'en'}
          targetLanguage={editingLanguage}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
}
