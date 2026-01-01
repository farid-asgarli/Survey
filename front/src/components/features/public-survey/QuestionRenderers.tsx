// Question Renderers - Components for rendering different question types in public surveys

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import { QuestionType, RatingStyle, YesNoStyle } from '@/types';
import type { PublicQuestion, AnswerValue } from '@/types/public-survey';
import { Star, Heart, ThumbsUp, ThumbsDown, Smile, Meh, Frown, Upload, X, GripVertical, Check, Mail, Phone, Link, Hash } from 'lucide-react';
import { validateQuestionValue, getPresetById } from '@/utils/validationPatterns';

// ============ Base Props ============
export interface QuestionRendererProps {
  question: PublicQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  error?: string;
  disabled?: boolean;
}

// ============ Single Choice ============
export function SingleChoiceRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const options = question.settings?.options || [];
  const allowOther = question.settings?.allowOther;
  const [otherValue, setOtherValue] = useState('');
  const selectedValue = value as string | null;

  // Check if selected value is an option ID or the __other__ pattern
  const isOptionSelected = (optionId: string) => selectedValue === optionId;
  const isOtherSelected = selectedValue?.startsWith('__other__');

  const handleSelect = (optionId: string) => {
    if (disabled) return;
    onChange(optionId);
    if (optionId !== '__other__') {
      setOtherValue('');
    }
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setOtherValue(newValue);
    onChange(`__other__:${newValue}`);
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.id}
          onClick={() => handleSelect(option.id)}
          className={cn(
            'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
            isOptionSelected(option.id)
              ? 'border-primary bg-primary-container/30'
              : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low',
            disabled && 'opacity-50 cursor-not-allowed',
            error && !selectedValue && 'border-error/50'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
              isOptionSelected(option.id) ? 'border-primary bg-primary' : 'border-outline-variant'
            )}
          >
            {isOptionSelected(option.id) && <div className="w-2.5 h-2.5 rounded-full bg-on-primary" />}
          </div>
          <span className="text-on-surface font-medium">{option.text}</span>
        </label>
      ))}

      {allowOther && (
        <label
          onClick={() => handleSelect('__other__')}
          className={cn(
            'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
            isOtherSelected
              ? 'border-primary bg-primary-container/30'
              : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
              isOtherSelected ? 'border-primary bg-primary' : 'border-outline-variant'
            )}
          >
            {isOtherSelected && <div className="w-2.5 h-2.5 rounded-full bg-on-primary" />}
          </div>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-on-surface font-medium">{t('questionRenderers.other')}:</span>
            <input
              type="text"
              value={otherValue}
              onChange={handleOtherChange}
              onFocus={() => handleSelect('__other__')}
              disabled={disabled}
              placeholder={t('questionRenderers.pleaseSpecify')}
              className="flex-1 bg-transparent border-b-2 border-outline-variant/50 focus:border-primary outline-none py-1 text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        </label>
      )}

      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}

