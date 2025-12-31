// Question Card - Draggable card for question list in builder

import { forwardRef, type HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, Copy, Trash2, ChevronRight } from 'lucide-react';
import { IconButton, Switch } from '@/components/ui';
import { QuestionTypeIcon, getQuestionTypeLabel } from './QuestionTypeInfo';
import { cn } from '@/lib/utils';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';

interface QuestionCardProps extends HTMLAttributes<HTMLDivElement> {
  question: DraftQuestion;
  index: number;
  isSelected: boolean;
  isReadOnly?: boolean;
  /** Override displayed text (for translations) */
  displayText?: string;
  /** Whether displaying fallback text (not translated) */
  isUsingFallback?: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRequiredChange: (required: boolean) => void;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export const QuestionCard = forwardRef<HTMLDivElement, QuestionCardProps>(
  (
    {
      question,
      index,
      isSelected,
      isReadOnly = false,
      displayText,
      isUsingFallback = false,
      onSelect,
      onDuplicate,
      onDelete,
      onRequiredChange,
      isDragging,
      dragHandleProps,
      className,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();
    const textToDisplay = displayText ?? question.text;

    return (
      <div
        ref={ref}
        className={cn(
          'group relative bg-surface-container-lowest rounded-2xl border-2',
          'transition-[border-radius,border-color,background-color] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
          isSelected
            ? 'border-primary ring-2 ring-primary/20 rounded-3xl'
            : 'border-outline-variant/40 hover:border-outline-variant hover:rounded-3xl',
          isDragging && 'opacity-95 border-primary/50',
          className
        )}
        {...props}
      >
        <div className="flex items-stretch">
          {/* Drag Handle - hidden in read-only mode */}
          {!isReadOnly && (
            <div
              {...dragHandleProps}
              className={cn(
                'shrink-0 w-9 flex items-center justify-center cursor-grab active:cursor-grabbing',
                'text-on-surface-variant/40 hover:text-on-surface-variant/70',
                'border-r border-outline-variant/20 rounded-l-2xl',
                'hover:bg-surface-container/50 transition-colors'
              )}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          {/* Main Content */}
          <button
            onClick={onSelect}
            className={cn(
              'flex-1 min-w-0 flex items-center gap-3 px-3 py-3.5 text-left focus-visible:outline-none overflow-hidden',
              isReadOnly && 'rounded-l-2xl'
            )}
          >
            {/* Question Number & Type */}
            <div className="shrink-0 flex items-center gap-2.5">
              <span
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                  isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                )}
              >
                {index + 1}
              </span>
              <div className="text-on-surface-variant/70">
                <QuestionTypeIcon type={question.type} className="w-5 h-5" />
              </div>
            </div>

            {/* Question Text */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'font-medium truncate block text-sm',
                    isSelected ? 'text-primary' : 'text-on-surface',
                    isUsingFallback && 'italic opacity-70'
                  )}
                >
                  {textToDisplay || t('editors.untitledQuestion')}
                </span>
                {question.isRequired && <span className="shrink-0 text-error text-xs font-medium">*</span>}
                {isUsingFallback && (
                  <span className="shrink-0 text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                    {t('localization.fallback', 'Fallback')}
                  </span>
                )}
              </div>
              <div className="text-xs text-on-surface-variant/70 mt-0.5 truncate">
                {getQuestionTypeLabel(question.type)}
                {question.options.length > 0 && ` • ${question.options.length} ${t('editors.options')}`}
              </div>
            </div>

            {/* Expand Indicator */}
            <ChevronRight
              className={cn('shrink-0 w-4 h-4 text-on-surface-variant/40 transition-transform', isSelected && 'rotate-90 text-primary')}
            />
          </button>

          {/* Actions - hidden in read-only mode */}
          {!isReadOnly && (
            <div
              className={cn(
                'shrink-0 flex items-center gap-1 px-2 border-l border-outline-variant/20',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                isSelected && 'opacity-100'
              )}
            >
              <IconButton
                variant="standard"
                size="sm"
                aria-label={t('common.duplicate')}
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <Copy className="w-4 h-4" />
              </IconButton>
              <IconButton
                variant="standard"
                size="sm"
                aria-label={t('common.delete')}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-on-surface-variant hover:text-error hover:bg-error/8"
              >
                <Trash2 className="w-4 h-4" />
              </IconButton>
            </div>
          )}
        </div>

        {/* Quick Required Toggle - visible when selected (not in read-only mode) */}
        {isSelected && !isReadOnly && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20 bg-surface-container/30 rounded-b-2xl">
            <Switch size="sm" label={t('editors.required')} checked={question.isRequired} onChange={(e) => onRequiredChange(e.target.checked)} />
          </div>
        )}
      </div>
    );
  }
);

QuestionCard.displayName = 'QuestionCard';
