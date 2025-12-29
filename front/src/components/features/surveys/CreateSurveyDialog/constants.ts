import { ClipboardList, MessageSquareHeart, MessagesSquare, FlaskConical, Users, type LucideIcon } from 'lucide-react';
import { SurveyType, CxMetricType } from '@/types';
import type { SurveyCategory, CxMetricOption } from './types';

// Survey category definitions with translation keys
export const SURVEY_CATEGORIES: SurveyCategory[] = [
  {
    id: SurveyType.Classic,
    nameKey: 'createSurvey.categories.classic.name',
    descriptionKey: 'createSurvey.categories.classic.description',
    icon: 'ClipboardList',
    previewComponent: 'ClassicPreview',
    features: ['200+ templates', 'All question types', 'Advanced logic'],
    templateCount: 200,
  },
  {
    id: SurveyType.CustomerExperience,
    nameKey: 'createSurvey.categories.customerExperience.name',
    descriptionKey: 'createSurvey.categories.customerExperience.description',
    icon: 'MessageSquareHeart',
    previewComponent: 'CxPreview',
    features: ['NPS', 'CES', 'CSAT'],
  },
  {
    id: SurveyType.Conversational,
    nameKey: 'createSurvey.categories.conversational.name',
    descriptionKey: 'createSurvey.categories.conversational.description',
    icon: 'MessagesSquare',
    previewComponent: 'ConversationalPreview',
    features: ['Chat-style UI', '50+ templates'],
    templateCount: 50,
  },
  {
    id: SurveyType.Research,
    nameKey: 'createSurvey.categories.research.name',
    descriptionKey: 'createSurvey.categories.research.description',
    icon: 'FlaskConical',
    previewComponent: 'ResearchPreview',
    features: ['Conjoint Analysis', 'MaxDiff', 'Gabor-Granger'],
    isComingSoon: true,
  },
  {
    id: SurveyType.Assessment360,
    nameKey: 'createSurvey.categories.assessment360.name',
    descriptionKey: 'createSurvey.categories.assessment360.description',
    icon: 'Users',
    previewComponent: 'Assessment360Preview',
    features: ['Multi-rater feedback', 'Anonymity controls'],
    isComingSoon: true,
  },
];

// Customer Experience metric definitions
export const CX_METRICS: CxMetricOption[] = [
  {
    id: CxMetricType.NPS,
    nameKey: 'createSurvey.cxMetrics.nps.name',
    descriptionKey: 'createSurvey.cxMetrics.nps.description',
    questionKey: 'createSurvey.cxMetrics.nps.question',
    scaleMin: 0,
    scaleMax: 10,
    minLabelKey: 'createSurvey.cxMetrics.nps.minLabel',
    maxLabelKey: 'createSurvey.cxMetrics.nps.maxLabel',
  },
  {
    id: CxMetricType.CES,
    nameKey: 'createSurvey.cxMetrics.ces.name',
    descriptionKey: 'createSurvey.cxMetrics.ces.description',
    questionKey: 'createSurvey.cxMetrics.ces.question',
    scaleMin: 1,
    scaleMax: 7,
    minLabelKey: 'createSurvey.cxMetrics.ces.minLabel',
    maxLabelKey: 'createSurvey.cxMetrics.ces.maxLabel',
  },
  {
    id: CxMetricType.CSAT,
    nameKey: 'createSurvey.cxMetrics.csat.name',
    descriptionKey: 'createSurvey.cxMetrics.csat.description',
    questionKey: 'createSurvey.cxMetrics.csat.question',
    scaleMin: 1,
    scaleMax: 5,
    minLabelKey: 'createSurvey.cxMetrics.csat.minLabel',
    maxLabelKey: 'createSurvey.cxMetrics.csat.maxLabel',
  },
];

// Icon mapping for dynamic icon rendering
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  ClipboardList,
  MessageSquareHeart,
  MessagesSquare,
  FlaskConical,
  Users,
};

// Get icon component for a category
export function getCategoryIcon(iconName: string): LucideIcon {
  return CATEGORY_ICONS[iconName] || ClipboardList;
}

// Get category by type
export function getCategoryByType(type: SurveyType): SurveyCategory | undefined {
  return SURVEY_CATEGORIES.find((cat) => cat.id === type);
}

// Get CX metric by type
export function getCxMetricByType(type: CxMetricType): CxMetricOption | undefined {
  return CX_METRICS.find((metric) => metric.id === type);
}

// Default titles for quick start
export const DEFAULT_SURVEY_TITLES: Record<SurveyType, string> = {
  [SurveyType.Classic]: '',
  [SurveyType.CustomerExperience]: '',
  [SurveyType.Conversational]: '',
  [SurveyType.Research]: '',
  [SurveyType.Assessment360]: '',
};

// Default CX survey titles by metric
export const DEFAULT_CX_TITLES: Record<CxMetricType, string> = {
  [CxMetricType.NPS]: 'createSurvey.defaults.npsTitle',
  [CxMetricType.CES]: 'createSurvey.defaults.cesTitle',
  [CxMetricType.CSAT]: 'createSurvey.defaults.csatTitle',
};