// ============ Multiple Choice ============
export function MultipleChoiceRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const options = question.settings?.options || [];
  const allowOther = question.settings?.allowOther;
  const [otherValue, setOtherValue] = useState('');
  const selectedValues = (value as string[]) || [];

  // Check if an option ID is in the selected values
  const isOptionSelected = (optionId: string) => selectedValues.includes(optionId);
  const isOtherSelected = selectedValues.some((v) => v.startsWith('__other__'));

  const handleToggle = (optionId: string) => {
    if (disabled) return;
    const newValues = isOptionSelected(optionId) ? selectedValues.filter((v) => v !== optionId) : [...selectedValues, optionId];
    onChange(newValues);
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOtherValue = e.target.value;
    setOtherValue(newOtherValue);

    // Update the values array
    const filteredValues = selectedValues.filter((v) => !v.startsWith('__other__'));
    if (newOtherValue) {
      onChange([...filteredValues, `__other__:${newOtherValue}`]);
    } else {
      onChange(filteredValues);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.id}
          className={cn(
            'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
            isOptionSelected(option.id)
              ? 'border-primary bg-primary-container/30'
              : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low',
            disabled && 'opacity-50 cursor-not-allowed',
            error && selectedValues.length === 0 && 'border-error/50'
          )}
          onClick={() => handleToggle(option.id)}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200',
              isOptionSelected(option.id) ? 'border-primary bg-primary' : 'border-outline-variant'
            )}
          >
            {isOptionSelected(option.id) && <Check className="w-4 h-4 text-on-primary" strokeWidth={3} />}
          </div>
          <span className="text-on-surface font-medium">{option.text}</span>
        </label>
      ))}

      {allowOther && (
        <label
          className={cn(
            'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
            isOtherSelected
              ? 'border-primary bg-primary-container/30'
              : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200',
              isOtherSelected ? 'border-primary bg-primary' : 'border-outline-variant'
            )}
          >
            {isOtherSelected && <Check className="w-4 h-4 text-on-primary" strokeWidth={3} />}
          </div>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-on-surface font-medium">{t('questionRenderers.other')}:</span>
            <input
              type="text"
              value={otherValue}
              onChange={handleOtherChange}
              disabled={disabled}
              placeholder={t('questionRenderers.pleaseSpecify')}
              className="flex-1 bg-transparent border-b-2 border-outline-variant/50 focus:border-primary outline-none py-1 text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        </label>
      )}

      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}

