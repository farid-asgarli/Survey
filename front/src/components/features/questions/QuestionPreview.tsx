// Question Preview - Interactive preview showing how question looks to respondent
// Now with state management for a realistic preview experience

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import { QuestionType, RatingStyle, YesNoStyle } from '@/types';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { Star, Heart, ThumbsUp, ThumbsDown, Smile, Meh, Frown, Check, X, GripVertical, RotateCcw, Info, Mail, Phone, Link, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuestionPreviewProps {
  question: DraftQuestion;
  className?: string;
  isInteractive?: boolean;
}

// Hook to manage preview state
function usePreviewState(question: DraftQuestion) {
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [textValue, setTextValue] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [scaleValue, setScaleValue] = useState<number | null>(null);
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);
  const [matrixValues, setMatrixValues] = useState<Record<string, string>>({});
  const [rankingOrder, setRankingOrder] = useState<string[]>(question.options.map((o) => o.id));

  const reset = useCallback(() => {
    setSelectedSingle(null);
    setSelectedMultiple([]);
    setTextValue('');
    setRating(null);
    setScaleValue(null);
    setDateValue(undefined);
    setMatrixValues({});
    setRankingOrder(question.options.map((o) => o.id));
  }, [question.options]);

  return {
    selectedSingle,
    setSelectedSingle,
    selectedMultiple,
    setSelectedMultiple,
    textValue,
    setTextValue,
    rating,
    setRating,
    scaleValue,
    setScaleValue,
    dateValue,
    setDateValue,
    matrixValues,
    setMatrixValues,
    rankingOrder,
    setRankingOrder,
    reset,
  };
}

export function QuestionPreview({ question, className, isInteractive = true }: QuestionPreviewProps) {
  const { t } = useTranslation();
  const state = usePreviewState(question);

  const hasAnswer =
    state.selectedSingle !== null ||
    state.selectedMultiple.length > 0 ||
    state.textValue !== '' ||
    state.rating !== null ||
    state.scaleValue !== null ||
    state.dateValue !== undefined ||
    Object.keys(state.matrixValues).length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Interactive mode header */}
      {isInteractive && (
        <div className="flex items-center justify-between text-xs text-on-surface-variant bg-surface-container/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            <span>{t('questionPreview.interactiveMode', 'Interactive preview - try it out!')}</span>
          </div>
          {hasAnswer && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={state.reset}
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t('common.reset', 'Reset')}
            </motion.button>
          )}
        </div>
      )}

      {/* Question Text */}
      <div>
        <h3 className="text-lg font-medium text-on-surface">
          {question.text || 'Question text'}
          {question.isRequired && <span className="text-error ml-1">*</span>}
        </h3>
        {question.description && <p className="text-sm text-on-surface-variant mt-1">{question.description}</p>}
      </div>

      {/* Question Type Preview */}
      <InteractiveQuestionPreview question={question} state={state} isInteractive={isInteractive} />
    </div>
  );
}

interface InteractivePreviewProps {
  question: DraftQuestion;
  state: ReturnType<typeof usePreviewState>;
  isInteractive: boolean;
}

