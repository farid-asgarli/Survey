// Question List Sidebar - M3 Expressive Design with @dnd-kit
// Features:
// - Smooth drag-and-drop using @dnd-kit (centralized)
// - No shadows (uses color elevation)
// - Dynamic shapes (rounded-full for action buttons)
// - Semantic color tokens
import { useRef, useCallback, useMemo, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layout, Eye, GripVertical } from 'lucide-react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionCard, AddQuestionButton } from '@/components/features/questions';
import { Button, LogoIcon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useSortableList, useTranslatedQuestions } from '@/hooks';
import type { DraftQuestion } from '@/stores';
import type { QuestionType } from '@/types';

interface QuestionListSidebarProps {
  questions: DraftQuestion[];
  selectedQuestionId: string | null;
  isReadOnly?: boolean;
  onQuestionSelect: (id: string) => void;
  onQuestionDuplicate: (id: string) => void;
  onQuestionDelete: (id: string) => void;
  onQuestionRequiredChange: (id: string, required: boolean) => void;
  onAddQuestion: () => void;
  onReorderQuestions: (fromIndex: number, toIndex: number) => void;
  onAddQuestionOfType?: (type: QuestionType, afterIndex?: number) => void;
}

// Sortable question item using @dnd-kit
function SortableQuestionItem({
  question,
  index,
  isSelected,
  isReadOnly,
  displayText,
  isUsingFallback,
  onSelect,
  onDuplicate,
  onDelete,
  onRequiredChange,
}: {
  question: DraftQuestion;
  index: number;
  isSelected: boolean;
  isReadOnly: boolean;
  displayText?: string;
  isUsingFallback?: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRequiredChange: (required: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    disabled: isReadOnly,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    // Hide the original item when dragging, the DragOverlay shows the preview
    opacity: isDragging ? 0 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          layout: { duration: 0.2, ease: [0.2, 0, 0, 1] },
          opacity: { duration: 0.15 },
        }}
      >
        <QuestionCard
          question={question}
          index={index}
          isSelected={isSelected}
          isReadOnly={isReadOnly}
          displayText={displayText}
          isUsingFallback={isUsingFallback}
          onSelect={onSelect}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onRequiredChange={onRequiredChange}
          isDragging={isDragging}
          dragHandleProps={{
            ref: setActivatorNodeRef,
            ...attributes,
            ...listeners,
            style: { touchAction: 'none' },
          }}
        />
      </motion.div>
    </div>
  );
}

