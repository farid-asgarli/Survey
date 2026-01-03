// Yes/No Question Editor with multiple display styles

import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';
import { YesNoStyle } from '@/types/enums';
import { YES_NO_STYLE_OPTIONS } from '@/config';

interface YesNoEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function YesNoEditor({ question, onUpdateQuestion }: YesNoEditorProps) {
  const { t } = useTranslation();
  const yesNoStyle = (question.settings.yesNoStyle ?? YesNoStyle.Text) as YesNoStyle;

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

      {/* Display Style */}
      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-2">{t('questionEditor.yesNo.style', 'Display Style')}</label>
        <div className="flex flex-wrap gap-2">
          {YES_NO_STYLE_OPTIONS.map((style) => {
            const Icon = style.icon;
            return (
              <button
                key={style.value}
                onClick={() => onUpdateQuestion({ settings: { ...question.settings, yesNoStyle: style.value } })}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all',
                  yesNoStyle === style.value
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
    </div>
  );
}
