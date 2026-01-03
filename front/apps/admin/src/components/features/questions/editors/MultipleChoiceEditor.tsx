// Multiple Choice Question Editor

import { Input, Switch } from '@/components/ui';
import { OptionListEditor } from './OptionListEditor';
import type { DraftQuestion, DraftOption } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';

interface MultipleChoiceEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, updates: Partial<DraftOption>) => void;
  onDeleteOption: (optionId: string) => void;
  onReorderOptions: (startIndex: number, endIndex: number) => void;
}

export function MultipleChoiceEditor({ question, onUpdateQuestion, onAddOption, onUpdateOption, onDeleteOption, onReorderOptions }: MultipleChoiceEditorProps) {
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

      {/* Options */}
      <OptionListEditor
        options={question.options}
        onAddOption={onAddOption}
        onUpdateOption={onUpdateOption}
        onDeleteOption={onDeleteOption}
        onReorderOptions={onReorderOptions}
        allowOther={question.settings.allowOther}
        onAllowOtherChange={(allow) => onUpdateQuestion({ settings: { ...question.settings, allowOther: allow } })}
        otherLabel={question.settings.otherLabel}
        onOtherLabelChange={(label) => onUpdateQuestion({ settings: { ...question.settings, otherLabel: label } })}
        optionIcon='checkbox'
      />

      {/* Settings */}
      <div className='space-y-3 pt-4 border-t border-outline-variant/30'>
        <Switch
          label={t('questionEditor.choice.randomize')}
          description={t('questionEditor.choice.randomizeDesc')}
          checked={question.settings.randomizeOptions || false}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, randomizeOptions: e.target.checked } })}
        />
      </div>
    </div>
  );
}
