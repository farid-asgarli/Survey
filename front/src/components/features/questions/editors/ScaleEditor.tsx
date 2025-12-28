// Scale Question Editor (Linear Scale / NPS)

import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';

interface ScaleEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function ScaleEditor({ question, onUpdateQuestion }: ScaleEditorProps) {
  const { t } = useTranslation();
  const minValue = question.settings.minValue ?? 0;
  const maxValue = question.settings.maxValue ?? 10;

  // Common scale presets
  const presets = [
    { label: t('questionTypes.scale.presets.nps'), min: 0, max: 10 },
    { label: t('questionTypes.scale.presets.1-5'), min: 1, max: 5 },
    { label: t('questionTypes.scale.presets.1-7'), min: 1, max: 7 },
    { label: t('questionTypes.scale.presets.1-10'), min: 1, max: 10 },
  ];

  const applyPreset = (min: number, max: number) => {
    onUpdateQuestion({
      settings: {
        ...question.settings,
        minValue: min,
        maxValue: max,
      },
    });
  };

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

      {/* Scale Presets */}
      <div>
        <label className='block text-sm font-medium text-on-surface-variant mb-2'>{t('questionTypes.scale.scaleType')}</label>
        <div className='flex flex-wrap gap-2'>
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.min, preset.max)}
              className={cn(
                'px-4 py-2 rounded-xl border transition-all text-sm',
                minValue === preset.min && maxValue === preset.max
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range */}
      <div className='grid grid-cols-2 gap-4'>
        <Input
          type='number'
          label={t('questionEditor.scale.minValue')}
          value={minValue.toString()}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, minValue: parseInt(e.target.value) || 0 } })}
        />
        <Input
          type='number'
          label={t('questionEditor.scale.maxValue')}
          value={maxValue.toString()}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, maxValue: parseInt(e.target.value) || 10 } })}
        />
      </div>

      {/* Labels */}
      <div className='grid grid-cols-2 gap-4'>
        <Input
          label={t('questionEditor.scale.lowLabel')}
          value={question.settings.minLabel || ''}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, minLabel: e.target.value } })}
          placeholder={t('questionEditor.scale.lowPlaceholder')}
        />
        <Input
          label={t('questionEditor.scale.highLabel')}
          value={question.settings.maxLabel || ''}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, maxLabel: e.target.value } })}
          placeholder={t('questionEditor.scale.highPlaceholder')}
        />
      </div>

      {/* Preview */}
      <div className='p-4 rounded-2xl bg-surface-container/50'>
        <p className='text-sm text-on-surface-variant mb-3'>{t('questionEditor.preview')}</p>
        <div className='space-y-2'>
          <div className='flex justify-between text-xs text-on-surface-variant'>
            <span>{question.settings.minLabel || minValue}</span>
            <span>{question.settings.maxLabel || maxValue}</span>
          </div>
          <div className='flex gap-1'>
            {Array.from({ length: maxValue - minValue + 1 }, (_, i) => (
              <button
                key={i}
                disabled
                className='flex-1 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface-variant text-sm hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors'
              >
                {minValue + i}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
