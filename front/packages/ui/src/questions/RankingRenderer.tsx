import { GripVertical } from "lucide-react";
import { cn } from "..";
import type { QuestionRendererProps } from "../QuestionRenderer";

// ============ Ranking ============
export function RankingRenderer({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps) {
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
      <p className="text-on-surface-variant text-sm mb-2">{t("questionRenderers.dragToReorder")}</p>

      {rankedOptionIds.map((optionId, index) => {
        const option = optionMap.get(optionId);
        const displayText = option?.text || optionId;

        return (
          <div
            key={optionId}
            draggable={!disabled}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", index.toString());
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
              moveItem(fromIndex, index);
            }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border-2 border-outline-variant/50 bg-surface-container-lowest",
              "cursor-move transition-all duration-200 hover:border-outline-variant hover:bg-surface-container-low",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-error/50"
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
