// Hook for translation-aware question editing
// Provides display values and update handlers that route to the correct store/API
// based on whether we're editing the default language or a translation

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useSurveyBuilderStore } from '@/stores';
import { useSurveyTranslations, useBulkUpdateTranslations } from './queries/useTranslations';
import type { DraftQuestion, DraftOption } from '@/stores/surveyBuilderStore';
import type { TranslatedQuestionSettingsDto } from '@/types';

export interface TranslatedEditorQuestion {
  /** The question data */
  question: DraftQuestion;
  /** Text to display (translated or original) */
  displayText: string;
  /** Description to display (translated or original) */
  displayDescription: string;
  /** Options with translated text */
  displayOptions: Array<DraftOption & { displayText: string }>;
  /** Translated settings (minLabel, maxLabel, placeholder, etc.) */
  displaySettings: {
    minLabel?: string;
    maxLabel?: string;
    placeholder?: string;
    validationMessage?: string;
    otherLabel?: string;
    matrixRows?: string[];
    matrixColumns?: string[];
  };
  /** Whether currently showing fallback (untranslated) content */
  isUsingFallback: boolean;
  /** Whether we're editing a translation (non-default language) */
  isEditingTranslation: boolean;
  /** Whether translation data is loading */
  isTranslationLoading: boolean;
  /** Current editing language code */
  editingLanguage: string;
  /** Default language code */
  defaultLanguage: string;
}

export interface QuestionEditorTranslationHandlers {
  /** Update question text (routes to translation or store) */
  updateText: (text: string) => void;
  /** Update question description (routes to translation or store) */
  updateDescription: (description: string) => void;
  /** Update option text (routes to translation or store) */
  updateOptionText: (optionId: string, text: string) => void;
  /** Update translatable settings field (routes to translation or store) */
  updateTranslatableSetting: (field: keyof TranslatedQuestionSettingsDto, value: string | string[]) => void;
  /** Update non-translatable question properties (always goes to store) */
  updateSettings: (updates: Partial<DraftQuestion>) => void;
}

export interface UseQuestionEditorTranslationReturn {
  /** Translated question data with display values */
  translated: TranslatedEditorQuestion;
  /** Handlers for updating question content */
  handlers: QuestionEditorTranslationHandlers;
  /** Whether a translation save is currently in progress */
  isSaving: boolean;
  /** Error from the last failed save attempt, if any */
  saveError: Error | null;
  /** Whether there are unsaved pending changes */
  hasPendingChanges: boolean;
  /** Immediately flush any pending changes to the server (useful for form submission or navigation) */
  flush: () => void;
}

// Local state for pending translation edits (optimistic updates)
interface PendingTranslationEdits {
  text?: string;
  description?: string;
  options?: string[];
  settings?: Partial<TranslatedQuestionSettingsDto>;
}

/**
 * Hook for translation-aware question editing.
 *
 * When editing the default language: updates go directly to the survey builder store.
 * When editing a translation: text updates go to the translations API with debouncing.
 */
