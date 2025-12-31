import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, X, Check, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { IconButton } from './IconButton';

// ============================================================================
// Types
// ============================================================================

export interface DatePickerProps {
  /** Selected date value (ISO string: YYYY-MM-DD) */
  value?: string;
  /** Callback when date changes */
  onChange: (date: string | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: string;
  /** Maximum selectable date */
  maxDate?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Label for the input */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Additional class names */
  className?: string;
}

export interface DateRangePickerProps {
  /** From date value (ISO string: YYYY-MM-DD) */
  fromDate?: string;
  /** To date value (ISO string: YYYY-MM-DD) */
  toDate?: string;
  /** Callback when range changes */
  onChange: (from: string | undefined, to: string | undefined) => void;
  /** Minimum selectable date */
  minDate?: string;
  /** Maximum selectable date */
  maxDate?: string;
  /** Presets configuration */
  presets?: DatePreset[];
  /** Show presets tab */
  showPresets?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

export interface DatePreset {
  id: string;
  label: string;
  getRange: () => { fromDate: string; toDate: string };
}

// ============================================================================
// Utilities
// ============================================================================

// Month keys for i18n
const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;
const MONTH_SHORT_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const days: (Date | null)[] = [];

  // Add empty slots for days before the first day of the month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISO(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  return isNaN(date.getTime()) ? null : date;
}

function formatDisplayDate(dateStr: string | undefined, t: (key: string) => string): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!date) return '';
  const monthKey = MONTH_SHORT_KEYS[date.getMonth()];
  const month = t(`datePicker.monthsShort.${monthKey}`);
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

// M3 style: "Mon, Aug 17" format for header
function formatM3HeaderDate(dateStr: string | undefined, t: (key: string) => string): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!date) return '';
  const weekdayKey = WEEKDAY_KEYS[date.getDay()];
  const monthKey = MONTH_SHORT_KEYS[date.getMonth()];
  const weekday = t(`datePicker.weekDaysFull.${weekdayKey}`);
  const month = t(`datePicker.monthsShort.${monthKey}`);
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
}

function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

function isDateInRange(date: Date, from: Date | null, to: Date | null): boolean {
  if (!from || !to) return false;
  const time = date.getTime();
  return time >= from.getTime() && time <= to.getTime();
}

function isDateDisabled(date: Date, minDate?: string, maxDate?: string): boolean {
  if (minDate) {
    const min = parseISO(minDate);
    if (min && date < min) return true;
  }
  if (maxDate) {
    const max = parseISO(maxDate);
    if (max && date > max) return true;
  }
  return false;
}

// ============================================================================
// Calendar Component (shared between DatePicker and DateRangePicker)
// ============================================================================

interface CalendarGridProps {
  currentMonth: number;
  currentYear: number;
  selectedDate?: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  hoverDate?: Date | null;
  minDate?: string;
  maxDate?: string;
  onDateSelect: (date: Date) => void;
  onDateHover?: (date: Date | null) => void;
  isRangeMode?: boolean;
}

// Helper to safely compare dates with optional/null values
function safeSameDay(date: Date | null, compareTo: Date | null | undefined): boolean {
  if (!compareTo) return false;
  return isSameDay(date, compareTo);
}

