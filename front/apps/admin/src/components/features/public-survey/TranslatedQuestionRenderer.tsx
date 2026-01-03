// Translated Question Renderer - Wrapper that provides i18n labels to @survey/ui
//
// This component bridges the admin app's i18n system with the shared @survey/ui
// question renderers. It translates all labels using react-i18next and passes
// them to the translation-agnostic shared components.

import { useTranslation } from 'react-i18next';
import { QuestionRenderer as SharedQuestionRenderer, type QuestionLabels } from '@survey/ui';
import type { PublicQuestion, AnswerValue } from '@survey/types';

export interface TranslatedQuestionRendererProps {
  question: PublicQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Hook that builds QuestionLabels from i18n translations
 */
export function useQuestionLabels(): QuestionLabels {
  const { t } = useTranslation();

  return {
    // Common labels
    placeholder: t('common.enterYourAnswer', 'Your answer'),
    other: t('questionRenderers.other', 'Other'),
    pleaseSpecify: t('questionRenderers.pleaseSpecify', 'Please specify...'),

    // File upload labels
    dropFilesHere: t('questionRenderers.dropFilesHere', 'Drop files here or click to upload'),
    maxFilesText: t('questionRenderers.maxFiles', 'Maximum {count} file(s), up to {size}MB each'),
    allowedTypesPrefix: t('questionRenderers.allowedTypes', 'Allowed types:'),

    // Ranking labels
    dragToReorder: t('questionRenderers.dragToReorder', 'Drag to reorder'),

    // Yes/No labels
    yes: t('common.yes', 'Yes'),
    no: t('common.no', 'No'),

    // Validation labels
    invalidEmail: t('validation.invalidEmail', 'Please enter a valid email address'),
    invalidPhone: t('validation.invalidPhone', 'Please enter a valid phone number'),
    invalidUrl: t('validation.invalidUrl', 'Please enter a valid URL'),
    invalidNumber: t('validation.invalidNumber', 'Please enter a valid number'),
    minValue: t('validation.minValue', 'Value must be at least {min}'),
    maxValue: t('validation.maxValue', 'Value must be at most {max}'),
    required: t('validation.required', 'This field is required'),
    unsupportedType: t('questionRenderers.unsupportedType', 'Unsupported question type: {type}'),
  };
}

/**
 * TranslatedQuestionRenderer - A wrapper around @survey/ui QuestionRenderer
 * that provides translated labels from the admin app's i18n system.
 *
 * Use this component in the admin app whenever you need to render a question
 * with translated labels.
 */
export function TranslatedQuestionRenderer({ question, value, onChange, error, disabled }: TranslatedQuestionRendererProps) {
  const labels = useQuestionLabels();

  return <SharedQuestionRenderer question={question} value={value} onChange={onChange} error={error} disabled={disabled} labels={labels} />;
}

// Re-export the props type for convenience
export type { QuestionLabels };
