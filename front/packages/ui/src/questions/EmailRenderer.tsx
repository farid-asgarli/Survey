import { useState } from 'react';
import type { QuestionRendererProps } from '../types/index.js';
import { validateQuestionValue } from '@survey/validation';
import { cn } from '@survey/ui-primitives';
import { Mail } from 'lucide-react';

// ============ Email Input ============
export function EmailRenderer({ question, value, onChange, error, disabled, labels }: QuestionRendererProps) {
  const placeholder = question.settings?.placeholder || labels.placeholder || 'email@example.com';
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
        setLocalError(result.errorMessage || labels.invalidEmail || 'Please enter a valid email');
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
