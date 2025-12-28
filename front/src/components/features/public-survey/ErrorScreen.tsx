// Error Screen - Shown when survey cannot be loaded
// Uses container queries (@sm:, @md:) for proper preview responsiveness

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({ title, message, onRetry }: ErrorScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8 @sm:py-10 @md:py-16 min-h-full">
      {/* Error icon */}
      <div className="w-14 h-14 @sm:w-16 @sm:h-16 @md:w-20 @md:h-20 rounded-xl @sm:rounded-2xl @md:rounded-3xl bg-error-container/60 border-2 border-error/20 flex items-center justify-center mb-5 @sm:mb-6 @md:mb-8">
        <AlertCircle className="w-7 h-7 @sm:w-8 @sm:h-8 @md:w-10 @md:h-10 text-error" />
      </div>

      {/* Title */}
      <h1 className="text-lg @sm:text-xl @md:text-2xl font-bold text-on-surface mb-3 @md:mb-4 px-2">{title || 'Survey Not Available'}</h1>

      {/* Message */}
      <p className="text-sm @sm:text-base @md:text-lg text-on-surface-variant mb-5 @sm:mb-6 @md:mb-8 max-w-md px-2">
        {message || 'This survey is either not found, has expired, or is no longer accepting responses.'}
      </p>

      {/* Actions */}
      <div className="flex gap-4">
        {onRetry && (
          <Button variant="tonal" onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
