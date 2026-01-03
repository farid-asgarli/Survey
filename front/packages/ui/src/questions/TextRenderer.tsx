import { cn } from "..";
import type { QuestionRendererProps } from "../QuestionRenderer";

// ============ Text Input ============
export function TextRenderer({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps) {
  const { t } = useTranslation();
  const placeholder = question.settings?.placeholder || t("publicSurvey.placeholders.yourAnswer");
  const maxLength = question.settings?.maxLength;

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          "w-full px-5 py-4 rounded-2xl border-2 bg-surface-container-lowest text-on-surface text-lg",
          "placeholder:text-on-surface-variant/50 transition-all duration-200",
          "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
          error ? "border-error" : "border-outline-variant/50 hover:border-outline-variant",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      <div className="flex justify-between items-center">
        {error && <p className="text-error text-sm">{error}</p>}
        {maxLength && (
          <p className="text-on-surface-variant/70 text-sm ml-auto">
            {((value as string) || "").length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
