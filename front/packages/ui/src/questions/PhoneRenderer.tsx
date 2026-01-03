import { useState } from "react";
import type { QuestionRendererProps } from "../QuestionRenderer";
import { Phone } from "lucide-react";
import { cn } from "..";
import { validateQuestionValue, getPresetById } from "@/utils/validationPatterns";

// ============ Phone Input ============
export function PhoneRenderer({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps) {
  const { t } = useTranslation();
  const preset = question.settings?.validationPreset
    ? getPresetById(question.settings.validationPreset)
    : null;
  const placeholder =
    question.settings?.placeholder ||
    preset?.placeholder ||
    t("questionDefaults.placeholders.enterPhone");
  const maxLength = question.settings?.maxLength || 50;
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear local error while typing
    if (localError) setLocalError(null);
  };

  const handleBlur = () => {
    const stringValue = (value as string) || "";
    if (stringValue) {
      const result = validateQuestionValue(stringValue, "Phone", question.settings);
      if (!result.isValid) {
        setLocalError(result.errorMessage || t("validation.invalidPhone"));
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
          value={(value as string) || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            "w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-container-lowest text-on-surface text-lg",
            "placeholder:text-on-surface-variant/50 transition-all duration-200",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            displayError
              ? "border-error"
              : "border-outline-variant/50 hover:border-outline-variant",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>
      {preset && (
        <p className="text-on-surface-variant/70 text-xs">Format: {preset.descriptionKey}</p>
      )}
      {displayError && <p className="text-error text-sm">{displayError}</p>}
    </div>
  );
}