// Drag overlay preview - uses actual QuestionCard for consistent appearance
function QuestionDragOverlay({
  question,
  index,
  displayText,
  isUsingFallback,
}: {
  question: DraftQuestion;
  index: number;
  displayText?: string;
  isUsingFallback?: boolean;
}) {
  return (
    <div className="ring-2 ring-primary/30 rounded-2xl shadow-xl">
      <QuestionCard
        question={question}
        index={index}
        isSelected={false}
        isReadOnly={true}
        displayText={displayText}
        isUsingFallback={isUsingFallback}
        isDragging={true}
        onSelect={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
        onRequiredChange={() => {}}
      />
    </div>
  );
}

export function QuestionListSidebar({
  questions,
  selectedQuestionId,
  isReadOnly = false,
  onQuestionSelect,
  onQuestionDuplicate,
  onQuestionDelete,
  onQuestionRequiredChange,
  onAddQuestion,
  onReorderQuestions,
}: QuestionListSidebarProps) {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);

  // Get translated questions based on editing language
  const { questions: translatedQuestions } = useTranslatedQuestions();

  // Create a map for quick lookup of translated text by question ID
  const translationMap = useMemo(
    () => new Map(translatedQuestions.map((q) => [q.id, { displayText: q.displayText, isUsingFallback: q.isUsingFallback }])),
    [translatedQuestions]
  );

  // Centralized sortable list hook
  const sortable = useSortableList({
    items: questions,
    getId: (q) => q.id,
    onReorder: onReorderQuestions,
    disabled: isReadOnly,
  });

  // Render drag overlay content
  const renderOverlay = useCallback(
    (item: DraftQuestion) => {
      const idx = questions.findIndex((q) => q.id === item.id);
      const translation = translationMap.get(item.id);
      return (
        <QuestionDragOverlay question={item} index={idx} displayText={translation?.displayText} isUsingFallback={translation?.isUsingFallback} />
      );
    },
    [questions, translationMap]
  );

  return (
    <aside
      className="group/resize shrink-0 flex flex-col bg-surface border-r border-outline-variant/30 overflow-hidden relative"
      style={{ width: 'var(--sidebar-width, 380px)', minWidth: '320px', maxWidth: '500px' }}
    >
      {/* Panel Header - Cleaner with icon */}
      <div className="shrink-0 p-4 border-b border-outline-variant/30 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn('w-9 h-9 rounded-full flex items-center justify-center', isReadOnly ? 'bg-surface-container' : 'bg-primary-container')}
            >
              {isReadOnly ? <Eye className="w-4 h-4 text-on-surface-variant" /> : <Layout className="w-4 h-4 text-on-primary-container" />}
            </div>
            <div>
              <h2 className="font-semibold text-on-surface text-sm">{t('surveyBuilder.questions')}</h2>
              <p className="text-xs text-on-surface-variant">
                {questions.length} {questions.length === 1 ? t('common.item', 'item') : t('common.items', 'items')}
              </p>
            </div>
          </div>
          {!isReadOnly && (
            <Button variant="filled" size="sm" onClick={onAddQuestion} className="gap-1.5">
              <Plus className="w-4 h-4" />
              {t('surveyBuilder.add', 'Add')}
            </Button>
          )}
        </div>

        {/* Drag hint when not empty */}
        {!isReadOnly && questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant/60"
          >
            <GripVertical className="w-3 h-3" />
            <span>{t('surveyBuilder.dragToReorder', 'Drag to reorder questions')}</span>
          </motion.div>
        )}
      </div>

      {/* Question List */}
      <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2">
        {questions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center py-16 text-center px-4"
          >
            {/* Icon container with subtle animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.2, 0, 0, 1] }}
              className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center mb-5 border-2 border-primary/20"
            >
              <LogoIcon size="lg" />
            </motion.div>

            {/* Title */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-on-surface font-bold text-lg mb-2"
            >
              {t('surveyBuilder.noQuestions')}
            </motion.p>

            {!isReadOnly && (
              <>
                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  className="text-on-surface-variant text-sm mb-8 max-w-60 leading-relaxed"
                >
                  {t('surveyBuilder.addFirstQuestionDesc', 'Start building your survey by adding your first question')}
                </motion.p>

                {/* Add Question Button */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
                  <AddQuestionButton onClick={onAddQuestion} />
                </motion.div>
              </>
            )}
          </motion.div>
        ) : (
          <DndContext
            sensors={sortable.sensors}
            collisionDetection={closestCenter}
            onDragStart={sortable.handleDragStart}
            onDragEnd={sortable.handleDragEnd}
            onDragCancel={sortable.handleDragCancel}
          >
            <SortableContext items={sortable.itemIds} strategy={verticalListSortingStrategy}>
              <AnimatePresence mode="popLayout">
                {questions.map((question, index) => {
                  const translation = translationMap.get(question.id);
                  return (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      index={index}
                      isSelected={selectedQuestionId === question.id}
                      isReadOnly={isReadOnly}
                      displayText={translation?.displayText}
                      isUsingFallback={translation?.isUsingFallback}
                      onSelect={() => onQuestionSelect(question.id)}
                      onDuplicate={() => onQuestionDuplicate(question.id)}
                      onDelete={() => onQuestionDelete(question.id)}
                      onRequiredChange={(required) => onQuestionRequiredChange(question.id, required)}
                    />
                  );
                })}
              </AnimatePresence>

              {/* Add Question Button - subtle at bottom (only in edit mode) */}
              {!isReadOnly && (
                <motion.div className="pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <motion.button
                    onClick={onAddQuestion}
                    whileHover={{ scale: 1.01, borderColor: 'var(--color-primary)' }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 p-4 rounded-2xl',
                      'border-2 border-dashed border-outline-variant/50',
                      'text-on-surface-variant text-sm font-semibold',
                      'hover:text-primary hover:bg-primary-container/30 hover:border-primary/50',
                      'transition-all duration-300'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    {t('surveyBuilder.addQuestion')}
                  </motion.button>
                </motion.div>
              )}
            </SortableContext>

            {/* Drag Overlay */}
            <DragOverlay>{sortable.activeItem ? renderOverlay(sortable.activeItem) : null}</DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Resize Handle - more subtle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-primary/30 active:bg-primary/50 transition-colors z-10"
        onMouseDown={(e) => {
          e.preventDefault();
          const aside = e.currentTarget.parentElement;
          if (!aside) return;
          const startX = e.clientX;
          const startWidth = aside.offsetWidth;

          const onMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.min(500, Math.max(320, startWidth + delta));
            aside.style.setProperty('--sidebar-width', `${newWidth}px`);
          };

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
          };

          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        }}
      />
    </aside>
  );
}
