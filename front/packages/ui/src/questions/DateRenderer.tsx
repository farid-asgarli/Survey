import { DatePicker } from '@survey/ui-primitives';
import type { QuestionRendererProps } from '../types/index.js';

// ============ Date ============
export function DateRenderer({ value, onChange, error, disabled, labels }: QuestionRendererProps) {
  return (
    <div className="space-y-2">
      <DatePicker
        value={(value as string) || undefined}
        onChange={(date) => onChange(date || '')}
        disabled={disabled}
        error={error}
        placeholder={labels.placeholder || 'Select a date'}
      />
    </div>
  );
}