// ============ Text Input ============
export function TextRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const placeholder = question.settings?.placeholder || t('publicSurvey.placeholders.yourAnswer');
  const maxLength = question.settings?.maxLength;

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          'w-full px-5 py-4 rounded-2xl border-2 bg-surface-container-lowest text-on-surface text-lg',
          'placeholder:text-on-surface-variant/50 transition-all duration-200',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          error ? 'border-error' : 'border-outline-variant/50 hover:border-outline-variant',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      <div className="flex justify-between items-center">
        {error && <p className="text-error text-sm">{error}</p>}
        {maxLength && (
          <p className="text-on-surface-variant/70 text-sm ml-auto">
            {((value as string) || '').length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

// ============ Long Text ============
export function LongTextRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const placeholder = question.settings?.placeholder || t('publicSurvey.placeholders.yourAnswer');
  const maxLength = question.settings?.maxLength;

  return (
    <div className="space-y-2">
      <textarea
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        rows={5}
        className={cn(
          'w-full px-5 py-4 rounded-2xl border-2 bg-surface-container-lowest text-on-surface text-lg resize-none',
          'placeholder:text-on-surface-variant/50 transition-all duration-200',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          error ? 'border-error' : 'border-outline-variant/50 hover:border-outline-variant',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      <div className="flex justify-between items-center">
        {error && <p className="text-error text-sm">{error}</p>}
        {maxLength && (
          <p className="text-on-surface-variant/70 text-sm ml-auto">
            {((value as string) || '').length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

// ============ Email Input ============
export function EmailRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const placeholder = question.settings?.placeholder || t('questionDefaults.placeholders.emailExample');
  const maxLength = question.settings?.maxLength || 256;
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear local error while typing
    if (localError) setLocalError(null);
  };

  const handleBlur = () => {
    const stringValue = (value as string) || '';
    if (stringValue) {
      const result = validateQuestionValue(stringValue, 'Email', question.settings);
      if (!result.isValid) {
        setLocalError(result.errorMessage || t('validation.invalidEmail'));
      }
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={(value as string) || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            'w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-container-lowest text-on-surface text-lg',
            'placeholder:text-on-surface-variant/50 transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            displayError ? 'border-error' : 'border-outline-variant/50 hover:border-outline-variant',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>
      {displayError && <p className="text-error text-sm">{displayError}</p>}
    </div>
  );
}

// ============ Phone Input ============
export function PhoneRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const preset = question.settings?.validationPreset ? getPresetById(question.settings.validationPreset) : null;
  const placeholder = question.settings?.placeholder || preset?.placeholder || t('questionDefaults.placeholders.enterPhone');
  const maxLength = question.settings?.maxLength || 50;
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear local error while typing
    if (localError) setLocalError(null);
  };

  const handleBlur = () => {
    const stringValue = (value as string) || '';
    if (stringValue) {
      const result = validateQuestionValue(stringValue, 'Phone', question.settings);
      if (!result.isValid) {
        setLocalError(result.errorMessage || t('validation.invalidPhone'));
      }
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={(value as string) || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            'w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-container-lowest text-on-surface text-lg',
            'placeholder:text-on-surface-variant/50 transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            displayError ? 'border-error' : 'border-outline-variant/50 hover:border-outline-variant',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>
      {preset && <p className="text-on-surface-variant/70 text-xs">Format: {preset.descriptionKey}</p>}
      {displayError && <p className="text-error text-sm">{displayError}</p>}
    </div>
  );
}

// ============ URL Input ============
export function UrlRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const preset = question.settings?.validationPreset ? getPresetById(question.settings.validationPreset) : null;
  const placeholder = question.settings?.placeholder || preset?.placeholder || 'https://example.com';
  const maxLength = question.settings?.maxLength || 2048;
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear local error while typing
    if (localError) setLocalError(null);
  };

  const handleBlur = () => {
    const stringValue = (value as string) || '';
    if (stringValue) {
      const result = validateQuestionValue(stringValue, 'Url', question.settings);
      if (!result.isValid) {
        setLocalError(result.errorMessage || t('validation.invalidUrl'));
      }
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
        <input
          type="url"
          inputMode="url"
          autoComplete="url"
          value={(value as string) || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            'w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-container-lowest text-on-surface text-lg',
            'placeholder:text-on-surface-variant/50 transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            displayError ? 'border-error' : 'border-outline-variant/50 hover:border-outline-variant',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>
      {displayError && <p className="text-error text-sm">{displayError}</p>}
    </div>
  );
}

// ============ Number Input ============
export function NumberRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const placeholder = question.settings?.placeholder || t('questionDefaults.placeholders.enterNumber');
  const minValue = question.settings?.minValue;
  const maxValue = question.settings?.maxValue;
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow empty, or valid number characters
    if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
      if (localError) setLocalError(null);
    }
  };

  const handleBlur = () => {
    const stringValue = (value as string) || '';
    if (stringValue) {
      const numValue = parseFloat(stringValue);
      if (isNaN(numValue)) {
        setLocalError(t('validation.number'));
      } else if (minValue !== undefined && numValue < minValue) {
        setLocalError(t('validation.minValue', { min: minValue }));
      } else if (maxValue !== undefined && numValue > maxValue) {
        setLocalError(t('validation.maxValue', { max: maxValue }));
      }
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
        <input
          type="text"
          inputMode="numeric"
          value={(value as string) || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-container-lowest text-on-surface text-lg',
            'placeholder:text-on-surface-variant/50 transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            displayError ? 'border-error' : 'border-outline-variant/50 hover:border-outline-variant',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>
      {(minValue !== undefined || maxValue !== undefined) && (
        <p className="text-on-surface-variant/70 text-xs">
          {minValue !== undefined && maxValue !== undefined
            ? `Value between ${minValue} and ${maxValue}`
            : minValue !== undefined
            ? `Minimum: ${minValue}`
            : `Maximum: ${maxValue}`}
        </p>
      )}
      {displayError && <p className="text-error text-sm">{displayError}</p>}
    </div>
  );
}

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

// ============ Scale (NPS-style) ============
export function ScaleRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const minValue = question.settings?.minValue ?? 0;
  const maxValue = question.settings?.maxValue ?? 10;
  const minLabel = question.settings?.minLabel;
  const maxLabel = question.settings?.maxLabel;
  const values = Array.from({ length: maxValue - minValue + 1 }, (_, i) => minValue + i);
  const selectedValue = value ? parseInt(value as string, 10) : null;

  return (
    <div className="space-y-4">
      {/* Labels */}
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-sm text-on-surface-variant">
          <span>{minLabel || minValue}</span>
          <span>{maxLabel || maxValue}</span>
        </div>
      )}

      {/* Scale buttons */}
      <div className="flex gap-2 flex-wrap">
        {values.map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => onChange(num.toString())}
            className={cn(
              'flex-1 min-w-11 py-4 rounded-2xl border-2 text-lg font-semibold transition-all duration-200',
              selectedValue === num
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant/50 bg-surface-container-lowest text-on-surface hover:border-primary/50 hover:bg-primary-container/30',
              disabled && 'cursor-not-allowed opacity-50',
              error && !selectedValue && 'border-error/50'
            )}
          >
            {num}
          </button>
        ))}
      </div>

      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
}

// ============ Matrix ============
export function MatrixRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const rows = question.settings?.matrixRows || [];
  const columns = question.settings?.matrixColumns || [];
  const matrixValue = (value as Record<string, string>) || {};

  const handleSelect = (row: string, column: string) => {
    if (disabled) return;
    onChange({ ...matrixValue, [row]: column });
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-125">
          <thead>
            <tr>
              <th className="p-3 text-left text-on-surface-variant font-medium" />
              {columns.map((col, i) => (
                <th key={i} className="p-3 text-center text-on-surface-variant font-medium text-sm">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={cn('border-t border-outline-variant/30', error && !matrixValue[row] && 'bg-error-container/10')}>
                <td className="p-3 text-on-surface font-medium">{row}</td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3 text-center">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelect(row, col)}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-200',
                        matrixValue[row] === col ? 'border-primary bg-primary' : 'border-outline-variant hover:border-primary/50',
                        disabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {matrixValue[row] === col && <div className="w-2.5 h-2.5 rounded-full bg-on-primary" />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}

// ============ Date ============
export function DateRenderer({ value, onChange, error, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-2">
      <DatePicker
        value={(value as string) || undefined}
        onChange={(date) => onChange(date || '')}
        disabled={disabled}
        error={error}
        placeholder="Select a date"
      />
    </div>
  );
}

// ============ File Upload ============
export function FileUploadRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const maxFiles = question.settings?.maxFileSize ? 1 : 5; // Default max files
  const maxFileSize = (question.settings?.maxFileSize || 5) * 1024 * 1024; // Convert MB to bytes
  const allowedTypes = useMemo(() => question.settings?.allowedFileTypes || [], [question.settings?.allowedFileTypes]);
  const files = useMemo(() => (value as File[]) || [], [value]);

  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || disabled) return;
      setUploadError(null);

      const fileArray = Array.from(newFiles);

      // Validate file count
      if (files.length + fileArray.length > maxFiles) {
        setUploadError(`Maximum ${maxFiles} file(s) allowed`);
        return;
      }

      // Validate each file
      for (const file of fileArray) {
        if (file.size > maxFileSize) {
          setUploadError(`File size must be less than ${maxFileSize / 1024 / 1024}MB`);
          return;
        }
        if (allowedTypes.length > 0 && !allowedTypes.some((type) => file.type.includes(type))) {
          setUploadError(`Allowed file types: ${allowedTypes.join(', ')}`);
          return;
        }
      }

      onChange([...files, ...fileArray]);
    },
    [files, maxFiles, maxFileSize, allowedTypes, onChange, disabled]
  );

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles.length > 0 ? newFiles : null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-200',
          dragActive
            ? 'border-primary bg-primary-container/20'
            : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant',
          error && 'border-error/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload className="w-12 h-12 text-on-surface-variant/50 mb-4" />
        <p className="text-on-surface font-medium mb-1">{t('questionRenderers.dropFilesHere')}</p>
        <p className="text-on-surface-variant/70 text-sm">{t('questionRenderers.maxFiles', { count: maxFiles, size: maxFileSize / 1024 / 1024 })}</p>
        {allowedTypes.length > 0 && (
          <p className="text-on-surface-variant/50 text-xs mt-1">
            {t('questionRenderers.allowedTypes')}: {allowedTypes.join(', ')}
          </p>
        )}
        <input
          type="file"
          multiple={maxFiles > 1}
          accept={allowedTypes.length > 0 ? allowedTypes.join(',') : undefined}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant/30">
              <div className="w-10 h-10 rounded-lg bg-primary-container/50 flex items-center justify-center">
                <Upload className="w-5 h-5 text-on-primary-container" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-on-surface font-medium truncate">{file.name}</p>
                <p className="text-on-surface-variant text-sm">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="p-2 rounded-full hover:bg-error-container/50 text-on-surface-variant hover:text-error transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(error || uploadError) && <p className="text-error text-sm">{error || uploadError}</p>}
    </div>
  );
}

// ============ Ranking ============
export function RankingRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const options = question.settings?.options || [];
  // For ranking, we store option IDs in order. Initialize with default order if no value.
  const rankedOptionIds = (value as string[]) || options.map((o) => o.id);

  // Build a map for quick lookup of option text by ID
  const optionMap = new Map(options.map((o) => [o.id, o]));

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    const newOrder = [...rankedOptionIds];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    onChange(newOrder);
  };

  return (
    <div className="space-y-3">
      <p className="text-on-surface-variant text-sm mb-2">{t('questionRenderers.dragToReorder')}</p>

      {rankedOptionIds.map((optionId, index) => {
        const option = optionMap.get(optionId);
        const displayText = option?.text || optionId;

        return (
          <div
            key={optionId}
            draggable={!disabled}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', index.toString());
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
              moveItem(fromIndex, index);
            }}
            className={cn(
              'flex items-center gap-4 p-4 rounded-2xl border-2 border-outline-variant/50 bg-surface-container-lowest',
              'cursor-move transition-all duration-200 hover:border-outline-variant hover:bg-surface-container-low',
              disabled && 'cursor-not-allowed opacity-50',
              error && 'border-error/50'
            )}
          >
            <GripVertical className="w-5 h-5 text-on-surface-variant/50" />
            <div className="w-8 h-8 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {index + 1}
            </div>
            <span className="text-on-surface font-medium">{displayText}</span>
          </div>
        );
      })}

      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}

