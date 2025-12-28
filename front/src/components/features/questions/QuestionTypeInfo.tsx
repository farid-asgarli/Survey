// Question Type Icons and Metadata

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import {
  CircleDot,
  CheckSquare,
  Type,
  AlignLeft,
  Star,
  SlidersHorizontal,
  Grid3X3,
  Calendar,
  Upload,
  GripVertical,
  ToggleLeft,
  ChevronDown,
  Gauge,
  Hash,
  Mail,
  HelpCircle,
  CalendarClock,
  Phone,
  Link,
} from 'lucide-react';
import { QuestionType } from '@/types';

interface QuestionTypeInfo {
  icon: ReactNode;
  labelKey: string;
  descriptionKey: string;
  color: string;
}

const questionTypeInfo: Record<QuestionType, QuestionTypeInfo> = {
  [QuestionType.SingleChoice]: {
    icon: <CircleDot className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.singleChoice',
    descriptionKey: 'questionTypeDescriptions.singleChoice',
    color: 'text-primary',
  },
  [QuestionType.MultipleChoice]: {
    icon: <CheckSquare className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.multipleChoice',
    descriptionKey: 'questionTypeDescriptions.multipleChoice',
    color: 'text-secondary',
  },
  [QuestionType.Text]: {
    icon: <Type className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.shortText',
    descriptionKey: 'questionTypeDescriptions.shortText',
    color: 'text-tertiary',
  },
  [QuestionType.LongText]: {
    icon: <AlignLeft className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.longText',
    descriptionKey: 'questionTypeDescriptions.longText',
    color: 'text-tertiary',
  },
  [QuestionType.Rating]: {
    icon: <Star className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.rating',
    descriptionKey: 'questionTypeDescriptions.rating',
    color: 'text-warning',
  },
  [QuestionType.Scale]: {
    icon: <SlidersHorizontal className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.linearScale',
    descriptionKey: 'questionTypeDescriptions.linearScale',
    color: 'text-primary',
  },
  [QuestionType.Matrix]: {
    icon: <Grid3X3 className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.matrix',
    descriptionKey: 'questionTypeDescriptions.matrix',
    color: 'text-secondary',
  },
  [QuestionType.Date]: {
    icon: <Calendar className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.date',
    descriptionKey: 'questionTypeDescriptions.date',
    color: 'text-primary',
  },
  [QuestionType.FileUpload]: {
    icon: <Upload className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.fileUpload',
    descriptionKey: 'questionTypeDescriptions.fileUpload',
    color: 'text-tertiary',
  },
  [QuestionType.Ranking]: {
    icon: <GripVertical className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.ranking',
    descriptionKey: 'questionTypeDescriptions.ranking',
    color: 'text-secondary',
  },
  [QuestionType.DateTime]: {
    icon: <CalendarClock className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.dateTime',
    descriptionKey: 'questionTypeDescriptions.dateTime',
    color: 'text-primary',
  },
  [QuestionType.YesNo]: {
    icon: <ToggleLeft className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.yesNo',
    descriptionKey: 'questionTypeDescriptions.yesNo',
    color: 'text-primary',
  },
  [QuestionType.Dropdown]: {
    icon: <ChevronDown className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.dropdown',
    descriptionKey: 'questionTypeDescriptions.dropdown',
    color: 'text-secondary',
  },
  [QuestionType.NPS]: {
    icon: <Gauge className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.nps',
    descriptionKey: 'questionTypeDescriptions.nps',
    color: 'text-primary',
  },
  [QuestionType.Checkbox]: {
    icon: <CheckSquare className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.checkbox',
    descriptionKey: 'questionTypeDescriptions.checkbox',
    color: 'text-secondary',
  },
  [QuestionType.Number]: {
    icon: <Hash className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.number',
    descriptionKey: 'questionTypeDescriptions.number',
    color: 'text-tertiary',
  },
  [QuestionType.ShortText]: {
    icon: <Type className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.shortText',
    descriptionKey: 'questionTypeDescriptions.shortText',
    color: 'text-tertiary',
  },
  [QuestionType.Email]: {
    icon: <Mail className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.email',
    descriptionKey: 'questionTypeDescriptions.email',
    color: 'text-tertiary',
  },
  [QuestionType.Phone]: {
    icon: <Phone className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.phone',
    descriptionKey: 'questionTypeDescriptions.phone',
    color: 'text-tertiary',
  },
  [QuestionType.Url]: {
    icon: <Link className="w-5 h-5" />,
    labelKey: 'questionTypeLabels.url',
    descriptionKey: 'questionTypeDescriptions.url',
    color: 'text-tertiary',
  },
};

// Default fallback for unknown types
const unknownTypeInfo: QuestionTypeInfo = {
  icon: <HelpCircle className="w-5 h-5" />,
  labelKey: 'questionTypeLabels.unknown',
  descriptionKey: 'questionTypeDescriptions.unknown',
  color: 'text-on-surface-variant',
};

function getTypeInfo(type: QuestionType): QuestionTypeInfo {
  return questionTypeInfo[type] || unknownTypeInfo;
}

export function QuestionTypeIcon({ type, className }: { type: QuestionType; className?: string }) {
  const info = getTypeInfo(type);
  return <span className={`${info.color} ${className || ''}`}>{info.icon}</span>;
}

export function getQuestionTypeLabel(type: QuestionType): string {
  const info = getTypeInfo(type);
  return i18n.t(info.labelKey);
}

export function getQuestionTypeDescription(type: QuestionType): string {
  const info = getTypeInfo(type);
  return i18n.t(info.descriptionKey);
}

export function getQuestionTypeColor(type: QuestionType): string {
  return getTypeInfo(type).color;
}

// Hook for components that need reactive label/description updates
export function useQuestionTypeInfo(type: QuestionType) {
  const { t } = useTranslation();
  const info = getTypeInfo(type);
  return {
    icon: info.icon,
    label: t(info.labelKey),
    description: t(info.descriptionKey),
    color: info.color,
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
