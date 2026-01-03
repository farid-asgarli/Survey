import { cn } from '@survey/ui-primitives';
import type { QuestionRendererProps } from '../types/index.js';

// ============ Scale (NPS-style) ============
export function ScaleRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const minValue = question.settings?.minValue ?? 0;
  const maxValue = question.settings?.maxValue ?? 10;
  const minLabel = question.settings?.minLabel;
  const maxLabel = question.settings?.maxLabel;
  const values = Array.from({ length: maxValue - minValue + 1 }, (_, i) => minValue + i);
  const selectedValue = value ? parseInt(value as string, 10) : null;

  return (
    <div className="space-y-3">
      {/* Labels */}
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-sm text-on-surface-variant">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}

      {/* Scale buttons - consistent sizing, wraps naturally when needed */}
      <div className="flex flex-wrap justify-center gap-2">
        {values.map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => onChange(num.toString())}
            className={cn(
              'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-base sm:text-lg font-semibold transition-all duration-200',
              selectedValue === num
                ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-surface'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
              disabled && 'cursor-not-allowed opacity-50',
              error && selectedValue === null && 'ring-1 ring-error/50'
            )}
          >
            {num}
          </button>
        ))}
      </div>

      {error && <p className="text-error text-sm text-center">{error}</p>}
    </div>
  );
}