// ============ Yes/No ============
export function YesNoRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const { t } = useTranslation();
  const yesNoStyle = (question.settings?.yesNoStyle ?? YesNoStyle.Text) as YesNoStyle;
  const yesLabel = t('common.yes');
  const noLabel = t('common.no');

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

// ============ Question Renderer Factory ============
export function QuestionRenderer(props: QuestionRendererProps) {
  const { t } = useTranslation();
  const { question } = props;

  switch (question.type) {
    case QuestionType.SingleChoice:
    case QuestionType.Dropdown: // Dropdown renders like single choice
      return <SingleChoiceRenderer {...props} />;
    case QuestionType.YesNo: // YesNo has its own renderer with style support
      return <YesNoRenderer {...props} />;
    case QuestionType.MultipleChoice:
    case QuestionType.Checkbox: // Checkbox is alias for multiple choice
      return <MultipleChoiceRenderer {...props} />;
    case QuestionType.Text:
    case QuestionType.ShortText: // ShortText is alias for Text
      return <TextRenderer {...props} />;
    case QuestionType.Email:
      return <EmailRenderer {...props} />;
    case QuestionType.Phone:
      return <PhoneRenderer {...props} />;
    case QuestionType.Url:
      return <UrlRenderer {...props} />;
    case QuestionType.Number:
      return <NumberRenderer {...props} />;
    case QuestionType.LongText:
      return <LongTextRenderer {...props} />;
    case QuestionType.Rating:
      return <RatingRenderer {...props} />;
    case QuestionType.Scale:
    case QuestionType.NPS: // NPS is a scale 0-10
      return <ScaleRenderer {...props} />;
    case QuestionType.Matrix:
      return <MatrixRenderer {...props} />;
    case QuestionType.Date:
    case QuestionType.DateTime: // DateTime uses same date input
      return <DateRenderer {...props} />;
    case QuestionType.FileUpload:
      return <FileUploadRenderer {...props} />;
    case QuestionType.Ranking:
      return <RankingRenderer {...props} />;
    default:
      return (
        <div className="p-4 rounded-xl bg-warning-container/50 text-on-warning-container">
          {t('errors.unsupportedQuestionType', { type: question.type })}
        </div>
      );
  }
}