function InteractiveQuestionPreview({ question, state, isInteractive }: InteractivePreviewProps) {
  switch (question.type) {
    case QuestionType.SingleChoice:
    case QuestionType.Dropdown:
      return (
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = state.selectedSingle === option.id;
            return (
              <motion.label
                key={option.id}
                whileHover={isInteractive ? { scale: 1.01 } : undefined}
                whileTap={isInteractive ? { scale: 0.99 } : undefined}
                onClick={isInteractive ? () => state.setSelectedSingle(option.id) : undefined}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                  isInteractive ? 'cursor-pointer' : 'cursor-default',
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-surface-container/50 border-2 border-transparent hover:bg-surface-container'
                )}
              >
                <motion.div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
                  )}
                  animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-2 h-2 rounded-full bg-on-primary" />
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className={cn('text-on-surface', isSelected && 'font-medium')}>{option.text}</span>
              </motion.label>
            );
          })}
        </div>
      );

    case QuestionType.YesNo:
      return <YesNoPreviewRenderer question={question} state={state} isInteractive={isInteractive} />;

    case QuestionType.MultipleChoice:
    case QuestionType.Checkbox:
      return (
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = state.selectedMultiple.includes(option.id);
            return (
              <motion.label
                key={option.id}
                whileHover={isInteractive ? { scale: 1.01 } : undefined}
                whileTap={isInteractive ? { scale: 0.99 } : undefined}
                onClick={
                  isInteractive
                    ? () => {
                        if (isSelected) {
                          state.setSelectedMultiple(state.selectedMultiple.filter((id) => id !== option.id));
                        } else {
                          state.setSelectedMultiple([...state.selectedMultiple, option.id]);
                        }
                      }
                    : undefined
                }
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                  isInteractive ? 'cursor-pointer' : 'cursor-default',
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-surface-container/50 border-2 border-transparent hover:bg-surface-container'
                )}
              >
                <motion.div
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                    isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
                  )}
                  animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.15 }}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                        <Check className="w-3 h-3 text-on-primary" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className={cn('text-on-surface', isSelected && 'font-medium')}>{option.text}</span>
              </motion.label>
            );
          })}
        </div>
      );

    case QuestionType.Text:
    case QuestionType.ShortText:
      return (
        <input
          type="text"
          value={state.textValue}
          onChange={isInteractive ? (e) => state.setTextValue(e.target.value) : undefined}
          placeholder={question.settings.placeholder || 'Your answer'}
          readOnly={!isInteractive}
          className={cn(
            'w-full px-4 py-3 rounded-xl border text-on-surface placeholder:text-on-surface-variant/50 transition-all',
            isInteractive
              ? 'bg-surface-container/30 border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none'
              : 'bg-surface-container/30 border-outline-variant cursor-default'
          )}
        />
      );

    case QuestionType.Email:
      return (
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
          <input
            type="email"
            value={state.textValue}
            onChange={isInteractive ? (e) => state.setTextValue(e.target.value) : undefined}
            placeholder={question.settings.placeholder || 'email@example.com'}
            readOnly={!isInteractive}
            className={cn(
              'w-full pl-12 pr-4 py-3 rounded-xl border text-on-surface placeholder:text-on-surface-variant/50 transition-all',
              isInteractive
                ? 'bg-surface-container/30 border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none'
                : 'bg-surface-container/30 border-outline-variant cursor-default'
            )}
          />
        </div>
      );

    case QuestionType.Phone:
      return (
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
          <input
            type="tel"
            value={state.textValue}
            onChange={isInteractive ? (e) => state.setTextValue(e.target.value) : undefined}
            placeholder={question.settings.placeholder || 'Enter phone number'}
            readOnly={!isInteractive}
            className={cn(
              'w-full pl-12 pr-4 py-3 rounded-xl border text-on-surface placeholder:text-on-surface-variant/50 transition-all',
              isInteractive
                ? 'bg-surface-container/30 border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none'
                : 'bg-surface-container/30 border-outline-variant cursor-default'
            )}
          />
        </div>
      );

    case QuestionType.Url:
      return (
        <div className="relative">
          <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
          <input
            type="url"
            value={state.textValue}
            onChange={isInteractive ? (e) => state.setTextValue(e.target.value) : undefined}
            placeholder={question.settings.placeholder || 'https://example.com'}
            readOnly={!isInteractive}
            className={cn(
              'w-full pl-12 pr-4 py-3 rounded-xl border text-on-surface placeholder:text-on-surface-variant/50 transition-all',
              isInteractive
                ? 'bg-surface-container/30 border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none'
                : 'bg-surface-container/30 border-outline-variant cursor-default'
            )}
          />
        </div>
      );

    case QuestionType.Number:
      return (
        <div className="relative">
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
          <input
            type="number"
            value={state.textValue}
            onChange={isInteractive ? (e) => state.setTextValue(e.target.value) : undefined}
            placeholder={question.settings.placeholder || 'Enter a number'}
            readOnly={!isInteractive}
            className={cn(
              'w-full pl-12 pr-4 py-3 rounded-xl border text-on-surface placeholder:text-on-surface-variant/50 transition-all',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              isInteractive
                ? 'bg-surface-container/30 border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none'
                : 'bg-surface-container/30 border-outline-variant cursor-default'
            )}
          />
        </div>
      );

    case QuestionType.LongText:
      return (
        <textarea
          value={state.textValue}
          onChange={isInteractive ? (e) => state.setTextValue(e.target.value) : undefined}
          placeholder={question.settings.placeholder || 'Your answer'}
          readOnly={!isInteractive}
          rows={4}
          className={cn(
            'w-full px-4 py-3 rounded-xl border text-on-surface placeholder:text-on-surface-variant/50 resize-none transition-all',
            isInteractive
              ? 'bg-surface-container/30 border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none'
              : 'bg-surface-container/30 border-outline-variant cursor-default'
          )}
        />
      );

    case QuestionType.Rating:
      return <RatingPreviewRenderer question={question} state={state} isInteractive={isInteractive} />;

    case QuestionType.Scale:
    case QuestionType.NPS: {
      const min = question.settings.minValue ?? 0;
      const max = question.settings.maxValue ?? 10;
      const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-on-surface-variant">
            <span>{question.settings.minLabel || min}</span>
            <span>{question.settings.maxLabel || max}</span>
          </div>
          <div className="flex gap-1.5">
            {values.map((value) => {
              const isSelected = state.scaleValue === value;
              return (
                <motion.button
                  key={value}
                  onClick={isInteractive ? () => state.setScaleValue(value) : undefined}
                  whileHover={isInteractive ? { scale: 1.05, y: -2 } : undefined}
                  whileTap={isInteractive ? { scale: 0.95 } : undefined}
                  className={cn(
                    'flex-1 py-3 rounded-xl border-2 font-medium transition-all',
                    isInteractive ? 'cursor-pointer' : 'cursor-default',
                    isSelected
                      ? 'bg-primary border-primary text-on-primary shadow-md'
                      : 'border-outline-variant bg-surface-container/30 text-on-surface-variant hover:bg-primary/10 hover:border-primary/30 hover:text-primary'
                  )}
                >
                  {value}
                </motion.button>
              );
            })}
          </div>
        </div>
      );
    }

    case QuestionType.Matrix: {
      const rows = question.settings.matrixRows || ['Row 1'];
      const columns = question.settings.matrixColumns || ['Column 1', 'Column 2'];

      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left" />
                {columns.map((col, i) => (
                  <th key={i} className="p-2 text-center text-sm font-medium text-on-surface-variant">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-outline-variant/30">
                  <td className="p-2 text-sm text-on-surface">{row}</td>
                  {columns.map((col, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`;
                    const isSelected = state.matrixValues[cellKey] === col;
                    return (
                      <td key={colIndex} className="p-2 text-center">
                        <motion.button
                          onClick={
                            isInteractive
                              ? () =>
                                  state.setMatrixValues({
                                    ...state.matrixValues,
                                    [cellKey]: col,
                                  })
                              : undefined
                          }
                          whileHover={isInteractive ? { scale: 1.1 } : undefined}
                          whileTap={isInteractive ? { scale: 0.9 } : undefined}
                          className={cn(
                            'w-5 h-5 mx-auto rounded-full border-2 flex items-center justify-center transition-all',
                            isInteractive ? 'cursor-pointer' : 'cursor-default',
                            isSelected ? 'border-primary bg-primary' : 'border-outline-variant hover:border-primary/50'
                          )}
                        >
                          {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-on-primary" />}
                        </motion.button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case QuestionType.Date:
    case QuestionType.DateTime:
      return (
        <DatePicker
          value={state.dateValue ? state.dateValue.toISOString().split('T')[0] : undefined}
          onChange={isInteractive ? (date) => state.setDateValue(date ? new Date(date) : undefined) : () => {}}
          disabled={!isInteractive}
          placeholder="Select date"
        />
      );

    case QuestionType.FileUpload:
      return (
        <motion.div
          whileHover={isInteractive ? { borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary-container)' } : undefined}
          className={cn(
            'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all',
            isInteractive
              ? 'border-outline-variant bg-surface-container/30 cursor-pointer hover:border-primary'
              : 'border-outline-variant bg-surface-container/30'
          )}
        >
          <motion.div className="text-on-surface-variant mb-2" whileHover={isInteractive ? { y: -5 } : undefined} transition={{ duration: 0.2 }}>
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </motion.div>
          <p className="text-sm text-on-surface-variant">Drop files here or click to upload</p>
          <p className="text-xs text-on-surface-variant/70 mt-1">
            Max {question.settings.maxFiles || 1} file(s) • {question.settings.maxFileSize || 5}MB each
          </p>
        </motion.div>
      );

    case QuestionType.Ranking: {
      const orderedOptions = state.rankingOrder.map((id) => question.options.find((o) => o.id === id)).filter(Boolean) as typeof question.options;

      return (
        <RankingPreview
          options={orderedOptions}
          rankingOrder={state.rankingOrder}
          setRankingOrder={state.setRankingOrder}
          isInteractive={isInteractive}
        />
      );
    }

    default:
      return null;
  }
}

// Separate ranking component to manage its own drag state
function RankingPreview({
  options,
  rankingOrder,
  setRankingOrder,
  isInteractive,
}: {
  options: { id: string; text: string }[];
  rankingOrder: string[];
  setRankingOrder: (order: string[]) => void;
  isInteractive: boolean;
}) {
  const [draggedRankingItem, setDraggedRankingItem] = useState<string | null>(null);

  const handleRankingDragStart = (id: string) => {
    if (!isInteractive) return;
    setDraggedRankingItem(id);
  };

  const handleRankingDragOver = (e: React.DragEvent, targetId: string) => {
    if (!isInteractive || !draggedRankingItem || draggedRankingItem === targetId) return;
    e.preventDefault();

    const newOrder = [...rankingOrder];
    const draggedIndex = newOrder.indexOf(draggedRankingItem);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedRankingItem);

    setRankingOrder(newOrder);
  };

  const handleRankingDragEnd = () => {
    setDraggedRankingItem(null);
  };

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: draggedRankingItem === option.id ? 0.5 : 1,
              y: 0,
              scale: draggedRankingItem === option.id ? 1.02 : 1,
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            draggable={isInteractive}
            onDragStart={() => handleRankingDragStart(option.id)}
            onDragOver={(e) => handleRankingDragOver(e, option.id)}
            onDragEnd={handleRankingDragEnd}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl bg-surface-container/50 transition-colors',
              isInteractive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            )}
          >
            <motion.div layout className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </motion.div>
            <span className="text-on-surface flex-1">{option.text}</span>
            {isInteractive && <GripVertical className="w-5 h-5 text-on-surface-variant/40" />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============ Rating Preview Renderer ============
function RatingPreviewRenderer({ question, state, isInteractive }: InteractivePreviewProps) {
  const maxValue = question.settings.maxValue || 5;
  const ratingStyle = (question.settings.ratingStyle ?? RatingStyle.Stars) as RatingStyle;

  // Get color for rating style
  const getColor = (isSelected: boolean) => {
    if (!isSelected) return 'text-on-surface-variant/30';
    switch (ratingStyle) {
      case RatingStyle.Hearts:
        return 'text-red-500';
      case RatingStyle.Thumbs:
        return 'text-primary';
      case RatingStyle.Smileys:
        return 'text-amber-500';
      case RatingStyle.Numbers:
        return 'text-primary';
      case RatingStyle.Stars:
      default:
        return 'text-warning';
    }
  };

  // Render icon based on style
  const renderIcon = (index: number, isSelected: boolean) => {
    const iconClass = 'w-8 h-8';
    switch (ratingStyle) {
      case RatingStyle.Hearts:
        return <Heart className={iconClass} fill={isSelected ? 'currentColor' : 'none'} />;
      case RatingStyle.Thumbs:
        return <ThumbsUp className={iconClass} fill={isSelected ? 'currentColor' : 'none'} />;
      case RatingStyle.Smileys: {
        // Show gradient from sad to happy
        const ratio = index / (maxValue - 1);
        if (ratio <= 0.33) return <Frown className={iconClass} />;
        if (ratio <= 0.66) return <Meh className={iconClass} />;
        return <Smile className={iconClass} />;
      }
      case RatingStyle.Numbers:
        return (
          <span
            className={cn(
              'text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg',
              isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container'
            )}
          >
            {index + 1}
          </span>
        );
      case RatingStyle.Stars:
      default:
        return <Star className={iconClass} fill={isSelected ? 'currentColor' : 'none'} />;
    }
  };

  return (
    <div className="space-y-2">
      {/* Labels */}
      {(question.settings.minLabel || question.settings.maxLabel) && (
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>{question.settings.minLabel || ''}</span>
          <span>{question.settings.maxLabel || ''}</span>
        </div>
      )}

      {/* Rating Icons */}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxValue }, (_, i) => {
          const value = i + 1;
          const isSelected = state.rating !== null && value <= state.rating;
          return (
            <motion.button
              key={i}
              onClick={isInteractive ? () => state.setRating(value) : undefined}
              whileHover={isInteractive ? { scale: 1.15 } : undefined}
              whileTap={isInteractive ? { scale: 0.95 } : undefined}
              className={cn(
                'p-1 transition-colors',
                isInteractive ? 'cursor-pointer' : 'cursor-default',
                getColor(isSelected),
                !isSelected && ratingStyle !== RatingStyle.Numbers && `hover:${getColor(true).replace('text-', 'text-')}/60`
              )}
              aria-label={`Rating ${value}`}
            >
              <motion.div animate={isSelected ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                {renderIcon(i, isSelected)}
              </motion.div>
            </motion.button>
          );
        })}
        {state.rating !== null && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="ml-3 text-sm font-medium text-on-surface">
            {state.rating} / {maxValue}
          </motion.span>
        )}
      </div>
    </div>
  );
}

// ============ Yes/No Preview Renderer ============
function YesNoPreviewRenderer({ question, state, isInteractive }: InteractivePreviewProps) {
  const yesNoStyle = (question.settings.yesNoStyle ?? YesNoStyle.Text) as YesNoStyle;

  // Ensure we have options - create defaults if missing
  const options =
    question.options?.length > 0
      ? question.options
      : [
          { id: 'yes', text: 'Yes', order: 0 },
          { id: 'no', text: 'No', order: 1 },
        ];

  const yesOption = options.find((o) => o.text.toLowerCase() === 'yes') || options[0];
  const noOption = options.find((o) => o.text.toLowerCase() === 'no') || options[1];

  switch (yesNoStyle) {
    case YesNoStyle.Thumbs:
      return (
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={isInteractive ? { scale: 1.05 } : undefined}
            whileTap={isInteractive ? { scale: 0.95 } : undefined}
            onClick={isInteractive ? () => state.setSelectedSingle(yesOption?.id || 'yes') : undefined}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
              isInteractive ? 'cursor-pointer' : 'cursor-default',
              state.selectedSingle === (yesOption?.id || 'yes')
                ? 'border-green-500 bg-green-50'
                : 'border-outline-variant/50 bg-surface-container-lowest hover:border-green-300'
            )}
          >
            <ThumbsUp className={cn('w-10 h-10', state.selectedSingle === (yesOption?.id || 'yes') ? 'text-green-600' : 'text-green-500/60')} />
            <span className="text-sm font-medium text-on-surface">{yesOption?.text || 'Yes'}</span>
          </motion.button>
          <motion.button
            whileHover={isInteractive ? { scale: 1.05 } : undefined}
            whileTap={isInteractive ? { scale: 0.95 } : undefined}
            onClick={isInteractive ? () => state.setSelectedSingle(noOption?.id || 'no') : undefined}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
              isInteractive ? 'cursor-pointer' : 'cursor-default',
              state.selectedSingle === (noOption?.id || 'no')
                ? 'border-red-500 bg-red-50'
                : 'border-outline-variant/50 bg-surface-container-lowest hover:border-red-300'
            )}
          >
            <ThumbsDown className={cn('w-10 h-10', state.selectedSingle === (noOption?.id || 'no') ? 'text-red-600' : 'text-red-500/60')} />
            <span className="text-sm font-medium text-on-surface">{noOption?.text || 'No'}</span>
          </motion.button>
        </div>
      );

    case YesNoStyle.Toggle: {
      const isYes = state.selectedSingle === (yesOption?.id || 'yes');
      return (
        <div className="flex items-center gap-4">
          <span className={cn('text-on-surface-variant transition-colors', !isYes && state.selectedSingle && 'text-on-surface font-medium')}>
            {noOption?.text || 'No'}
          </span>
          <motion.button
            onClick={isInteractive ? () => state.setSelectedSingle(isYes ? noOption?.id || 'no' : yesOption?.id || 'yes') : undefined}
            className={cn(
              'w-14 h-8 rounded-full relative border transition-all',
              isInteractive ? 'cursor-pointer' : 'cursor-default',
              isYes ? 'bg-primary border-primary' : 'bg-surface-container border-outline-variant'
            )}
          >
            <motion.div
              animate={{ x: isYes ? 24 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn('absolute top-1 w-6 h-6 rounded-full', isYes ? 'bg-on-primary' : 'bg-on-surface-variant/50')}
            />
          </motion.button>
          <span className={cn('text-on-surface-variant transition-colors', isYes && 'text-on-surface font-medium')}>{yesOption?.text || 'Yes'}</span>
        </div>
      );
    }

    case YesNoStyle.CheckX:
      return (
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={isInteractive ? { scale: 1.05 } : undefined}
            whileTap={isInteractive ? { scale: 0.95 } : undefined}
            onClick={isInteractive ? () => state.setSelectedSingle(yesOption?.id || 'yes') : undefined}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
              isInteractive ? 'cursor-pointer' : 'cursor-default',
              state.selectedSingle === (yesOption?.id || 'yes')
                ? 'border-green-500 bg-green-50'
                : 'border-outline-variant/50 bg-surface-container-lowest hover:border-green-300'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                state.selectedSingle === (yesOption?.id || 'yes') ? 'bg-green-500' : 'bg-green-100'
              )}
            >
              <Check className={cn('w-6 h-6', state.selectedSingle === (yesOption?.id || 'yes') ? 'text-white' : 'text-green-600')} strokeWidth={3} />
            </div>
            <span className="text-sm font-medium text-on-surface">{yesOption?.text || 'Yes'}</span>
          </motion.button>
          <motion.button
            whileHover={isInteractive ? { scale: 1.05 } : undefined}
            whileTap={isInteractive ? { scale: 0.95 } : undefined}
            onClick={isInteractive ? () => state.setSelectedSingle(noOption?.id || 'no') : undefined}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
              isInteractive ? 'cursor-pointer' : 'cursor-default',
              state.selectedSingle === (noOption?.id || 'no')
                ? 'border-red-500 bg-red-50'
                : 'border-outline-variant/50 bg-surface-container-lowest hover:border-red-300'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                state.selectedSingle === (noOption?.id || 'no') ? 'bg-red-500' : 'bg-red-100'
              )}
            >
              <X className={cn('w-6 h-6', state.selectedSingle === (noOption?.id || 'no') ? 'text-white' : 'text-red-600')} strokeWidth={3} />
            </div>
            <span className="text-sm font-medium text-on-surface">{noOption?.text || 'No'}</span>
          </motion.button>
        </div>
      );

    case YesNoStyle.Text:
    default:
      // Default text/radio style
      return (
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = state.selectedSingle === option.id;
            return (
              <motion.label
                key={option.id}
                whileHover={isInteractive ? { scale: 1.01 } : undefined}
                whileTap={isInteractive ? { scale: 0.99 } : undefined}
                onClick={isInteractive ? () => state.setSelectedSingle(option.id) : undefined}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                  isInteractive ? 'cursor-pointer' : 'cursor-default',
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-surface-container/50 border-2 border-transparent hover:bg-surface-container'
                )}
              >
                <motion.div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
                  )}
                  animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-2 h-2 rounded-full bg-on-primary" />
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className={cn('text-on-surface', isSelected && 'font-medium')}>{option.text}</span>
              </motion.label>
            );
          })}
        </div>
      );
  }
}
