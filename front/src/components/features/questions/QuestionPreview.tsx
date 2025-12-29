// Question Preview - Interactive preview showing how question looks to respondent
// Now uses the unified preview system for consistency with public surveys

import { UnifiedQuestionPreview } from '@/components/features/public-survey';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { cn } from '@/lib/utils';

interface QuestionPreviewProps {
  question: DraftQuestion;
  className?: string;
  isInteractive?: boolean;
}

/**
 * QuestionPreview - Interactive preview for the survey builder
 *
 * This component now uses the UnifiedQuestionPreview which shares the same
 * rendering logic as the public survey, ensuring visual consistency.
 */
export function QuestionPreview({ question, className, isInteractive = true }: QuestionPreviewProps) {
  return (
    <UnifiedQuestionPreview
      question={question}
      className={cn('space-y-4', className)}
      isInteractive={isInteractive}
      showHeader={isInteractive}
      showQuestionText={true}
    />
  );
}

export default QuestionPreview;
