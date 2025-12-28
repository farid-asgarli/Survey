// Navigation Controls - Prev/Next/Submit buttons
// Uses container queries (@sm:, @md:) for proper preview responsiveness

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';

interface NavigationControlsProps {
  currentIndex: number;
  totalQuestions: number;
  canGoPrevious: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  className?: string;
}

export function NavigationControls({
  currentIndex,
  totalQuestions,
  canGoPrevious,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
  className,
}: NavigationControlsProps) {
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className={cn('flex items-center justify-between gap-3 @md:gap-4', className)}>
      {/* Previous button */}
      <Button
        variant="outline"
        size="default"
        onClick={onPrevious}
        disabled={!canGoPrevious || isSubmitting}
        className={cn('gap-2 min-w-20 @sm:min-w-24 text-sm', !canGoPrevious && 'opacity-0 pointer-events-none')}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden @sm:inline">Back</span>
      </Button>

      {/* Next or Submit button */}
      {isLastQuestion ? (
        <Button size="default" onClick={onSubmit} disabled={isSubmitting} className="gap-2 min-w-28 @sm:min-w-36 text-sm">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden @sm:inline">Submitting...</span>
              <span className="@sm:hidden">...</span>
            </>
          ) : (
            <>
              Submit
              <Send className="w-4 h-4" />
            </>
          )}
        </Button>
      ) : (
        <Button size="default" onClick={onNext} disabled={isSubmitting} className="gap-2 min-w-20 @sm:min-w-24 text-sm">
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
