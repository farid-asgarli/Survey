import { YesNoStyle } from '@survey/types';
import { cn } from '@survey/ui-primitives';
import { Check, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import type { QuestionRendererProps } from '../types/index.js';

// ============ Yes/No ============
export function YesNoRenderer({ question, value, onChange, error, disabled, labels }: QuestionRendererProps) {
  const yesNoStyle = (question.settings?.yesNoStyle ?? YesNoStyle.Text) as YesNoStyle;
  const yesLabel = labels.yes || 'Yes';
  const noLabel = labels.no || 'No';

  // YesNo options are QuestionOption[] or we fall back to simple text labels
  const rawOptions = question.settings?.options;
  const optionTexts = rawOptions ? rawOptions.map((o) => o.text) : [yesLabel, noLabel];
  const optionIds = rawOptions ? rawOptions.map((o) => o.id) : [yesLabel, noLabel];

  const selectedValue = value as string | null;

  // Helper to get the option ID for comparison
  const getOptionValue = (index: number) => optionIds[index] || optionTexts[index];

  // Pre-compute values for Toggle case to avoid lexical declarations in case block
  const isYes = selectedValue === getOptionValue(0);
  const hasSelection = selectedValue !== null;

  switch (yesNoStyle) {
    case YesNoStyle.Thumbs:
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            {/* Thumbs Up - Yes */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(getOptionValue(0))}
              className={cn(
                'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-colors min-w-32',
                selectedValue === getOptionValue(0)
                  ? 'border-success bg-success-container'
                  : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-xl transition-colors',
                  selectedValue === getOptionValue(0) ? 'bg-success text-on-success' : 'bg-surface-container-high text-on-surface-variant'
                )}
              >
                <ThumbsUp className="w-7 h-7" />
              </div>
              <span className={cn('text-sm font-medium', selectedValue === getOptionValue(0) ? 'text-on-success-container' : 'text-on-surface')}>
                {optionTexts[0]}
              </span>
            </button>

            {/* Thumbs Down - No */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(getOptionValue(1))}
              className={cn(
                'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-colors min-w-32',
                selectedValue === getOptionValue(1)
                  ? 'border-error bg-error-container'
                  : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-xl transition-colors',
                  selectedValue === getOptionValue(1) ? 'bg-error text-on-error' : 'bg-surface-container-high text-on-surface-variant'
                )}
              >
                <ThumbsDown className="w-7 h-7" />
              </div>
              <span className={cn('text-sm font-medium', selectedValue === getOptionValue(1) ? 'text-on-error-container' : 'text-on-surface')}>
                {optionTexts[1]}
              </span>
            </button>
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
        </div>
      );

    case YesNoStyle.Toggle:
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            <span className={cn('text-base font-medium transition-colors', !isYes && hasSelection ? 'text-on-surface' : 'text-on-surface-variant')}>
              {optionTexts[1]}
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(isYes ? getOptionValue(1) : getOptionValue(0))}
              className={cn(
                'w-16 h-9 rounded-full relative transition-colors border-2',
                hasSelection
                  ? isYes
                    ? 'bg-primary border-primary'
                    : 'bg-surface-container-high border-outline-variant'
                  : 'bg-surface-container border-outline-variant',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-6 h-6 rounded-full transition-all',
                  isYes ? 'left-8 bg-on-primary' : 'left-1 bg-on-surface-variant/60'
                )}
              />
            </button>
            <span className={cn('text-base font-medium transition-colors', isYes && hasSelection ? 'text-on-surface' : 'text-on-surface-variant')}>
              {optionTexts[0]}
            </span>
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
        </div>
      );

    case YesNoStyle.CheckX:
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            {/* Check - Yes */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(getOptionValue(0))}
              className={cn(
                'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-colors min-w-32',
                selectedValue === getOptionValue(0)
                  ? 'border-success bg-success-container'
                  : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-full transition-colors',
                  selectedValue === getOptionValue(0) ? 'bg-success text-on-success' : 'bg-surface-container-high text-on-surface-variant'
                )}
              >
                <Check className="w-7 h-7" strokeWidth={2.5} />
              </div>
              <span className={cn('text-sm font-medium', selectedValue === getOptionValue(0) ? 'text-on-success-container' : 'text-on-surface')}>
                {optionTexts[0]}
              </span>
            </button>

            {/* X - No */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(getOptionValue(1))}
              className={cn(
                'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-colors min-w-32',
                selectedValue === getOptionValue(1)
                  ? 'border-error bg-error-container'
                  : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-full transition-colors',
                  selectedValue === getOptionValue(1) ? 'bg-error text-on-error' : 'bg-surface-container-high text-on-surface-variant'
                )}
              >
                <X className="w-7 h-7" strokeWidth={2.5} />
              </div>
              <span className={cn('text-sm font-medium', selectedValue === getOptionValue(1) ? 'text-on-error-container' : 'text-on-surface')}>
                {optionTexts[1]}
              </span>
            </button>
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
        </div>
      );

    case YesNoStyle.Text:
    default:
      // Default to single choice renderer style
      return (
        <div className="space-y-3">
          {optionTexts.map((optionText, index) => (
            <label
              key={index}
              onClick={() => !disabled && onChange(getOptionValue(index))}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors',
                selectedValue === getOptionValue(index)
                  ? 'border-primary bg-primary-container/30'
                  : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low',
                disabled && 'opacity-50 cursor-not-allowed',
                error && !selectedValue && 'border-error/50'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                  selectedValue === getOptionValue(index) ? 'border-primary bg-primary' : 'border-outline-variant'
                )}
              >
                {selectedValue === getOptionValue(index) && <div className="w-2.5 h-2.5 rounded-full bg-on-primary" />}
              </div>
              <span className="text-on-surface font-medium">{optionText}</span>
            </label>
          ))}
          {error && <p className="text-error text-sm">{error}</p>}
        </div>
      );
  }
}
