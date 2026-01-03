// Question Type Icons and Metadata
// Re-exports from centralized config with React component wrappers

import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { QuestionType } from '@/types';
import { getQuestionTypeConfig, getQuestionTypeIcon as getIcon, getQuestionTypeColor, getQuestionTypeLabelKey, getQuestionTypeDescriptionKey } from '@/config';

// Re-export color getter
export { getQuestionTypeColor } from '@/config';

export function QuestionTypeIcon({ type, className }: { type: QuestionType; className?: string }) {
  const config = getQuestionTypeConfig(type);
  const Icon = config.icon;
  return (
    <span className={`${config.color} ${className || ''}`}>
      <Icon className='w-5 h-5' />
    </span>
  );
}

export function getQuestionTypeLabel(type: QuestionType): string {
  return i18n.t(getQuestionTypeLabelKey(type));
}

export function getQuestionTypeDescription(type: QuestionType): string {
  return i18n.t(getQuestionTypeDescriptionKey(type));
}

// Hook for components that need reactive label/description updates
export function useQuestionTypeInfo(type: QuestionType) {
  const { t } = useTranslation();
  const config = getQuestionTypeConfig(type);
  const Icon = config.icon;
  return {
    icon: <Icon className='w-5 h-5' />,
    label: t(config.labelKey),
    description: t(config.descriptionKey),
    color: config.color,
  };
}

export const allQuestionTypes: QuestionType[] = [
  QuestionType.SingleChoice,
  QuestionType.MultipleChoice,
  QuestionType.Text,
  QuestionType.LongText,
  QuestionType.Rating,
  QuestionType.Scale,
  QuestionType.Matrix,
  QuestionType.Date,
  QuestionType.DateTime,
  QuestionType.FileUpload,
  QuestionType.Ranking,
  QuestionType.YesNo,
  QuestionType.Dropdown,
  QuestionType.NPS,
  QuestionType.Checkbox,
  QuestionType.Number,
  QuestionType.ShortText,
  QuestionType.Email,
  QuestionType.Phone,
  QuestionType.Url,
];
