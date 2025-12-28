// Text (Short Text) Question Editor

import { Input } from '@/components/ui';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';

interface TextEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function TextEditor({ question, onUpdateQuestion }: TextEditorProps) {
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
        placeholder={t('questionEditor.common.enterPlaceholder')}
        helperText={t('questionEditor.common.shownInsideField')}
      />

      {/* Max Length */}
      <Input
        type='number'
        label={t('questionEditor.common.maxCharacters')}
        value={question.settings.maxLength?.toString() || '255'}
        onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, maxLength: parseInt(e.target.value) || 255 } })}
        helperText={t('questionEditor.common.maxCharsAllowed')}
      />
    </div>
  );
}
