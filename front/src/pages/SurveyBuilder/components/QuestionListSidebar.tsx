// Question List Sidebar - Enhanced drag-and-drop with framer-motion
import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Plus, Layout, Eye, GripVertical, Sparkles } from 'lucide-react';
import { QuestionCard, AddQuestionButton, QuestionTypeIcon } from '@/components/features/questions';
import { cn } from '@/lib/utils';
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
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
  onAddQuestionOfType?: (type: QuestionType, afterIndex?: number) => void;
}

// Drop zone indicator component
function DropZoneIndicator({ isActive, position }: { isActive: boolean; position: 'top' | 'bottom' }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0.8 }}
          transition={{ duration: 0.15 }}
          className={cn('absolute left-3 right-3 h-1 rounded-full bg-primary z-10', position === 'top' ? '-top-1' : '-bottom-1')}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Draggable question item with enhanced visual feedback
function DraggableQuestionItem({
  question,
  index,
  isSelected,
  isReadOnly,
  isDragging,
  dropIndicator,
  onSelect,
  onDuplicate,
  onDelete,
  onRequiredChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  question: DraftQuestion;
  index: number;
  isSelected: boolean;
  isReadOnly: boolean;
  isDragging: boolean;
  dropIndicator: 'top' | 'bottom' | null;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRequiredChange: (required: boolean) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const dragControls = useDragControls();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? '0 10px 40px rgba(0,0,0,0.15)' : 'none',
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        layout: { duration: 0.2, ease: [0.2, 0, 0, 1] },
        opacity: { duration: 0.15 },
        scale: { duration: 0.15 },
      }}
      className="relative"
      draggable={!isReadOnly}
      onDragStart={!isReadOnly ? onDragStart : undefined}
      onDragEnd={onDragEnd}
      onDragOver={!isReadOnly ? onDragOver : undefined}
      onDrop={!isReadOnly ? onDrop : undefined}
    >
      {/* Drop zone indicators */}
      <DropZoneIndicator isActive={dropIndicator === 'top'} position="top" />
      <DropZoneIndicator isActive={dropIndicator === 'bottom'} position="bottom" />

      <QuestionCard
        question={question}
        index={index}
        isSelected={isSelected}
        isReadOnly={isReadOnly}
        onSelect={onSelect}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onRequiredChange={onRequiredChange}
        isDragging={isDragging}
        dragHandleProps={{
          onPointerDown: (e: React.PointerEvent) => dragControls.start(e),
          style: { touchAction: 'none' },
        }}
      />
    </motion.div>
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
  onDragStart,
  onDragOver,
  onDrop,
}: QuestionListSidebarProps) {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      onDragStart(e, index);

      // Set drag image
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.8';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 50, 30);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    },
    [onDragStart]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      onDragOver(e);

      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const position = e.clientY < midY ? 'top' : 'bottom';

      setDropTargetIndex(index);
      setDropPosition(position);
    },
    [onDragOver]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      const dropIndex = dropPosition === 'bottom' ? index + 1 : index;
      onDrop(e, dropIndex > (draggedIndex ?? 0) ? dropIndex - 1 : dropIndex);
      setDraggedIndex(null);
      setDropTargetIndex(null);
      setDropPosition(null);
    },
    [onDrop, dropPosition, draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
    setDropPosition(null);
  }, []);

  return (
    <aside
      className="group/resize shrink-0 flex flex-col bg-surface border-r border-outline-variant/30 overflow-hidden relative"
      style={{ width: 'var(--sidebar-width, 380px)', minWidth: '320px', maxWidth: '500px' }}
    >
      {/* Panel Header - Cleaner with icon */}
      <div className="shrink-0 p-4 border-b border-outline-variant/30 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', isReadOnly ? 'bg-surface-container' : 'bg-primary/10')}>
              {isReadOnly ? <Eye className="w-4 h-4 text-on-surface-variant" /> : <Layout className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <h2 className="font-semibold text-on-surface text-sm">{t('surveyBuilder.questions')}</h2>
              <p className="text-xs text-on-surface-variant">
                {questions.length} {questions.length === 1 ? t('common.item', 'item') : t('common.items', 'items')}
              </p>
            </div>
          </div>
          {!isReadOnly && (
            <motion.button
              onClick={onAddQuestion}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                'bg-primary text-on-primary',
                'hover:bg-primary/90 transition-colors'
              )}
            >
              <Plus className="w-4 h-4" />
              {t('surveyBuilder.add', 'Add')}
            </motion.button>
          )}
        </div>

        {/* Drag hint when empty */}
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
      <div
        ref={listRef}
        className="flex-1 overflow-auto p-3 space-y-2"
        onDragLeave={() => {
          setDropTargetIndex(null);
          setDropPosition(null);
        }}
      >
        {questions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-on-surface font-semibold text-lg mb-2">{t('surveyBuilder.noQuestions')}</p>
            {!isReadOnly && (
              <>
                <p className="text-on-surface-variant text-sm mb-6 max-w-xs">
                  {t('surveyBuilder.addFirstQuestionDesc', 'Start building your survey by adding your first question')}
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <AddQuestionButton onClick={onAddQuestion} />
                </motion.div>
              </>
            )}
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {questions.map((question, index) => (
                <DraggableQuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  isSelected={selectedQuestionId === question.id}
                  isReadOnly={isReadOnly}
                  isDragging={draggedIndex === index}
                  dropIndicator={dropTargetIndex === index ? dropPosition : null}
                  onSelect={() => onQuestionSelect(question.id)}
                  onDuplicate={() => onQuestionDuplicate(question.id)}
                  onDelete={() => onQuestionDelete(question.id)}
                  onRequiredChange={(required) => onQuestionRequiredChange(question.id, required)}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                />
              ))}
            </AnimatePresence>

            {/* Add Question Button - subtle at bottom (only in edit mode) */}
            {!isReadOnly && (
              <motion.div className="pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <motion.button
                  onClick={onAddQuestion}
                  whileHover={{ scale: 1.01, borderColor: 'var(--color-primary)' }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 p-4 rounded-xl',
                    'border-2 border-dashed border-outline-variant/40',
                    'text-on-surface-variant text-sm font-medium',
                    'hover:text-primary hover:bg-primary/5',
                    'transition-colors duration-200'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  {t('surveyBuilder.addQuestion')}
                </motion.button>
              </motion.div>
            )}
          </>
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
