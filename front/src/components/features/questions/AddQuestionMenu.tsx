// Add Question Menu - Beautiful floating menu to add question types

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Plus, X, Search, Sparkles, Type, ListChecks, Gauge, Calendar, Settings2 } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { QuestionTypeIcon, getQuestionTypeLabel, getQuestionTypeDescription } from './QuestionTypeInfo';
import { cn } from '@/lib/utils';
import { QuestionType } from '@/types';

// All unique types for search
const ALL_TYPES: QuestionType[] = [
  QuestionType.SingleChoice,
  QuestionType.MultipleChoice,
  QuestionType.Text,
  QuestionType.LongText,
  QuestionType.Rating,
  QuestionType.Scale,
  QuestionType.Matrix,
  QuestionType.Date,
  QuestionType.DateTime,
  QuestionType.FileUpload,
  QuestionType.Ranking,
  QuestionType.YesNo,
  QuestionType.Dropdown,
  QuestionType.NPS,
  QuestionType.Checkbox,
  QuestionType.Number,
  QuestionType.ShortText,
  QuestionType.Email,
  QuestionType.Phone,
  QuestionType.Url,
];

interface AddQuestionMenuProps {
  onSelectType: (type: QuestionType) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLElement>;
  position?: 'center' | 'below-trigger';
}

