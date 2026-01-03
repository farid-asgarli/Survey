// @survey/ui - Shared Types
// Types for translation-agnostic components

import type { AnswerValue, PublicQuestion } from "@survey/types";

// ============================================================================
// Base Props
// ============================================================================

/**
 * Base props for all question renderers.
 * Components receive translated labels via the `labels` prop instead of using i18n internally.
 */
export interface QuestionRendererProps {
  question: PublicQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  error?: string;
  disabled?: boolean;
  /** Translated labels for this question type */
  labels: QuestionLabels;
}

// ============================================================================
// Question Labels - All translatable strings
// ============================================================================

/**
 * Common labels shared across all question renderers
 */
export interface CommonLabels {
  /** Placeholder for text inputs */
  placeholder?: string;
  /** "Other" option text for choice questions */
  other?: string;
  /** "Please specify" placeholder for other input */
  pleaseSpecify?: string;
}

/**
 * Labels specific to file upload questions
 */
export interface FileUploadLabels extends CommonLabels {
  /** "Drop files here" text */
  dropFilesHere?: string;
  /** "Maximum X files, Y MB each" text */
  maxFilesText?: string;
  /** "Allowed types:" prefix */
  allowedTypesPrefix?: string;
}

/**
 * Labels specific to rating questions
 */
export interface RatingLabels extends CommonLabels {
  /** Min label (e.g., "Poor") */
  minLabel?: string;
  /** Max label (e.g., "Excellent") */
  maxLabel?: string;
}

/**
 * Labels specific to scale questions
 */
export interface ScaleLabels extends CommonLabels {
  /** Min label (e.g., "Not likely") */
  minLabel?: string;
  /** Max label (e.g., "Very likely") */
  maxLabel?: string;
}

/**
 * Labels specific to matrix questions
 */
export interface MatrixLabels extends CommonLabels {
  /** Label for rows */
  rows?: string;
  /** Label for columns */
  columns?: string;
}

/**
 * Labels specific to ranking questions
 */
export interface RankingLabels extends CommonLabels {
  /** "Drag to reorder" instruction */
  dragToReorder?: string;
  /** Ranked item prefix (e.g., "1st", "2nd") */
  rankPrefix?: string;
}

/**
 * Labels specific to Yes/No questions
 */
export interface YesNoLabels extends CommonLabels {
  /** "Yes" text */
  yes?: string;
  /** "No" text */
  no?: string;
}

/**
 * Labels specific to validation errors
 */
export interface ValidationLabels {
  /** "Please enter a valid email" */
  invalidEmail?: string;
  /** "Please enter a valid phone number" */
  invalidPhone?: string;
  /** "Please enter a valid URL" */
  invalidUrl?: string;
  /** "Please enter a valid number" */
  invalidNumber?: string;
  /** "Value must be at least {min}" */
  minValue?: string;
  /** "Value must be at most {max}" */
  maxValue?: string;
  /** Generic required field message */
  required?: string;
}

/**
 * Combined labels type - union of all possible labels
 */
export type QuestionLabels = CommonLabels &
  Partial<FileUploadLabels> &
  Partial<RatingLabels> &
  Partial<ScaleLabels> &
  Partial<MatrixLabels> &
  Partial<RankingLabels> &
  Partial<YesNoLabels> &
  Partial<ValidationLabels>;

// ============================================================================
// DatePicker Labels
// ============================================================================

/**
 * Labels for the DatePicker component
 */
export interface DatePickerLabels {
  /** Placeholder text (e.g., "Select a date") */
  placeholder?: string;
  /** Month names (long form) */
  months: {
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
  };
  /** Month names (short form) */
  monthsShort: {
    jan: string;
    feb: string;
    mar: string;
    apr: string;
    may: string;
    jun: string;
    jul: string;
    aug: string;
    sep: string;
    oct: string;
    nov: string;
    dec: string;
  };
  /** Weekday names (short form) */
  weekDays: {
    sun: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
  };
  /** Weekday names (full form) */
  weekDaysFull: {
    sun: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
  };
  /** "Select date" aria label */
  selectDate?: string;
  /** "Cancel" button text */
  cancel?: string;
  /** "OK" / "Confirm" button text */
  confirm?: string;
  /** "Clear" button text */
  clear?: string;
  /** "Today" button text */
  today?: string;
  /** "Previous month" aria label */
  previousMonth?: string;
  /** "Next month" aria label */
  nextMonth?: string;
  /** "Enter date" for manual input mode */
  enterDate?: string;
  /** "From" label for range picker */
  from?: string;
  /** "To" label for range picker */
  to?: string;
  /** "Presets" tab label */
  presets?: string;
  /** "Custom" tab label */
  custom?: string;
}

/**
 * Default English labels for DatePicker
 */
export const defaultDatePickerLabels: DatePickerLabels = {
  placeholder: "Select a date",
  months: {
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
  },
  monthsShort: {
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dec",
  },
  weekDays: {
    sun: "Su",
    mon: "Mo",
    tue: "Tu",
    wed: "We",
    thu: "Th",
    fri: "Fr",
    sat: "Sa",
  },
  weekDaysFull: {
    sun: "Sunday",
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
  },
  selectDate: "Select date",
  cancel: "Cancel",
  confirm: "OK",
  clear: "Clear",
  today: "Today",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  enterDate: "Enter date",
  from: "From",
  to: "To",
  presets: "Presets",
  custom: "Custom",
};

/**
 * Default English labels for common question labels
 */
export const defaultQuestionLabels: QuestionLabels = {
  placeholder: "Your answer",
  other: "Other",
  pleaseSpecify: "Please specify",
  dropFilesHere: "Drop files here or click to upload",
  maxFilesText: "Maximum files allowed",
  allowedTypesPrefix: "Allowed types:",
  dragToReorder: "Drag to reorder",
  yes: "Yes",
  no: "No",
  invalidEmail: "Please enter a valid email address",
  invalidPhone: "Please enter a valid phone number",
  invalidUrl: "Please enter a valid URL",
  invalidNumber: "Please enter a valid number",
  required: "This field is required",
};
