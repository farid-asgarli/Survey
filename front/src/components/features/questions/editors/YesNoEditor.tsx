// Yes/No Question Editor with multiple display styles

import { Input } from '@/components/ui';
import { ThumbsUp, ThumbsDown, ToggleLeft, Check, X, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';
import { YesNoStyle } from '@/types/enums';

interface YesNoEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

// Yes/No style options with their icons
const yesNoStyles = [
  { value: YesNoStyle.Text, label: 'Text', icon: Type },
  { value: YesNoStyle.Thumbs, label: 'Thumbs', icon: ThumbsUp },
  { value: YesNoStyle.Toggle, label: 'Toggle', icon: ToggleLeft },
  { value: YesNoStyle.CheckX, label: 'Check/X', icon: Check },
] as const;

// Render preview for each style
function YesNoPreview({ style }: { style: YesNoStyle }) {
  switch (style) {
    case YesNoStyle.Thumbs:
      return (
        <div className="flex items-center gap-6">
          <button className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-outline-variant/50 bg-surface-container-lowest hover:border-green-500 hover:bg-green-50 transition-all">
            <ThumbsUp className="w-10 h-10 text-green-500" />
            <span className="text-sm font-medium text-on-surface">Yes</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-outline-variant/50 bg-surface-container-lowest hover:border-red-500 hover:bg-red-50 transition-all">
            <ThumbsDown className="w-10 h-10 text-red-500" />
            <span className="text-sm font-medium text-on-surface">No</span>
          </button>
        </div>
      );
    case YesNoStyle.Toggle:
      return (
        <div className="flex items-center gap-4">
          <span className="text-on-surface-variant">No</span>
          <div className="w-14 h-8 bg-surface-container rounded-full relative cursor-pointer border border-outline-variant">
            <div className="absolute left-1 top-1 w-6 h-6 bg-on-surface-variant/30 rounded-full transition-all" />
          </div>
          <span className="text-on-surface-variant">Yes</span>
        </div>
      );
    case YesNoStyle.CheckX:
      return (
        <div className="flex items-center gap-6">
          <button className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-outline-variant/50 bg-surface-container-lowest hover:border-green-500 hover:bg-green-50 transition-all">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium text-on-surface">Yes</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-outline-variant/50 bg-surface-container-lowest hover:border-red-500 hover:bg-red-50 transition-all">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium text-on-surface">No</span>
          </button>
        </div>
      );
    case YesNoStyle.Text:
    default:
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50 border-2 border-transparent hover:bg-surface-container cursor-pointer">
            <div className="w-5 h-5 rounded-full border-2 border-outline-variant" />
            <span className="text-on-surface">Yes</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50 border-2 border-transparent hover:bg-surface-container cursor-pointer">
            <div className="w-5 h-5 rounded-full border-2 border-outline-variant" />
            <span className="text-on-surface">No</span>
          </label>
        </div>
      );
  }
}

export function YesNoEditor({ question, onUpdateQuestion }: YesNoEditorProps) {
  const { t } = useTranslation();
  const yesNoStyle = (question.settings.yesNoStyle ?? YesNoStyle.Text) as YesNoStyle;

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

      {/* Display Style */}
      <div>
        <label className='block text-sm font-medium text-on-surface-variant mb-2'>
          {t('questionEditor.yesNo.style', 'Display Style')}
        </label>
        <div className='flex flex-wrap gap-2'>
          {yesNoStyles.map((style) => {
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
                <Icon className='w-4 h-4' />
                <span>{style.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className='p-4 rounded-2xl bg-surface-container/50'>
        <p className='text-sm text-on-surface-variant mb-3'>{t('questionEditor.preview')}</p>
        <YesNoPreview style={yesNoStyle} />
      </div>
    </div>
  );
}
