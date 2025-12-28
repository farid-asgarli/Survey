// Survey Preview Types
export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';
export type DisplayMode = 'one-by-one' | 'all-at-once';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface DevicePreset {
  id: string;
  name: string;
  category: DeviceCategory;
  width: number;
  height: number;
  icon: React.ElementType;
}

export interface PreviewContentProps {
  survey: import('@/types/public-survey').PublicSurvey;
  /** Questions filtered by conditional logic (only visible ones) */
  visibleQuestions: import('@/types/public-survey').PublicQuestion[];
  viewMode: import('@/types/public-survey').PublicSurveyViewMode;
  displayMode: DisplayMode;
  currentQuestionIndex: number;
  answers: Record<string, import('@/types/public-survey').AnswerValue>;
  errors: Record<string, string>;
  onStart: () => void;
  onSetAnswer: (questionId: string, value: import('@/types/public-survey').AnswerValue) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onReset: () => void;
  showKeyboardHints?: boolean;
}
