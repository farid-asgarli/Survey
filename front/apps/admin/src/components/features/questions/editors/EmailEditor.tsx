// Email Question Editor - with validation settings

import { Input } from '@/components/ui';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';

interface EmailEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function EmailEditor({ question, onUpdateQuestion }: EmailEditorProps) {
  const { t } = useTranslation();

  return (
    <div className='space-y-6'>
      {/* Question Text */}
      <Input
        label={t('questionEditor.question')}
        value={question.text}
        onChange={(e) => onUpdateQuestion({ text: e.target.value })}
        placeholder={t('questionEditor.common.enterQuestion')}
      />

      {/* Description */}
      <Input
        label={t('questionEditor.common.descriptionOptional')}
        value={question.description || ''}
        onChange={(e) => onUpdateQuestion({ description: e.target.value })}
        placeholder={t('questionEditor.common.addHelpText')}
        helperText={t('questionEditor.common.textBelowQuestion')}
      />

      {/* Placeholder */}
      <Input
        label={t('questionEditor.common.placeholderLabel')}
        value={question.settings.placeholder || ''}
        onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, placeholder: e.target.value } })}
        placeholder={t('questionEditor.email.placeholderDefault')}
        helperText={t('questionEditor.common.shownInsideField')}
      />

      {/* Max Length */}
      <Input
        type='number'
        label={t('questionEditor.common.maxCharacters')}
        value={question.settings.maxLength?.toString() || '256'}
        onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, maxLength: parseInt(e.target.value) || 256 } })}
        helperText={t('questionEditor.common.maxCharsAllowed')}
      />

      {/* Custom Error Message */}
      <Input
        label={t('questionEditor.email.validationMessage')}
        value={question.settings.validationMessage || ''}
        onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, validationMessage: e.target.value } })}
        placeholder={t('questionEditor.email.validationPlaceholder')}
        helperText={t('questionEditor.email.validationHelper')}
      />
    </div>
  );
}
