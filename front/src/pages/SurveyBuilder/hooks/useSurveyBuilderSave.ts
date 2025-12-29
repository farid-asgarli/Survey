import { useCallback } from 'react';
import { useSurveyBuilderStore } from '@/stores';
import { useUpdateSurvey, useSyncQuestions, calculateQuestionChanges } from '@/hooks';

export function useSurveyBuilderSave() {
  const { survey, questions, isSaving, originalQuestions, setSaving, markSaved, applyQuestionIdMappings } = useSurveyBuilderStore();

  const updateSurveyMutation = useUpdateSurvey();
  const syncQuestionsMutation = useSyncQuestions();

  const handleSave = useCallback(async () => {
    if (!survey || isSaving) return;

    setSaving(true);
    try {
      // Use survey's default language for all updates
      const languageCode = survey.defaultLanguage;

      // 1. Save survey metadata
      await updateSurveyMutation.mutateAsync({
        id: survey.id,
        data: {
          surveyId: survey.id,
          title: survey.title,
          description: survey.description,
          welcomeMessage: survey.welcomeMessage,
          thankYouMessage: survey.thankYouMessage,
          languageCode,
        },
      });

      // 2. Sync questions to backend
      // Calculate what changed between original and current questions
      const draftQuestions = questions.map((q) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        description: q.description,
        isRequired: q.isRequired,
        order: q.order,
        settings: {
          ...q.settings,
          // Options are stored in settings.options as string[]
          options: q.options.map((o) => o.text),
        },
      }));

      const changes = calculateQuestionChanges(originalQuestions || [], draftQuestions, languageCode);

      // Only sync if there are changes
      if (changes.toCreate.length > 0 || changes.toUpdate.length > 0 || changes.toDelete.length > 0) {
        const syncResult = await syncQuestionsMutation.mutateAsync({
          surveyId: survey.id,
          ...changes,
        });

        // Update local question IDs with real IDs from the server
        if (syncResult.created.length > 0) {
          const idMappings = syncResult.created.map((c) => ({
            tempId: c.tempId,
            realId: c.realId,
          }));
          applyQuestionIdMappings(idMappings);
        }
      }

      markSaved();
    } catch (err) {
      console.error('Save error:', err);
      throw err; // Re-throw to let interceptor handle it
    } finally {
      setSaving(false);
    }
  }, [survey, isSaving, questions, originalQuestions, updateSurveyMutation, syncQuestionsMutation, markSaved, setSaving, applyQuestionIdMappings]);

  return { handleSave };
}
