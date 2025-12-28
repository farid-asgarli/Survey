// Number Question Editor - with min/max value settings

import { Input } from '@/components/ui';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';

interface NumberEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function NumberEditor({ question, onUpdateQuestion }: NumberEditorProps) {
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
        placeholder={t('questionEditor.number.placeholderDefault')}
        helperText={t('questionEditor.common.shownInsideField')}
      />

      {/* Min/Max Value */}
      <div className='grid grid-cols-2 gap-4'>
        <Input
          type='number'
          label={t('questionEditor.number.minValue')}
          value={question.settings.minValue?.toString() || ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            onUpdateQuestion({ settings: { ...question.settings, minValue: value } });
          }}
          placeholder={t('questionEditor.number.noMinimum')}
          helperText={t('questionEditor.number.leaveEmptyMin')}
        />
        <Input
          type='number'
          label={t('questionEditor.number.maxValue')}
          value={question.settings.maxValue?.toString() || ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            onUpdateQuestion({ settings: { ...question.settings, maxValue: value } });
          }}
          placeholder={t('questionEditor.number.noMaximum')}
          helperText={t('questionEditor.number.leaveEmptyMax')}
        />
      </div>
    </div>
  );
}
