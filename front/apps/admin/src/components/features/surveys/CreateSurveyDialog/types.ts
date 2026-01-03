import type { SurveyType, CxMetricType } from '@/types';

export interface SurveyCategory {
  id: SurveyType;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  previewComponent: string;
  features: string[];
  templateCount?: number;
  isNew?: boolean;
  isComingSoon?: boolean;
}

export interface CxMetricOption {
  id: CxMetricType;
  nameKey: string;
  descriptionKey: string;
  questionKey: string;
  scaleMin: number;
  scaleMax: number;
  minLabelKey: string;
  maxLabelKey: string;
}

export interface CreateSurveyFormData {
  title: string;
  description?: string;
  surveyType: SurveyType;
  cxMetricType?: CxMetricType;
  /** Language code for the survey's default language */
  languageCode: string;
}

export interface CreateSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSurveyFormData) => void | Promise<void>;
  isLoading?: boolean;
}
