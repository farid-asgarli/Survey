// Public Survey Components Export
// ============================================================================
// Phase 2: Shared @survey/ui components with translated labels
// ============================================================================

// Primary export: QuestionRenderer using shared @survey/ui with i18n labels
export { TranslatedQuestionRenderer as QuestionRenderer, TranslatedQuestionRenderer, useQuestionLabels } from './TranslatedQuestionRenderer';

export type {
  TranslatedQuestionRendererProps as QuestionRendererProps,
  TranslatedQuestionRendererProps,
  QuestionLabels,
} from './TranslatedQuestionRenderer';

// ============================================================================
// Other components
// ============================================================================

// Unified Preview - Single source of truth for question previews
export { UnifiedQuestionPreview, EditorPreview, draftToPublicQuestion, usePreviewState } from './UnifiedQuestionPreview';

export { WelcomeScreen } from './WelcomeScreen';
export { ThankYouScreen } from './ThankYouScreen';
export { ErrorScreen } from './ErrorScreen';
export { ProgressBar, StepIndicator } from './ProgressBar';
export { QuestionCard } from './QuestionCard';
export { NavigationControls } from './NavigationControls';
export { AllQuestionsView } from './AllQuestionsView';
export { ResumeProgressDialog } from './ResumeProgressDialog';
