// Base Option List Editor - Shared by SingleChoice, MultipleChoice, and Ranking
// Uses @dnd-kit for smooth drag-and-drop reordering (consistent with QuestionListSidebar)

import { useRef, useEffect } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Input, Switch, SortableList, SortableItemWithHandle, SortableHandle } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DraftOption } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';
import { useSortableList } from '@/hooks';

interface OptionListEditorProps {
  options: DraftOption[];
  onAddOption: () => void;
  onUpdateOption: (optionId: string, updates: Partial<DraftOption>) => void;
  onDeleteOption: (optionId: string) => void;
  onReorderOptions: (startIndex: number, endIndex: number) => void;
  allowOther?: boolean;
  onAllowOtherChange?: (allow: boolean) => void;
  otherLabel?: string;
  onOtherLabelChange?: (label: string) => void;
  minOptions?: number;
  optionIcon?: 'radio' | 'checkbox' | 'number';
}

export function OptionListEditor({
  options,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onReorderOptions,
  allowOther,
  onAllowOtherChange,
  otherLabel,
  onOtherLabelChange,
  minOptions = 2,
  optionIcon = 'radio',
}: OptionListEditorProps) {
  const { t } = useTranslation();
  const newOptionRef = useRef<HTMLInputElement>(null);
  const focusNewOptionRef = useRef(false);

  // Use centralized sortable list hook from @dnd-kit
  const sortable = useSortableList({
    items: options,
    getId: (option) => option.id,
    onReorder: onReorderOptions,
  });

  // Focus new option when added
  useEffect(() => {
    if (focusNewOptionRef.current && newOptionRef.current) {
      newOptionRef.current.focus();
      focusNewOptionRef.current = false;
    }
  }, [options.length]);

  const handleAddOption = () => {
    onAddOption();
    focusNewOptionRef.current = true;
  };

  const canDelete = options.length > minOptions;

  const renderOptionIcon = (index: number) => {
    switch (optionIcon) {
      case 'checkbox':
        return <div className="w-5 h-5 rounded-md border-2 border-outline-variant" />;
      case 'number':
        return (
          <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">{index + 1}</div>
        );
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-outline-variant" />;
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-on-surface">{t('questionTypes.options.title')}</label>

      <SortableList
        sortable={sortable}
        renderOverlay={(option) => {
          const index = options.findIndex((o) => o.id === option.id);
          return (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-surface border border-primary shadow-lg">
              <div className="p-1 text-on-surface-variant">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="shrink-0">{renderOptionIcon(index)}</div>
              <span className="flex-1 text-sm text-on-surface">{option.text || t('questionTypes.options.placeholder', { number: index + 1 })}</span>
            </div>
          );
        }}
      >
        <div className="space-y-1.5">
          {options.map((option, index) => (
            <SortableItemWithHandle
              key={option.id}
              id={option.id}
              className={cn(
                'group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200',
                'bg-surface hover:bg-surface-container/50',
                'border border-transparent hover:border-outline-variant/30'
              )}
            >
              {/* Drag Handle */}
              <SortableHandle className="p-1 rounded text-on-surface-variant/40 hover:text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4" />
              </SortableHandle>

              {/* Option Icon */}
              <div className="shrink-0">{renderOptionIcon(index)}</div>

              {/* Option Input */}
              <input
                ref={index === options.length - 1 ? newOptionRef : undefined}
                type="text"
                value={option.text}
                onChange={(e) => onUpdateOption(option.id, { text: e.target.value })}
                placeholder={t('questionTypes.options.placeholder', { number: index + 1 })}
                className={cn(
                  'flex-1 px-2 py-1.5 rounded-md bg-transparent text-on-surface text-sm',
                  'placeholder:text-on-surface-variant/50',
                  'focus:outline-none focus:bg-surface-container/50 focus:ring-1 focus:ring-primary/30'
                )}
              />

              {/* Delete Button */}
              <button
                onClick={() => onDeleteOption(option.id)}
                disabled={!canDelete}
                className={cn(
                  'p-1.5 rounded-md text-on-surface-variant/40 hover:text-error hover:bg-error/8 transition-colors',
                  'opacity-0 group-hover:opacity-100',
                  !canDelete && 'opacity-30 pointer-events-none'
                )}
                aria-label={t('questionTypes.options.remove')}
              >
                <X className="w-4 h-4" />
              </button>
            </SortableItemWithHandle>
          ))}
        </div>
      </SortableList>

      {/* Add Option Button */}
      <button
        onClick={handleAddOption}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2.5 rounded-lg',
          'text-sm font-medium text-on-surface-variant hover:text-primary',
          'border border-dashed border-outline-variant/40 hover:border-primary/50 hover:bg-primary/5',
          'transition-all duration-200'
        )}
      >
        <Plus className="w-4 h-4" />
        <span>{t('questionTypes.options.add')}</span>
      </button>

      {/* Allow Other Option */}
      {onAllowOtherChange && (
        <div className="pt-3 mt-3 border-t border-outline-variant/20 space-y-3">
          <Switch
            label={t('questionEditor.choice.addOther')}
            description={t('questionEditor.choice.addOtherDesc')}
            checked={allowOther}
            onChange={(e) => onAllowOtherChange(e.target.checked)}
          />

          {allowOther && onOtherLabelChange && (
            <Input
              size="sm"
              label={t('questionEditor.choice.otherLabel')}
              value={otherLabel || t('questionEditor.choice.otherPlaceholder')}
              onChange={(e) => onOtherLabelChange(e.target.value)}
              placeholder={t('questionEditor.choice.otherPlaceholder')}
            />
          )}
        </div>
      )}
    </div>
  );
}
