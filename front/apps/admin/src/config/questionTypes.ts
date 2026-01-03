// Centralized Question Type Configuration
// Icons, labels, descriptions, and colors for all question types

import type { LucideIcon } from 'lucide-react';
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

// ============ Types ============
export interface QuestionTypeConfig {
  icon: LucideIcon;
  labelKey: string;
  descriptionKey: string;
  color: string;
  /** Fallback label for non-i18n contexts */
  fallbackLabel: string;
}

// ============ Configuration ============
export const questionTypeConfig: Record<QuestionType, QuestionTypeConfig> = {
  [QuestionType.SingleChoice]: {
    icon: CircleDot,
    labelKey: 'questionTypeLabels.singleChoice',
    descriptionKey: 'questionTypeDescriptions.singleChoice',
    color: 'text-primary',
    fallbackLabel: 'Single Choice',
  },
  [QuestionType.MultipleChoice]: {
    icon: CheckSquare,
    labelKey: 'questionTypeLabels.multipleChoice',
    descriptionKey: 'questionTypeDescriptions.multipleChoice',
    color: 'text-secondary',
    fallbackLabel: 'Multiple Choice',
  },
  [QuestionType.Text]: {
    icon: Type,
    labelKey: 'questionTypeLabels.shortText',
    descriptionKey: 'questionTypeDescriptions.shortText',
    color: 'text-tertiary',
    fallbackLabel: 'Short Text',
  },
  [QuestionType.LongText]: {
    icon: AlignLeft,
    labelKey: 'questionTypeLabels.longText',
    descriptionKey: 'questionTypeDescriptions.longText',
    color: 'text-tertiary',
    fallbackLabel: 'Long Text',
  },
  [QuestionType.Rating]: {
    icon: Star,
    labelKey: 'questionTypeLabels.rating',
    descriptionKey: 'questionTypeDescriptions.rating',
    color: 'text-warning',
    fallbackLabel: 'Rating',
  },
  [QuestionType.Scale]: {
    icon: SlidersHorizontal,
    labelKey: 'questionTypeLabels.linearScale',
    descriptionKey: 'questionTypeDescriptions.linearScale',
    color: 'text-primary',
    fallbackLabel: 'Scale',
  },
  [QuestionType.Matrix]: {
    icon: Grid3X3,
    labelKey: 'questionTypeLabels.matrix',
    descriptionKey: 'questionTypeDescriptions.matrix',
    color: 'text-secondary',
    fallbackLabel: 'Matrix',
  },
  [QuestionType.Date]: {
    icon: Calendar,
    labelKey: 'questionTypeLabels.date',
    descriptionKey: 'questionTypeDescriptions.date',
    color: 'text-primary',
    fallbackLabel: 'Date',
  },
  [QuestionType.FileUpload]: {
    icon: Upload,
    labelKey: 'questionTypeLabels.fileUpload',
    descriptionKey: 'questionTypeDescriptions.fileUpload',
    color: 'text-tertiary',
    fallbackLabel: 'File Upload',
  },
  [QuestionType.Ranking]: {
    icon: GripVertical,
    labelKey: 'questionTypeLabels.ranking',
    descriptionKey: 'questionTypeDescriptions.ranking',
    color: 'text-secondary',
    fallbackLabel: 'Ranking',
  },
  [QuestionType.DateTime]: {
    icon: CalendarClock,
    labelKey: 'questionTypeLabels.dateTime',
    descriptionKey: 'questionTypeDescriptions.dateTime',
    color: 'text-primary',
    fallbackLabel: 'Date & Time',
  },
  [QuestionType.YesNo]: {
    icon: ToggleLeft,
    labelKey: 'questionTypeLabels.yesNo',
    descriptionKey: 'questionTypeDescriptions.yesNo',
    color: 'text-primary',
    fallbackLabel: 'Yes/No',
  },
  [QuestionType.Dropdown]: {
    icon: ChevronDown,
    labelKey: 'questionTypeLabels.dropdown',
    descriptionKey: 'questionTypeDescriptions.dropdown',
    color: 'text-secondary',
    fallbackLabel: 'Dropdown',
  },
  [QuestionType.NPS]: {
    icon: Gauge,
    labelKey: 'questionTypeLabels.nps',
    descriptionKey: 'questionTypeDescriptions.nps',
    color: 'text-primary',
    fallbackLabel: 'Net Promoter Score',
  },
  [QuestionType.Checkbox]: {
    icon: CheckSquare,
    labelKey: 'questionTypeLabels.checkbox',
    descriptionKey: 'questionTypeDescriptions.checkbox',
    color: 'text-secondary',
    fallbackLabel: 'Checkbox',
  },
  [QuestionType.Number]: {
    icon: Hash,
    labelKey: 'questionTypeLabels.number',
    descriptionKey: 'questionTypeDescriptions.number',
    color: 'text-tertiary',
    fallbackLabel: 'Number',
  },
  [QuestionType.ShortText]: {
    icon: Type,
    labelKey: 'questionTypeLabels.shortText',
    descriptionKey: 'questionTypeDescriptions.shortText',
    color: 'text-tertiary',
    fallbackLabel: 'Short Text',
  },
  [QuestionType.Email]: {
    icon: Mail,
    labelKey: 'questionTypeLabels.email',
    descriptionKey: 'questionTypeDescriptions.email',
    color: 'text-tertiary',
    fallbackLabel: 'Email',
  },
  [QuestionType.Phone]: {
    icon: Phone,
    labelKey: 'questionTypeLabels.phone',
    descriptionKey: 'questionTypeDescriptions.phone',
    color: 'text-tertiary',
    fallbackLabel: 'Phone',
  },
  [QuestionType.Url]: {
    icon: Link,
    labelKey: 'questionTypeLabels.url',
    descriptionKey: 'questionTypeDescriptions.url',
    color: 'text-tertiary',
    fallbackLabel: 'URL',
  },
};

// Default fallback for unknown types
export const unknownQuestionTypeConfig: QuestionTypeConfig = {
  icon: HelpCircle,
  labelKey: 'questionTypeLabels.unknown',
  descriptionKey: 'questionTypeDescriptions.unknown',
  color: 'text-on-surface-variant',
  fallbackLabel: 'Unknown',
};

// ============ Helper Functions ============

/**
 * Get question type configuration, with fallback for unknown types
 */
export function getQuestionTypeConfig(type: QuestionType): QuestionTypeConfig {
  return questionTypeConfig[type] || unknownQuestionTypeConfig;
}

/**
 * Get question type icon component
 */
export function getQuestionTypeIcon(type: QuestionType): LucideIcon {
  return getQuestionTypeConfig(type).icon;
}

/**
 * Get question type color class
 */
export function getQuestionTypeColor(type: QuestionType): string {
  return getQuestionTypeConfig(type).color;
}

/**
 * Get question type fallback label (non-i18n)
 */
export function getQuestionTypeFallbackLabel(type: QuestionType): string {
  return getQuestionTypeConfig(type).fallbackLabel;
}

/**
 * Get question type translation key for label
 */
export function getQuestionTypeLabelKey(type: QuestionType): string {
  return getQuestionTypeConfig(type).labelKey;
}

/**
 * Get question type translation key for description
 */
export function getQuestionTypeDescriptionKey(type: QuestionType): string {
  return getQuestionTypeConfig(type).descriptionKey;
}
