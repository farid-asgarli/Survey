import { DatePicker } from "../DatePicker";
import type { QuestionRendererProps } from "../QuestionRenderer";

// ============ Date ============
export function DateRenderer({ value, onChange, error, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-2">
      <DatePicker
        value={(value as string) || undefined}
        onChange={(date) => onChange(date || "")}
        disabled={disabled}
        error={error}
        placeholder="Select a date"
      />
    </div>
  );
}
