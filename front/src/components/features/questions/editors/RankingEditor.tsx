// Ranking Question Editor

import { Input, Switch } from '@/components/ui';
import { OptionListEditor } from './OptionListEditor';
import type { DraftQuestion, DraftOption } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';

interface RankingEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, updates: Partial<DraftOption>) => void;
  onDeleteOption: (optionId: string) => void;
  onReorderOptions: (startIndex: number, endIndex: number) => void;
}

export function RankingEditor({ question, onUpdateQuestion, onAddOption, onUpdateOption, onDeleteOption, onReorderOptions }: RankingEditorProps) {
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
        helperText={t('questionTypes.ranking.helper')}
      />

      {/* Options */}
      <OptionListEditor
        options={question.options}
        onAddOption={onAddOption}
        onUpdateOption={onUpdateOption}
        onDeleteOption={onDeleteOption}
        onReorderOptions={onReorderOptions}
        minOptions={2}
        optionIcon='number'
      />

      {/* Settings */}
      <div className='space-y-3 pt-4 border-t border-outline-variant/30'>
        <Switch
          label={t('questionEditor.ranking.randomize')}
          description={t('questionEditor.ranking.randomizeDesc')}
          checked={question.settings.randomizeOptions || false}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, randomizeOptions: e.target.checked } })}
        />
      </div>

      {/* Preview */}
      <div className='p-4 rounded-2xl bg-surface-container/50'>
        <p className='text-sm text-on-surface-variant mb-3'>{t('questionTypes.ranking.previewLabel')}</p>
        <div className='space-y-2'>
          {question.options.map((option, index) => (
            <div key={option.id} className='flex items-center gap-3 p-3 rounded-xl bg-surface cursor-move'>
              <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-medium'>{index + 1}</div>
              <span className='text-on-surface'>{option.text}</span>
              <div className='ml-auto text-on-surface-variant/50'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 8h16M4 16h16' />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