export function useQuestionEditorTranslation(question: DraftQuestion | null): UseQuestionEditorTranslationReturn | null {
  const survey = useSurveyBuilderStore((s) => s.survey);
  const editingLanguage = useSurveyBuilderStore((s) => s.editingLanguage);
  const updateQuestion = useSurveyBuilderStore((s) => s.updateQuestion);
  const updateOption = useSurveyBuilderStore((s) => s.updateOption);

  const defaultLanguage = survey?.defaultLanguage || 'en';
  const isEditingTranslation = editingLanguage !== defaultLanguage;

  // Fetch translations when editing non-default language
  const shouldFetchTranslations = isEditingTranslation && !!survey?.id;
  const { data: translationsData, isLoading } = useSurveyTranslations(shouldFetchTranslations ? survey?.id : undefined);

  // Mutation for updating translations with retry logic
  const bulkUpdateMutation = useBulkUpdateTranslations({
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Local state for optimistic updates during translation editing
  // We track the "context key" to know when edits should be invalidated
  const contextKey = `${editingLanguage}-${question?.id}`;
  const [pendingEdits, setPendingEdits] = useState<{ key: string; edits: PendingTranslationEdits }>({
    key: contextKey,
    edits: {},
  });
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current pending edits, but only if they match the current context
  // This automatically "resets" when language/question changes without needing setState in effect
  const currentPendingEdits = useMemo(() => {
    return pendingEdits.key === contextKey ? pendingEdits.edits : {};
  }, [pendingEdits, contextKey]);

  // Cleanup timer on unmount and on context change
  // This prevents stale timers from firing for wrong question/language
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [contextKey]);

  // Get server-side translated content for this question
  const serverTranslation = useMemo(() => {
    if (!question || !isEditingTranslation) return null;

    const questionTranslations = translationsData?.questions?.find((q) => q.questionId === question.id);
    const translation = questionTranslations?.translations?.find((t) => t.languageCode === editingLanguage);
    const defaultTranslation = questionTranslations?.translations?.find((t) => t.languageCode === defaultLanguage || t.isDefault);

    return { translation, defaultTranslation };
  }, [question, isEditingTranslation, translationsData, editingLanguage, defaultLanguage]);

  // Get translated content for this question (with optimistic local state)
  const translated = useMemo((): TranslatedEditorQuestion | null => {
    if (!question) return null;

    // Default display settings from question
    const baseDisplaySettings = {
      minLabel: question.settings?.minLabel,
      maxLabel: question.settings?.maxLabel,
      placeholder: question.settings?.placeholder,
      validationMessage: question.settings?.validationMessage,
      otherLabel: question.settings?.otherLabel,
      matrixRows: question.settings?.matrixRows,
      matrixColumns: question.settings?.matrixColumns,
    };

    // Default (no translation needed)
    if (!isEditingTranslation) {
      return {
        question,
        displayText: question.text,
        displayDescription: question.description || '',
        displayOptions: question.options.map((opt) => ({
          ...opt,
          displayText: opt.text,
        })),
        displaySettings: baseDisplaySettings,
        isUsingFallback: false,
        isEditingTranslation: false,
        isTranslationLoading: false,
        editingLanguage,
        defaultLanguage,
      };
    }

    const { translation, defaultTranslation } = serverTranslation ?? {};

    const hasTranslation = translation && translation.text && translation.text.trim() !== '';
    const translatedSettings = translation?.translatedSettings;
    const defaultTranslatedSettings = defaultTranslation?.translatedSettings;

    // Map options with their translations, prioritizing pending edits
    const translatedOptions = translatedSettings?.options;
    const defaultTranslatedOptions = defaultTranslatedSettings?.options;

    const displayOptions = question.options.map((opt, index) => {
      // Use pending edit if available, otherwise server value
      const pendingOptionText = currentPendingEdits.options?.[index];
      const translatedText = translatedOptions?.[index];
      const defaultText = defaultTranslatedOptions?.[index];

      return {
        ...opt,
        displayText: pendingOptionText ?? translatedText ?? defaultText ?? opt.text,
      };
    });

    // Build display settings with translated values from server
    const serverSettings = {
      minLabel: translatedSettings?.minLabel || defaultTranslatedSettings?.minLabel || question.settings?.minLabel,
      maxLabel: translatedSettings?.maxLabel || defaultTranslatedSettings?.maxLabel || question.settings?.maxLabel,
      placeholder: translatedSettings?.placeholder || defaultTranslatedSettings?.placeholder || question.settings?.placeholder,
      validationMessage:
        translatedSettings?.validationMessage || defaultTranslatedSettings?.validationMessage || question.settings?.validationMessage,
      otherLabel: translatedSettings?.otherLabel || defaultTranslatedSettings?.otherLabel || question.settings?.otherLabel,
      matrixRows: translatedSettings?.matrixRows || defaultTranslatedSettings?.matrixRows || question.settings?.matrixRows,
      matrixColumns: translatedSettings?.matrixColumns || defaultTranslatedSettings?.matrixColumns || question.settings?.matrixColumns,
    };

    // Merge with pending edits (optimistic updates take priority)
    const displaySettings = {
      minLabel: currentPendingEdits.settings?.minLabel ?? serverSettings.minLabel,
      maxLabel: currentPendingEdits.settings?.maxLabel ?? serverSettings.maxLabel,
      placeholder: currentPendingEdits.settings?.placeholder ?? serverSettings.placeholder,
      validationMessage: currentPendingEdits.settings?.validationMessage ?? serverSettings.validationMessage,
      otherLabel: currentPendingEdits.settings?.otherLabel ?? serverSettings.otherLabel,
      matrixRows: currentPendingEdits.settings?.matrixRows ?? serverSettings.matrixRows,
      matrixColumns: currentPendingEdits.settings?.matrixColumns ?? serverSettings.matrixColumns,
    };

    // Server text values
    const serverText = hasTranslation ? translation.text : defaultTranslation?.text || question.text;
    const serverDescription = hasTranslation ? translation.description || '' : defaultTranslation?.description || question.description || '';

    return {
      question,
      displayText: currentPendingEdits.text ?? serverText,
      displayDescription: currentPendingEdits.description ?? serverDescription,
      displayOptions,
      displaySettings,
      isUsingFallback: !hasTranslation && !currentPendingEdits.text,
      isEditingTranslation: true,
      isTranslationLoading: isLoading,
      editingLanguage,
      defaultLanguage,
    };
  }, [question, isEditingTranslation, serverTranslation, editingLanguage, defaultLanguage, isLoading, currentPendingEdits]);

  // Ref to always access the latest flush function (avoids stale closure in setTimeout)
  const flushTranslationUpdateRef = useRef<(currentEdits: PendingTranslationEdits) => void>(() => {});

  // Debounced API call for translation updates
  const flushTranslationUpdate = useCallback(
    (currentEdits: PendingTranslationEdits) => {
      if (!survey?.id || !question || !translated) return;

      // Build current translated options array (maintaining order with question.options)
      const currentOptions = translated.displayOptions.map((o) => o.displayText);
      const currentSettings = translated.displaySettings;

      // Build the translation update payload
      const questionTranslationUpdate = {
        questionId: question.id,
        languageCode: editingLanguage,
        text: currentEdits.text ?? translated.displayText,
        description: currentEdits.description ?? translated.displayDescription ?? '',
        translatedSettings: {
          options: currentEdits.options ?? currentOptions,
          minLabel: currentEdits.settings?.minLabel ?? currentSettings.minLabel,
          maxLabel: currentEdits.settings?.maxLabel ?? currentSettings.maxLabel,
          placeholder: currentEdits.settings?.placeholder ?? currentSettings.placeholder,
          validationMessage: currentEdits.settings?.validationMessage ?? currentSettings.validationMessage,
          otherLabel: currentEdits.settings?.otherLabel ?? currentSettings.otherLabel,
          matrixRows: currentEdits.settings?.matrixRows ?? currentSettings.matrixRows,
          matrixColumns: currentEdits.settings?.matrixColumns ?? currentSettings.matrixColumns,
        },
      };

      bulkUpdateMutation.mutate(
        {
          surveyId: survey.id,
          data: {
            translations: [],
            questionTranslations: [questionTranslationUpdate],
          },
        },
        {
          onError: (error) => {
            // Log error - in production, consider showing a toast notification
            console.error('Failed to save translation:', error);
          },
        }
      );
    },
    [survey, question, editingLanguage, translated, bulkUpdateMutation]
  );

  // Keep the ref updated with the latest flush function
  useEffect(() => {
    flushTranslationUpdateRef.current = flushTranslationUpdate;
  }, [flushTranslationUpdate]);

  // Handler to update translation with debouncing
  const updateTranslationDebounced = useCallback(
    (updates: PendingTranslationEdits) => {
      // Immediately update local state (optimistic)
      setPendingEdits((prev) => {
        // Use current edits if same context, otherwise start fresh
        const currentEdits = prev.key === contextKey ? prev.edits : {};
        const newEdits: PendingTranslationEdits = {
          ...currentEdits,
          ...updates,
          settings: updates.settings ? { ...currentEdits.settings, ...updates.settings } : currentEdits.settings,
        };

        // Clear existing timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Set new debounce timer to flush to API (using ref to avoid stale closure)
        debounceTimerRef.current = setTimeout(() => {
          flushTranslationUpdateRef.current(newEdits);
          debounceTimerRef.current = null;
        }, 500); // 500ms debounce

        return { key: contextKey, edits: newEdits };
      });
    },
    [contextKey]
  );

  // Create handlers
  const handlers = useMemo(
    (): QuestionEditorTranslationHandlers => ({
      updateText: (text: string) => {
        if (!question) return;

        if (isEditingTranslation) {
          updateTranslationDebounced({ text });
        } else {
          updateQuestion(question.id, { text });
        }
      },

      updateDescription: (description: string) => {
        if (!question) return;

        if (isEditingTranslation) {
          updateTranslationDebounced({ description });
        } else {
          updateQuestion(question.id, { description });
        }
      },

      updateOptionText: (optionId: string, text: string) => {
        if (!question) return;

        if (isEditingTranslation) {
          // Find the index of the option being updated
          const optionIndex = question.options.findIndex((o) => o.id === optionId);
          if (optionIndex === -1) return;

          // Build updated options array (maintaining order)
          const currentOptions = translated?.displayOptions.map((o) => o.displayText) ?? question.options.map((o) => o.text);
          const updatedOptions = currentOptions.map((opt, idx) => (idx === optionIndex ? text : opt));

          updateTranslationDebounced({ options: updatedOptions });
        } else {
          updateOption(question.id, optionId, { text });
        }
      },

      updateTranslatableSetting: (field: keyof TranslatedQuestionSettingsDto, value: string | string[]) => {
        if (!question) return;

        if (isEditingTranslation) {
          // Update the translated setting with debouncing
          updateTranslationDebounced({ settings: { [field]: value } });
        } else {
          // Update the base setting in the store
          updateQuestion(question.id, {
            settings: {
              ...(question.settings ?? {}),
              [field]: value,
            },
          });
        }
      },

      // Settings are never translated - always update the store directly
      updateSettings: (updates: Partial<DraftQuestion>) => {
        if (!question) return;
        updateQuestion(question.id, updates);
      },
    }),
    [question, isEditingTranslation, updateTranslationDebounced, updateQuestion, updateOption, translated]
  );

  // Check if there are pending changes
  const hasPendingChanges = useMemo(() => {
    return Object.keys(currentPendingEdits).length > 0;
  }, [currentPendingEdits]);

  // Flush function to immediately save pending changes
  const flush = useCallback(() => {
    if (!hasPendingChanges) return;

    // Clear the debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Immediately flush current pending edits
    flushTranslationUpdateRef.current(currentPendingEdits);
  }, [hasPendingChanges, currentPendingEdits]);

  if (!question || !translated) return null;

  return {
    translated,
    handlers,
    isSaving: bulkUpdateMutation.isPending,
    saveError: bulkUpdateMutation.error,
    hasPendingChanges,
    flush,
  };
}