function CalendarGrid({
  currentMonth,
  currentYear,
  selectedDate,
  rangeStart,
  rangeEnd,
  hoverDate,
  minDate,
  maxDate,
  onDateSelect,
  onDateHover,
  isRangeMode = false,
}: CalendarGridProps) {
  const { t } = useTranslation();
  const days = useMemo(() => getMonthDays(currentYear, currentMonth), [currentYear, currentMonth]);
  const today = useMemo(() => new Date(), []);

  // Calculate range info for connected line styling
  const getRangeInfo = useCallback(
    (date: Date | null, index: number) => {
      if (!date || !isRangeMode) {
        return { inRange: false, isStart: false, isEnd: false, isFirstOfRow: false, isLastOfRow: false };
      }

      const effectiveEnd = rangeEnd || hoverDate;
      const isRangeStartDay = safeSameDay(date, rangeStart);
      const isRangeEndDay = safeSameDay(date, effectiveEnd);
      const inRange = rangeStart && effectiveEnd && isDateInRange(date, rangeStart, effectiveEnd);

      const colIndex = index % 7;
      const isFirstOfRow = colIndex === 0;
      const isLastOfRow = colIndex === 6;

      return { inRange, isStart: isRangeStartDay, isEnd: isRangeEndDay, isFirstOfRow, isLastOfRow };
    },
    [isRangeMode, rangeStart, rangeEnd, hoverDate]
  );

  const getDateClasses = (date: Date | null) => {
    if (!date) return 'invisible';

    const isSelected = safeSameDay(date, selectedDate);
    const isToday = isSameDay(date, today);
    const isDisabled = isDateDisabled(date, minDate, maxDate);
    const isRangeStartDay = safeSameDay(date, rangeStart);
    const isRangeEndDay = safeSameDay(date, rangeEnd || hoverDate);

    const effectiveEnd = rangeEnd || hoverDate;
    const inRange = isRangeMode && rangeStart && effectiveEnd && !isRangeStartDay && !isRangeEndDay && isDateInRange(date, rangeStart, effectiveEnd);

    return cn(
      'relative z-10 h-10 w-10 flex items-center justify-center rounded-full text-sm transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      isDisabled && 'text-on-surface/38 cursor-not-allowed',
      !isDisabled && 'cursor-pointer',
      isToday && !isSelected && !isRangeStartDay && !isRangeEndDay && 'ring-1 ring-primary text-primary',
      isSelected && !isRangeMode && 'bg-primary text-on-primary font-medium',
      (isRangeStartDay || isRangeEndDay) && 'bg-primary text-on-primary font-medium',
      inRange && 'text-on-surface',
      !isDisabled && !isSelected && !isRangeStartDay && !isRangeEndDay && !inRange && !isToday && 'hover:bg-on-surface/8 text-on-surface'
    );
  };

  // UPDATED: Get background class for the range band
  const getRangeBandClass = useCallback(
    (date: Date | null, index: number): string => {
      if (!date) return '';

      const { inRange, isStart, isEnd, isFirstOfRow, isLastOfRow } = getRangeInfo(date, index);

      if (!inRange && !isStart && !isEnd) return '';

      const effectiveEnd = rangeEnd || hoverDate;
      const hasRangeBefore = rangeStart && effectiveEnd && date > rangeStart;
      const hasRangeAfter = rangeStart && effectiveEnd && date < effectiveEnd;

      // Build background shape using Tailwind classes
      const baseClasses = 'absolute inset-y-0 bg-primary/12';

      // Middle cells: full width background
      if (inRange && !isStart && !isEnd) {
        return cn(baseClasses, 'left-0 right-0');
      }

      // Start cell: from center to right
      if (isStart && hasRangeAfter) {
        return cn(baseClasses, 'left-1/2 right-0', isLastOfRow && 'rounded-r-full');
      }

      // End cell: from left to center
      if (isEnd && hasRangeBefore) {
        return cn(baseClasses, 'left-0 right-1/2', isFirstOfRow && 'rounded-l-full');
      }

      return '';
    },
    [getRangeInfo, rangeStart, rangeEnd, hoverDate]
  );

  return (
    <div className="px-4 pb-3">
      {/* Day headers */}
      <div className="flex w-full mb-1">
        {WEEKDAY_KEYS.map((dayKey, index) => (
          <div key={index} className="flex-1 h-12 flex items-center justify-center text-sm font-medium text-on-surface-variant">
            {t(`datePicker.weekDays.${dayKey}`)}
          </div>
        ))}
      </div>

      {/* Date grid - Using flex with percentage widths that auto-adjust */}
      <div className="flex flex-col w-full">
        {Array.from({ length: Math.ceil(days.length / 7) }, (_, rowIndex) => {
          const rowStart = rowIndex * 7;
          const rowEnd = (rowIndex + 1) * 7;
          const rowDays = days.slice(rowStart, rowEnd);

          // Pad the row to always have 7 cells
          while (rowDays.length < 7) {
            rowDays.push(null);
          }

          return (
            <div key={rowIndex} className="flex w-full">
              {rowDays.map((date, colIndex) => {
                const index = rowStart + colIndex;
                const bandClass = isRangeMode ? getRangeBandClass(date, index) : '';

                return (
                  <div key={colIndex} className="relative h-12 flex-1 flex items-center justify-center">
                    {/* Range connector band */}
                    {bandClass && <div className={bandClass} />}

                    <button
                      type="button"
                      disabled={!date || isDateDisabled(date, minDate, maxDate)}
                      onClick={() => date && onDateSelect(date)}
                      onMouseEnter={() => isRangeMode && onDateHover?.(date)}
                      onMouseLeave={() => isRangeMode && onDateHover?.(null)}
                      className={getDateClasses(date)}
                    >
                      {date?.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Calendar Header (Month/Year navigation) - M3 Style
// ============================================================================

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthYearClick?: () => void;
}

function CalendarHeader({ currentMonth, currentYear, onPrevMonth, onNextMonth, onMonthYearClick }: CalendarHeaderProps) {
  const { t } = useTranslation();
  const monthKey = MONTH_KEYS[currentMonth];

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Month/Year selector with dropdown indicator */}
      <button
        type="button"
        onClick={onMonthYearClick}
        className="flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1.5 -ml-2 rounded-lg hover:bg-on-surface/8"
      >
        {t(`datePicker.months.${monthKey}`)} {currentYear}
        <ChevronDown className="h-4 w-4" />
      </button>

      {/* Navigation arrows on the right */}
      <div className="flex items-center">
        <IconButton variant="standard" size="sm" onClick={onPrevMonth} aria-label={t('datePicker.previousMonth')}>
          <ChevronLeft className="h-5 w-5" />
        </IconButton>
        <IconButton variant="standard" size="sm" onClick={onNextMonth} aria-label={t('datePicker.nextMonth')}>
          <ChevronRight className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  );
}

// ============================================================================
// Month/Year Picker - M3 Style
// ============================================================================

interface MonthYearPickerProps {
  currentMonth: number;
  currentYear: number;
  onSelect: (month: number, year: number) => void;
  onBack: () => void;
}

function MonthYearPicker({ currentMonth, currentYear, onSelect, onBack }: MonthYearPickerProps) {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = useMemo(() => {
    const currentYearNow = new Date().getFullYear();
    const yearsArray = [];
    for (let y = currentYearNow - 10; y <= currentYearNow + 10; y++) {
      yearsArray.push(y);
    }
    return yearsArray;
  }, []);

  return (
    <div className="p-4">
      {/* Year selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-on-surface-variant mb-2 px-1">{t('datePicker.year')}</label>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto px-1">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-full transition-colors',
                year === selectedYear ? 'bg-primary text-on-primary font-medium' : 'text-on-surface hover:bg-on-surface/8'
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-3 gap-1">
        {MONTH_KEYS.map((monthKey, index) => (
          <button
            key={monthKey}
            type="button"
            onClick={() => onSelect(index, selectedYear)}
            className={cn(
              'px-3 py-2.5 text-sm rounded-full transition-colors',
              index === currentMonth && selectedYear === currentYear
                ? 'bg-primary text-on-primary font-medium'
                : 'text-on-surface hover:bg-on-surface/8'
            )}
          >
            {t(`datePicker.monthsShort.${MONTH_SHORT_KEYS[index]}`)}
          </button>
        ))}
      </div>

      {/* Back button */}
      <div className="mt-4 pt-3 border-t border-outline-variant/30">
        <Button variant="text" size="sm" onClick={onBack} className="w-full">
          {t('datePicker.backToCalendar')}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// DatePicker Dialog - M3 Modal Style
// ============================================================================

interface DatePickerDialogProps {
  open: boolean;
  onClose: () => void;
  value?: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  title?: string;
}

function DatePickerDialog({ open, onClose, value, onChange, minDate, maxDate, title }: DatePickerDialogProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('datePicker.selectDate');
  const [viewMode, setViewMode] = useState<'calendar' | 'monthYear' | 'input'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = value ? parseISO(value) : new Date();
    return date?.getMonth() ?? new Date().getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const date = value ? parseISO(value) : new Date();
    return date?.getFullYear() ?? new Date().getFullYear();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => (value ? parseISO(value) : null));
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState(false);
  const prevOpenRef = useRef(open);

  // Reset state when dialog opens
  useEffect(() => {
    // Only run when open changes from false to true
    if (open && !prevOpenRef.current) {
      const date = value ? parseISO(value) : new Date();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initializing dialog state on open transition
      setCurrentMonth(date?.getMonth() ?? new Date().getMonth());
      setCurrentYear(date?.getFullYear() ?? new Date().getFullYear());
      setSelectedDate(value ? parseISO(value) : null);
      setViewMode('calendar');
      setInputValue(value || '');
      setInputError(false);
    }
    prevOpenRef.current = open;
  }, [open, value]);

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setInputValue(formatDateISO(date));
    setInputError(false);
  }, []);

  const handleMonthYearSelect = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setViewMode('calendar');
  }, []);

  // Handle input mode changes with auto-formatting for YYYY-MM-DD
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;

      // Remove all non-numeric characters
      const digitsOnly = rawValue.replace(/\D/g, '');

      // Build formatted string with auto-inserted dashes
      let formatted = '';
      for (let i = 0; i < digitsOnly.length && i < 8; i++) {
        if (i === 4 || i === 6) {
          formatted += '-';
        }
        formatted += digitsOnly[i];
      }

      setInputValue(formatted);

      // Try to parse the date when we have a complete date (10 chars: YYYY-MM-DD)
      if (formatted.length === 10) {
        const parsed = parseISO(formatted);
        if (parsed && !isDateDisabled(parsed, minDate, maxDate)) {
          setSelectedDate(parsed);
          setCurrentMonth(parsed.getMonth());
          setCurrentYear(parsed.getFullYear());
          setInputError(false);
        } else {
          // Full date entered but invalid
          setInputError(true);
        }
      } else {
        setInputError(false);
      }
    },
    [minDate, maxDate]
  );

  const handleToggleInputMode = useCallback(() => {
    if (viewMode === 'input') {
      setViewMode('calendar');
    } else {
      setViewMode('input');
      setInputValue(selectedDate ? formatDateISO(selectedDate) : '');
    }
  }, [viewMode, selectedDate]);

  const handleConfirm = useCallback(() => {
    if (selectedDate) {
      onChange(formatDateISO(selectedDate));
      onClose();
    }
  }, [selectedDate, onChange, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - M3 scrim */}
      <div className="fixed inset-0 bg-scrim/32 animate-in fade-in duration-200" onClick={onClose} />

      {/* Dialog - M3 surface container high with 28dp corner radius */}
      <div
        className={cn(
          'relative w-full max-w-96 rounded-3xl overflow-hidden',
          'bg-surface-container-high shadow-xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        {/* Header - M3 style with supporting text and headline + edit icon */}
        <div className="px-6 pt-5 pb-6 border-b border-outline-variant/20">
          <p className="text-sm text-on-surface-variant mb-3">{resolvedTitle}</p>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl leading-10 font-normal text-on-surface">
              {selectedDate ? formatM3HeaderDate(formatDateISO(selectedDate), t) : t('datePicker.noDate')}
            </h2>
            <IconButton
              variant="standard"
              size="default"
              onClick={handleToggleInputMode}
              aria-label={viewMode === 'input' ? t('datePicker.switchToCalendar') : t('datePicker.switchToInput')}
              className="text-on-surface-variant"
            >
              {viewMode === 'input' ? <Calendar className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
            </IconButton>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'input' ? (
          <div className="px-6 py-8">
            <label className="block text-xs font-medium text-on-surface-variant mb-2">{t('datePicker.dateFormat')}</label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD"
              className={cn(
                'w-full h-14 px-4 text-lg rounded-xl transition-colors outline-none',
                'bg-surface-container border-2',
                inputError ? 'border-error text-error' : 'border-outline-variant/50 text-on-surface focus:border-primary'
              )}
            />
            {inputError && <p className="mt-2 text-sm text-error">{t('datePicker.invalidDate')}</p>}
          </div>
        ) : viewMode === 'calendar' ? (
          <>
            <CalendarHeader
              currentMonth={currentMonth}
              currentYear={currentYear}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onMonthYearClick={() => setViewMode('monthYear')}
            />
            <CalendarGrid
              currentMonth={currentMonth}
              currentYear={currentYear}
              selectedDate={selectedDate}
              minDate={minDate}
              maxDate={maxDate}
              onDateSelect={handleDateSelect}
            />
          </>
        ) : (
          <MonthYearPicker
            currentMonth={currentMonth}
            currentYear={currentYear}
            onSelect={handleMonthYearSelect}
            onBack={() => setViewMode('calendar')}
          />
        )}

        {/* Footer - M3 text buttons aligned right */}
        <div className="flex items-center justify-end gap-2 px-4 py-3">
          <Button variant="text" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="text" onClick={handleConfirm} disabled={!selectedDate}>
            OK
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================================================
// DatePicker Input Component
// ============================================================================

export function DatePicker({
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
  disabled = false,
  label,
  error,
  helperText,
  className,
}: DatePickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value ? formatDisplayDate(value, t) : '';
  const hasError = !!error;

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
    },
    [onChange]
  );

  return (
    <div className={cn('w-full', className)}>
      {label && <label className={cn('block text-sm font-semibold mb-2', hasError ? 'text-error' : 'text-on-surface')}>{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-full h-11 px-4 flex items-center gap-3 text-left',
          'bg-surface-container-lowest border-2 rounded-2xl',
          'transition-all duration-200',
          hasError ? 'border-error' : 'border-outline-variant/50 hover:border-outline-variant focus:border-primary',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Calendar className="h-5 w-5 text-on-surface-variant shrink-0" />
        <span className={cn('flex-1 text-sm truncate', displayValue ? 'text-on-surface' : 'text-on-surface-variant/40')}>
          {displayValue || placeholder || t('datePicker.selectDate')}
        </span>
        {value && !disabled && (
          <IconButton variant="standard" size="sm" className="h-6 w-6 shrink-0" onClick={handleClear} aria-label={t('datePicker.clearDate')}>
            <X className="h-3.5 w-3.5" />
          </IconButton>
        )}
      </button>

      {(helperText || error) && <p className={cn('mt-2 text-sm', hasError ? 'text-error' : 'text-on-surface-variant/70')}>{error || helperText}</p>}

      <DatePickerDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        title={t('datePicker.selectDate')}
      />
    </div>
  );
}

// ============================================================================
// DateRangePicker with Presets (for the DateRangeFilter component)
// ============================================================================

// Preset ID to translation key mapping
const PRESET_LABEL_KEYS: Record<string, string> = {
  today: 'datePicker.presetLabels.today',
  yesterday: 'datePicker.presetLabels.yesterday',
  last7d: 'datePicker.presetLabels.last7days',
  last30d: 'datePicker.presetLabels.last30days',
  thisMonth: 'datePicker.presetLabels.thisMonth',
  lastMonth: 'datePicker.presetLabels.lastMonth',
};

const DEFAULT_PRESETS: DatePreset[] = [
  {
    id: 'today',
    label: 'datePicker.presetLabels.today',
    getRange: () => {
      const today = formatDateISO(new Date());
      return { fromDate: today, toDate: today };
    },
  },
  {
    id: 'yesterday',
    label: 'datePicker.presetLabels.yesterday',
    getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = formatDateISO(yesterday);
      return { fromDate: dateStr, toDate: dateStr };
    },
  },
  {
    id: 'last7d',
    label: 'datePicker.presetLabels.last7days',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { fromDate: formatDateISO(start), toDate: formatDateISO(end) };
    },
  },
  {
    id: 'last30d',
    label: 'datePicker.presetLabels.last30days',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return { fromDate: formatDateISO(start), toDate: formatDateISO(end) };
    },
  },
  {
    id: 'thisMonth',
    label: 'datePicker.presetLabels.thisMonth',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { fromDate: formatDateISO(start), toDate: formatDateISO(now) };
    },
  },
  {
    id: 'lastMonth',
    label: 'datePicker.presetLabels.lastMonth',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { fromDate: formatDateISO(start), toDate: formatDateISO(end) };
    },
  },
];

interface DateRangePickerDialogProps {
  open: boolean;
  onClose: () => void;
  fromDate?: string;
  toDate?: string;
  onChange: (from: string | undefined, to: string | undefined) => void;
  minDate?: string;
  maxDate?: string;
  presets?: DatePreset[];
  showPresets?: boolean;
}

function DateRangePickerDialog({
  open,
  onClose,
  fromDate,
  toDate,
  onChange,
  minDate,
  maxDate,
  presets = DEFAULT_PRESETS,
  showPresets = true,
}: DateRangePickerDialogProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>(showPresets ? 'presets' : 'custom');
  const [viewMode, setViewMode] = useState<'calendar' | 'monthYear'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [rangeStart, setRangeStart] = useState<Date | null>(() => (fromDate ? parseISO(fromDate) : null));
  const [rangeEnd, setRangeEnd] = useState<Date | null>(() => (toDate ? parseISO(toDate) : null));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const prevOpenRef = useRef(open);

  // Reset state when dialog opens
  useEffect(() => {
    // Only run when open changes from false to true
    if (open && !prevOpenRef.current) {
      const startDate = fromDate ? parseISO(fromDate) : new Date();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initializing dialog state on open transition
      setCurrentMonth(startDate?.getMonth() ?? new Date().getMonth());
      setCurrentYear(startDate?.getFullYear() ?? new Date().getFullYear());
      setRangeStart(fromDate ? parseISO(fromDate) : null);
      setRangeEnd(toDate ? parseISO(toDate) : null);
      setSelectedPreset(null);
      setActiveTab(showPresets ? 'presets' : 'custom');
      setViewMode('calendar');
    }
    prevOpenRef.current = open;
  }, [open, fromDate, toDate, showPresets]);

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const handleMonthYearSelect = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setViewMode('calendar');
  }, []);

  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedPreset(null);

      // If no start date or both dates are set, start a new range
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(date);
        setRangeEnd(null);
      } else {
        // Set end date, ensuring start is before end
        if (date < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(date);
        } else {
          setRangeEnd(date);
        }
      }
    },
    [rangeStart, rangeEnd]
  );

  const handlePresetSelect = useCallback((preset: DatePreset) => {
    const range = preset.getRange();
    setRangeStart(parseISO(range.fromDate));
    setRangeEnd(parseISO(range.toDate));
    setSelectedPreset(preset.id);

    // Navigate to the start date's month
    const startDate = parseISO(range.fromDate);
    if (startDate) {
      setCurrentMonth(startDate.getMonth());
      setCurrentYear(startDate.getFullYear());
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (rangeStart) {
      onChange(formatDateISO(rangeStart), rangeEnd ? formatDateISO(rangeEnd) : formatDateISO(rangeStart));
      onClose();
    }
  }, [rangeStart, rangeEnd, onChange, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const displayRange = rangeStart
    ? `${formatM3HeaderDate(formatDateISO(rangeStart), t)}${
        rangeEnd && !isSameDay(rangeStart, rangeEnd) ? ` – ${formatM3HeaderDate(formatDateISO(rangeEnd), t)}` : ''
      }`
    : t('datePicker.selectDate');

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - M3 scrim */}
      <div className="fixed inset-0 bg-scrim/32 animate-in fade-in duration-200" onClick={onClose} />

      {/* Dialog - M3 surface container high */}
      <div
        className={cn(
          'relative w-full max-w-md rounded-3xl overflow-hidden',
          'bg-surface-container-high shadow-xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        {/* Header - M3 style */}
        <div className="px-6 pt-5 pb-5 border-b border-outline-variant/20">
          <p className="text-sm text-on-surface-variant mb-3">{t('datePicker.selectDateRange')}</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-normal text-on-surface truncate pr-2">{displayRange}</h2>
            <IconButton variant="standard" size="sm" onClick={onClose} className="text-on-surface-variant shrink-0" aria-label={t('common.close')}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Tabs - M3 segmented style */}
        {showPresets && (
          <div className="flex mx-3 mt-3 p-1 bg-surface-container rounded-full">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors',
                activeTab === 'presets' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              {t('datePicker.presets')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors',
                activeTab === 'custom' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              {t('datePicker.custom')}
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'presets' && showPresets ? (
          <div className="p-3 max-h-72 overflow-y-auto">
            <div className="space-y-0.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-full text-sm',
                    'transition-colors',
                    selectedPreset === preset.id
                      ? 'bg-secondary-container text-on-secondary-container font-medium'
                      : 'hover:bg-on-surface/8 text-on-surface'
                  )}
                >
                  <span>{t(preset.label)}</span>
                  {selectedPreset === preset.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        ) : viewMode === 'monthYear' ? (
          <MonthYearPicker
            currentMonth={currentMonth}
            currentYear={currentYear}
            onSelect={handleMonthYearSelect}
            onBack={() => setViewMode('calendar')}
          />
        ) : (
          <>
            <CalendarHeader
              currentMonth={currentMonth}
              currentYear={currentYear}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onMonthYearClick={() => setViewMode('monthYear')}
            />
            <CalendarGrid
              currentMonth={currentMonth}
              currentYear={currentYear}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoverDate={hoverDate}
              minDate={minDate}
              maxDate={maxDate}
              onDateSelect={handleDateSelect}
              onDateHover={setHoverDate}
              isRangeMode
            />
          </>
        )}

        {/* Footer - M3 text buttons */}
        <div className="flex items-center justify-end gap-2 px-4 py-3">
          <Button variant="text" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="text" onClick={handleConfirm} disabled={!rangeStart}>
            OK
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function DateRangePicker({
  fromDate,
  toDate,
  onChange,
  minDate,
  maxDate,
  presets,
  showPresets = true,
  disabled = false,
  className,
}: DateRangePickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = useMemo(() => {
    if (!fromDate) return '';
    const from = formatDisplayDate(fromDate, t);
    if (!toDate || fromDate === toDate) return from;
    return `${from} – ${formatDisplayDate(toDate, t)}`;
  }, [fromDate, toDate, t]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined, undefined);
    },
    [onChange]
  );

  const hasValue = !!fromDate;

  return (
    <div className={cn('relative', className)}>
      <Button
        variant={hasValue ? 'tonal' : 'outline'}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={cn('gap-2', hasValue && 'pr-2')}
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">{displayValue || t('datePicker.dateRange')}</span>
        {hasValue ? (
          <IconButton variant="standard" size="sm" className="h-6 w-6 ml-1" onClick={handleClear} aria-label={t('datePicker.clearDateFilter')}>
            <X className="h-3.5 w-3.5" />
          </IconButton>
        ) : (
          <ChevronRight className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
        )}
      </Button>

      <DateRangePickerDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fromDate={fromDate}
        toDate={toDate}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        presets={presets}
        showPresets={showPresets}
      />
    </div>
  );
}

export { DEFAULT_PRESETS, PRESET_LABEL_KEYS };
