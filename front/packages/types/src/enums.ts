// ============================================================
// Shared enums matching backend C# enums with numeric values
// Using const objects with 'as const' for erasableSyntaxOnly compatibility
// ============================================================

// ============ Question Enums (needed by public survey) ============
export const QuestionType = {
  SingleChoice: 0,
  MultipleChoice: 1,
  Text: 2,
  LongText: 3,
  Rating: 4,
  Scale: 5,
  Matrix: 6,
  Date: 7,
  DateTime: 71,
  FileUpload: 8,
  YesNo: 9,
  Dropdown: 10,
  NPS: 11,
  Checkbox: 12,
  Number: 13,
  ShortText: 14,
  Email: 15,
  Phone: 16,
  Url: 17,
  Ranking: 18,
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export const NpsQuestionType = {
  Standard: 0,
  CustomerSatisfaction: 1,
  CustomerEffort: 2,
} as const;
export type NpsQuestionType = (typeof NpsQuestionType)[keyof typeof NpsQuestionType];

// ============ Rating Style Enums ============
export const RatingStyle = {
  Stars: 0,
  Hearts: 1,
  Thumbs: 2,
  Smileys: 3,
  Numbers: 4,
} as const;
export type RatingStyle = (typeof RatingStyle)[keyof typeof RatingStyle];

// ============ Yes/No Style Enums ============
export const YesNoStyle = {
  Text: 0,
  Thumbs: 1,
  Toggle: 2,
  CheckX: 3,
} as const;
export type YesNoStyle = (typeof YesNoStyle)[keyof typeof YesNoStyle];

// ============ Theme Enums ============
export const ButtonStyle = {
  Rounded: 0,
  Square: 1,
  Pill: 2,
} as const;
export type ButtonStyle = (typeof ButtonStyle)[keyof typeof ButtonStyle];

export const ProgressBarStyle = {
  None: 0,
  Bar: 1,
  Percentage: 2,
  Steps: 3,
  Dots: 4,
} as const;
export type ProgressBarStyle = (typeof ProgressBarStyle)[keyof typeof ProgressBarStyle];

// ============ Static Labels (no i18n dependency) ============
export const QuestionTypeLabels: Record<QuestionType, string> = {
  [QuestionType.SingleChoice]: 'Single Choice',
  [QuestionType.MultipleChoice]: 'Multiple Choice',
  [QuestionType.Text]: 'Text',
  [QuestionType.LongText]: 'Long Text',
  [QuestionType.Rating]: 'Rating',
  [QuestionType.Scale]: 'Scale',
  [QuestionType.Matrix]: 'Matrix',
  [QuestionType.Date]: 'Date',
  [QuestionType.DateTime]: 'Date & Time',
  [QuestionType.FileUpload]: 'File Upload',
  [QuestionType.YesNo]: 'Yes/No',
  [QuestionType.Dropdown]: 'Dropdown',
  [QuestionType.NPS]: 'NPS',
  [QuestionType.Checkbox]: 'Checkbox',
  [QuestionType.Number]: 'Number',
  [QuestionType.ShortText]: 'Short Text',
  [QuestionType.Email]: 'Email',
  [QuestionType.Phone]: 'Phone',
  [QuestionType.Url]: 'URL',
  [QuestionType.Ranking]: 'Ranking',
};

export const RatingStyleLabels: Record<RatingStyle, string> = {
  [RatingStyle.Stars]: 'Stars',
  [RatingStyle.Hearts]: 'Hearts',
  [RatingStyle.Thumbs]: 'Thumbs',
  [RatingStyle.Smileys]: 'Smileys',
  [RatingStyle.Numbers]: 'Numbers',
};

export const YesNoStyleLabels: Record<YesNoStyle, string> = {
  [YesNoStyle.Text]: 'Text',
  [YesNoStyle.Thumbs]: 'Thumbs Up/Down',
  [YesNoStyle.Toggle]: 'Toggle Switch',
  [YesNoStyle.CheckX]: 'Check/X',
};

export const ButtonStyleLabels: Record<ButtonStyle, string> = {
  [ButtonStyle.Rounded]: 'Rounded',
  [ButtonStyle.Square]: 'Square',
  [ButtonStyle.Pill]: 'Pill',
};

export const ProgressBarStyleLabels: Record<ProgressBarStyle, string> = {
  [ProgressBarStyle.None]: 'None',
  [ProgressBarStyle.Bar]: 'Bar',
  [ProgressBarStyle.Percentage]: 'Percentage',
  [ProgressBarStyle.Steps]: 'Steps',
  [ProgressBarStyle.Dots]: 'Dots',
};