export function AddQuestionMenu({ onSelectType, isOpen, onOpenChange, triggerRef, position = 'center' }: AddQuestionMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>('popular');

  // Question categories with translated labels
  const QUESTION_CATEGORIES = useMemo(
    () => [
      {
        id: 'popular',
        label: t('questionCategories.popular'),
        icon: Sparkles,
        types: [QuestionType.SingleChoice, QuestionType.MultipleChoice, QuestionType.Text, QuestionType.Rating, QuestionType.Scale] as QuestionType[],
      },
      {
        id: 'text',
        label: t('questionCategories.textInput'),
        icon: Type,
        types: [
          QuestionType.Text,
          QuestionType.ShortText,
          QuestionType.LongText,
          QuestionType.Email,
          QuestionType.Phone,
          QuestionType.Url,
          QuestionType.Number,
        ] as QuestionType[],
      },
      {
        id: 'choice',
        label: t('questionCategories.choice'),
        icon: ListChecks,
        types: [
          QuestionType.SingleChoice,
          QuestionType.MultipleChoice,
          QuestionType.Dropdown,
          QuestionType.Checkbox,
          QuestionType.YesNo,
          QuestionType.Ranking,
        ] as QuestionType[],
      },
      {
        id: 'scale',
        label: t('questionCategories.ratingScale'),
        icon: Gauge,
        types: [QuestionType.Rating, QuestionType.Scale, QuestionType.NPS, QuestionType.Matrix] as QuestionType[],
      },
      {
        id: 'datetime',
        label: t('questionCategories.dateTime'),
        icon: Calendar,
        types: [QuestionType.Date, QuestionType.DateTime] as QuestionType[],
      },
      {
        id: 'advanced',
        label: t('questionCategories.advanced'),
        icon: Settings2,
        types: [QuestionType.FileUpload, QuestionType.Matrix, QuestionType.Ranking] as QuestionType[],
      },
    ],
    [t]
  );

  // Filter types based on search
  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return ALL_TYPES.filter(
      (type) => getQuestionTypeLabel(type).toLowerCase().includes(query) || getQuestionTypeDescription(type).toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Calculate position
  useEffect(() => {
    if (isOpen && position === 'below-trigger' && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isOpen, position, triggerRef]);

  // Focus search on open and reset state
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when closing - using useCallback to avoid dependency issues
  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setSearchQuery('');
      setActiveCategory('popular');
    }, 200);
  }, [onOpenChange]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const handleSelect = (type: QuestionType) => {
    onSelectType(type);
    handleClose();
  };

  if (!isOpen) return null;

  const currentCategory = QUESTION_CATEGORIES.find((c) => c.id === activeCategory);

  const menuContent = (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 w-175 max-h-[80vh] overflow-hidden flex flex-col',
        'bg-surface-container-low rounded-3xl shadow-2xl',
        'border border-outline-variant/50',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        position === 'center' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      )}
      style={position === 'below-trigger' ? { top: menuPosition.top, left: menuPosition.left, transform: 'translateX(-50%)' } : undefined}
    >
      {/* Header with Search */}
      <div className="shrink-0 p-4 border-b border-outline-variant/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-on-surface">{t('editors.addQuestion')}</h2>
          <IconButton variant="standard" size="sm" aria-label={t('common.close')} onClick={handleClose}>
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('editors.searchQuestionTypes')}
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-xl',
              'bg-surface-container text-on-surface placeholder:text-on-surface-variant/50',
              'border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20',
              'outline-none transition-all'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-container-high"
            >
              <X className="w-4 h-4 text-on-surface-variant" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Search Results */}
        {filteredTypes !== null ? (
          <div className="flex-1 p-4 overflow-auto">
            {filteredTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium">{t('editors.noQuestionTypesFound')}</p>
                <p className="text-sm">{t('editors.tryDifferentSearch')}</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-on-surface-variant mb-3">{t('editors.resultsFound', { count: filteredTypes.length })}</p>
                <div className="grid grid-cols-2 gap-2">
                  {filteredTypes.map((type) => (
                    <QuestionTypeButton key={type} type={type} onSelect={handleSelect} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Category Sidebar */}
            <div className="w-48 shrink-0 p-3 border-r border-outline-variant/30 bg-surface-container/30">
              <nav className="space-y-1">
                {QUESTION_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                        isActive
                          ? 'bg-primary text-on-primary font-medium'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Question Types Grid */}
            <div className="flex-1 p-4 overflow-auto">
              {currentCategory && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <currentCategory.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-on-surface">{currentCategory.label}</h3>
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      {t('editors.typesCount', { count: currentCategory.types.length })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {currentCategory.types.map((type) => (
                      <QuestionTypeButton key={type} type={type} onSelect={handleSelect} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer hint */}
      <div className="shrink-0 px-4 py-3 border-t border-outline-variant/30 bg-surface-container/30">
        <p className="text-xs text-on-surface-variant text-center">
          {t('editors.pressEscToClose')}{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-xs">Esc</kbd>
        </p>
      </div>
    </div>
  );

  // Render with portal and backdrop
  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-scrim/30 animate-in fade-in-0 duration-200" />
      {menuContent}
    </>,
    document.body
  );
}

// Reusable Question Type Button
function QuestionTypeButton({ type, onSelect }: { type: QuestionType; onSelect: (type: QuestionType) => void }) {
  return (
    <button
      onClick={() => onSelect(type)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl text-left',
        'bg-surface hover:bg-surface-container transition-all duration-150',
        'border border-transparent hover:border-primary/30',
        'group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
    >
      <div
        className={cn('shrink-0 w-10 h-10 rounded-xl flex items-center justify-center', 'bg-primary/10 group-hover:bg-primary/20 transition-colors')}
      >
        <QuestionTypeIcon type={type} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-on-surface group-hover:text-primary transition-colors">{getQuestionTypeLabel(type)}</div>
        <div className="text-xs text-on-surface-variant/70 truncate">{getQuestionTypeDescription(type)}</div>
      </div>
    </button>
  );
}

// Floating Add Button Component - Clean Email Editor-inspired design
interface AddQuestionButtonProps {
  onClick: () => void;
  className?: string;
}

export function AddQuestionButton({ onClick, className }: AddQuestionButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 w-full py-3',
        'border-2 border-dashed border-outline-variant/40 rounded-xl',
        'text-on-surface-variant text-sm font-medium',
        'hover:text-primary hover:border-primary/50 hover:bg-primary/5',
        'transition-all duration-200',
        'group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
        className
      )}
    >
      <div
        className={cn('w-7 h-7 rounded-lg flex items-center justify-center', 'bg-surface-container/50 group-hover:bg-primary/10 transition-colors')}
      >
        <Plus className="w-4 h-4" />
      </div>
      <span>{t('editors.addQuestion')}</span>
    </button>
  );
}
