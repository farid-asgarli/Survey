import { useState } from 'react';
import type { QuestionRendererProps } from '../types/index.js';
import { cn } from '@survey/ui-primitives';

// ============ Single Choice ============
export function SingleChoiceRenderer({ question, value, onChange, error, disabled, labels }: QuestionRendererProps) {
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
            <span className="text-on-surface font-medium">{labels.other}:</span>
            <input
              type="text"
              value={otherValue}
              onChange={handleOtherChange}
              onFocus={() => handleSelect('__other__')}
              disabled={disabled}
              placeholder={labels.pleaseSpecify}
              className="flex-1 bg-transparent border-b-2 border-outline-variant/50 focus:border-primary outline-none py-1 text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        </label>
      )}

      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}
