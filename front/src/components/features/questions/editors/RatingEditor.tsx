// Rating Question Editor (Star Rating with multiple styles)

import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';
import { RatingStyle } from '@/types/enums';
import { RATING_STYLE_OPTIONS, RATING_SCALE_OPTIONS } from '@/config';

interface RatingEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function RatingEditor({ question, onUpdateQuestion }: RatingEditorProps) {
  const { t } = useTranslation();
  const maxValue = question.settings.maxValue || 5;
  const ratingStyle = (question.settings.ratingStyle ?? RatingStyle.Stars) as RatingStyle;

  return (
    <div className="space-y-6">
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

      {/* Rating Style */}
      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-2">{t('questionEditor.rating.style', 'Rating Style')}</label>
        <div className="flex flex-wrap gap-2">
          {RATING_STYLE_OPTIONS.map((style) => {
            const Icon = style.icon;
            return (
              <button
                key={style.value}
                onClick={() => onUpdateQuestion({ settings: { ...question.settings, ratingStyle: style.value } })}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all',
                  ratingStyle === style.value
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{style.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Scale */}
      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-2">{t('questionEditor.options.maxRating')}</label>
        <div className="flex gap-2">
          {RATING_SCALE_OPTIONS.map((value) => (
            <button
              key={value}
              onClick={() => onUpdateQuestion({ settings: { ...question.settings, maxValue: value } })}
              className={cn(
                'px-4 py-2 rounded-xl border transition-all',
                maxValue === value
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('questionEditor.rating.lowLabel')}
          value={question.settings.minLabel || ''}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, minLabel: e.target.value } })}
          placeholder={t('questionEditor.rating.lowPlaceholder')}
        />
        <Input
          label={t('questionEditor.rating.highLabel')}
          value={question.settings.maxLabel || ''}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, maxLabel: e.target.value } })}
          placeholder={t('questionEditor.rating.highPlaceholder')}
        />
      </div>
    </div>
  );
}
