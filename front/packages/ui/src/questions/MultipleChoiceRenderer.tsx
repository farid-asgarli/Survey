import { useState } from "react";
import type { QuestionRendererProps } from "../QuestionRenderer";
import { Check } from "lucide-react";
import { cn } from "..";

// ============ Multiple Choice ============
export function MultipleChoiceRenderer({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps) {
  const { t } = useTranslation();
  const options = question.settings?.options || [];
  const allowOther = question.settings?.allowOther;
  const [otherValue, setOtherValue] = useState("");
  const selectedValues = (value as string[]) || [];

  // Check if an option ID is in the selected values
  const isOptionSelected = (optionId: string) => selectedValues.includes(optionId);
  const isOtherSelected = selectedValues.some((v) => v.startsWith("__other__"));

  const handleToggle = (optionId: string) => {
    if (disabled) return;
    const newValues = isOptionSelected(optionId)
      ? selectedValues.filter((v) => v !== optionId)
      : [...selectedValues, optionId];
    onChange(newValues);
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOtherValue = e.target.value;
    setOtherValue(newOtherValue);

    // Update the values array
    const filteredValues = selectedValues.filter((v) => !v.startsWith("__other__"));
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
            "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200",
            isOptionSelected(option.id)
              ? "border-primary bg-primary-container/30"
              : "border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low",
            disabled && "opacity-50 cursor-not-allowed",
            error && selectedValues.length === 0 && "border-error/50"
          )}
          onClick={() => handleToggle(option.id)}
        >
          <div
            className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
              isOptionSelected(option.id) ? "border-primary bg-primary" : "border-outline-variant"
            )}
          >
            {isOptionSelected(option.id) && (
              <Check className="w-4 h-4 text-on-primary" strokeWidth={3} />
            )}
          </div>
          <span className="text-on-surface font-medium">{option.text}</span>
        </label>
      ))}

      {allowOther && (
        <label
          className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200",
            isOtherSelected
              ? "border-primary bg-primary-container/30"
              : "border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div
            className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
              isOtherSelected ? "border-primary bg-primary" : "border-outline-variant"
            )}
          >
            {isOtherSelected && <Check className="w-4 h-4 text-on-primary" strokeWidth={3} />}
          </div>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-on-surface font-medium">{t("questionRenderers.other")}:</span>
            <input
              type="text"
              value={otherValue}
              onChange={handleOtherChange}
              disabled={disabled}
              placeholder={t("questionRenderers.pleaseSpecify")}
              className="flex-1 bg-transparent border-b-2 border-outline-variant/50 focus:border-primary outline-none py-1 text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        </label>
      )}

      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}
