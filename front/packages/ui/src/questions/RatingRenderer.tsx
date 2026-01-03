import { RatingStyle } from '@survey/types';
import { useState } from 'react';
import { cn } from '@survey/ui-primitives';
import { Frown, Heart, Meh, Smile, Star, ThumbsUp } from 'lucide-react';
import type { QuestionRendererProps } from '../types/index.js';

// ============ Rating ============
export function RatingRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const maxValue = question.settings?.maxValue || 5;
  const ratingStyle = (question.settings?.ratingStyle ?? RatingStyle.Stars) as RatingStyle;
  const minLabel = question.settings?.minLabel;
  const maxLabel = question.settings?.maxLabel;
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const selectedValue = value ? parseInt(value as string, 10) : null;

  // Common labels element
  const labelsElement =
    minLabel || maxLabel ? (
      <div className="flex justify-between text-sm text-on-surface-variant px-1">
        <span>{minLabel || ''}</span>
        <span>{maxLabel || ''}</span>
      </div>
    ) : null;

  // Render based on style
  switch (ratingStyle) {
    case RatingStyle.Stars:
      return (
        <div className="space-y-3">
          {labelsElement}
          <div className="flex justify-center gap-2">
            {Array.from({ length: maxValue }, (_, i) => i + 1).map((rating) => {
              const isActive = hoverValue !== null ? rating <= hoverValue : rating <= (selectedValue || 0);
              return (
                <button
                  key={rating}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(rating.toString())}
                  onMouseEnter={() => setHoverValue(rating)}
                  onMouseLeave={() => setHoverValue(null)}
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
                    isActive
                      ? 'bg-warning-container text-warning'
                      : 'bg-surface-container text-on-surface-variant/40 hover:bg-surface-container-high',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <Star className={cn('w-7 h-7', isActive && 'fill-current')} />
                </button>
              );
            })}
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
        </div>
      );

    case RatingStyle.Hearts:
      return (
        <div className="space-y-3">
          {labelsElement}
          <div className="flex justify-center gap-2">
            {Array.from({ length: maxValue }, (_, i) => i + 1).map((rating) => {
              const isActive = hoverValue !== null ? rating <= hoverValue : rating <= (selectedValue || 0);
              return (
                <button
                  key={rating}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(rating.toString())}
                  onMouseEnter={() => setHoverValue(rating)}
                  onMouseLeave={() => setHoverValue(null)}
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
                    isActive ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant/40 hover:bg-surface-container-high',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <Heart className={cn('w-7 h-7', isActive && 'fill-current')} />
                </button>
              );
            })}
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
        </div>
      );

    case RatingStyle.Thumbs:
      return (
        <div className="space-y-3">
          {labelsElement}
          <div className="flex justify-center gap-2">
            {Array.from({ length: maxValue }, (_, i) => i + 1).map((rating) => {
              const isActive = hoverValue !== null ? rating <= hoverValue : rating <= (selectedValue || 0);
              return (
                <button
                  key={rating}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(rating.toString())}
                  onMouseEnter={() => setHoverValue(rating)}
                  onMouseLeave={() => setHoverValue(null)}
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
                    isActive
                      ? 'bg-primary-container text-primary'
                      : 'bg-surface-container text-on-surface-variant/40 hover:bg-surface-container-high',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <ThumbsUp className={cn('w-7 h-7', isActive && 'fill-current')} />
                </button>
              );
            })}
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
        </div>
      );

    case RatingStyle.Smileys:
      return (
        <div className="space-y-3">
          {labelsElement}
          <div className="flex justify-center gap-2">
            {Array.from({ length: maxValue }, (_, i) => i + 1).map((rating) => {
              const isSelected = selectedValue === rating;
              const isHovered = hoverValue === rating;
              // Determine smiley based on position
              const ratio = (rating - 1) / (maxValue - 1);
              const SmileyIcon = ratio <= 0.33 ? Frown : ratio <= 0.66 ? Meh : Smile;
              // Color based on position
              const bgColor = ratio <= 0.33 ? 'bg-error-container' : ratio <= 0.66 ? 'bg-warning-container' : 'bg-success-container';
              const textColor = ratio <= 0.33 ? 'text-error' : ratio <= 0.66 ? 'text-warning' : 'text-success';

              return (
                <button
                  key={rating}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(rating.toString())}
                  onMouseEnter={() => setHoverValue(rating)}
                  onMouseLeave={() => setHoverValue(null)}
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
                    isSelected || isHovered
                      ? cn(bgColor, textColor)
                      : 'bg-surface-container text-on-surface-variant/40 hover:bg-surface-container-high',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <SmileyIcon className="w-7 h-7" />
                </button>
              );
            })}
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
        </div>
      );

    case RatingStyle.Numbers:
      return (
        <div className="space-y-3">
          {labelsElement}
          <div className="flex justify-center gap-2">
            {Array.from({ length: maxValue }, (_, i) => i + 1).map((rating) => {
              const isSelected = selectedValue === rating;
              return (
                <button
                  key={rating}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(rating.toString())}
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-colors',
                    isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {rating}
                </button>
              );
            })}
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
        </div>
      );

    default:
      return (
        <div className="space-y-3">
          {labelsElement}
          <div className="flex justify-center gap-2">
            {Array.from({ length: maxValue }, (_, i) => i + 1).map((rating) => {
              const isActive = hoverValue !== null ? rating <= hoverValue : rating <= (selectedValue || 0);
              return (
                <button
                  key={rating}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(rating.toString())}
                  onMouseEnter={() => setHoverValue(rating)}
                  onMouseLeave={() => setHoverValue(null)}
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
                    isActive
                      ? 'bg-warning-container text-warning'
                      : 'bg-surface-container text-on-surface-variant/40 hover:bg-surface-container-high',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <Star className={cn('w-7 h-7', isActive && 'fill-current')} />
                </button>
              );
            })}
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
        </div>
      );
  }
}
