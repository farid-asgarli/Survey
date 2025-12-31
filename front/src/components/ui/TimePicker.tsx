import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { IconButton } from './IconButton';

// ============================================================================
// Types
// ============================================================================

export interface TimePickerProps {
  /** Selected time value (HH:mm format in 24h) */
  value?: string;
  /** Callback when time changes */
  onChange: (time: string | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Use 24-hour format (default: false, uses 12-hour with AM/PM) */
  use24Hour?: boolean;
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

type TimeMode = 'hour' | 'minute';
type Period = 'AM' | 'PM';
type InputMode = 'dial' | 'keyboard';

// ============================================================================
// Utilities
// ============================================================================

function parseTime(timeStr: string | undefined): { hour: number; minute: number; period: Period } {
  if (!timeStr) {
    return { hour: 12, minute: 0, period: 'AM' };
  }

  const [hourStr, minuteStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  let period: Period = 'AM';
  if (hour >= 12) {
    period = 'PM';
    if (hour > 12) hour -= 12;
  }
  if (hour === 0) hour = 12;

  return { hour, minute, period };
}

function formatTime24(hour: number, minute: number, period: Period): string {
  let hour24 = hour;
  if (period === 'PM' && hour !== 12) {
    hour24 = hour + 12;
  } else if (period === 'AM' && hour === 12) {
    hour24 = 0;
  }
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatDisplayTime(timeStr: string | undefined, use24Hour: boolean): string {
  if (!timeStr) return '';

  const { hour, minute, period } = parseTime(timeStr);

  if (use24Hour) {
    const [h, m] = timeStr.split(':');
    return `${h}:${m}`;
  }

  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}

// ============================================================================
// Clock Dial Component - M3 Expressive Design
// ============================================================================

interface ClockDialProps {
  mode: TimeMode;
  value: number;
  onChange: (value: number) => void;
  onModeChange?: (mode: TimeMode) => void;
}

function ClockDial({ mode, value, onChange }: ClockDialProps) {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const numbers = useMemo(() => {
    if (mode === 'hour') {
      return Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
    }
    return Array.from({ length: 12 }, (_, i) => i * 5);
  }, [mode]);

  // Calculate angle for hand position
  const getHandAngle = useCallback(() => {
    if (mode === 'hour') {
      return ((value % 12) / 12) * 360 - 90;
    }
    return (value / 60) * 360 - 90;
  }, [mode, value]);

  // Convert position to value
  const positionToValue = useCallback(
    (clientX: number, clientY: number) => {
      if (!dialRef.current) return value;

      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = clientX - centerX;
      const y = clientY - centerY;

      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = (angle + 90 + 360) % 360;

      if (mode === 'hour') {
        let hour = Math.round(angle / 30);
        if (hour === 0) hour = 12;
        return hour;
      } else {
        let minute = Math.round(angle / 6);
        if (minute === 60) minute = 0;
        return minute;
      }
    },
    [mode, value]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const newValue = positionToValue(e.clientX, e.clientY);
      onChange(newValue);
    },
    [onChange, positionToValue]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const newValue = positionToValue(e.clientX, e.clientY);
      onChange(newValue);
    },
    [isDragging, onChange, positionToValue]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handAngle = getHandAngle();
  const handLength = 80; // Distance from center to number circle

  return (
    <div
      ref={dialRef}
      className="relative w-64 h-64 rounded-full bg-surface-container-highest select-none touch-none cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary z-10" />

      {/* Clock hand */}
      <div
        className="absolute top-1/2 left-1/2 origin-left h-0.5 bg-primary transition-transform duration-75"
        style={{
          width: `${handLength}px`,
          transform: `translate(0, -50%) rotate(${handAngle}deg)`,
        }}
      />

      {/* Selection circle at hand end */}
      <div
        className="absolute w-10 h-10 rounded-full bg-primary transition-all duration-75 flex items-center justify-center"
        style={{
          left: `calc(50% + ${Math.cos((handAngle * Math.PI) / 180) * handLength}px)`,
          top: `calc(50% + ${Math.sin((handAngle * Math.PI) / 180) * handLength}px)`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <span className="text-sm font-medium text-on-primary">{mode === 'hour' ? (value === 0 ? 12 : value) : value}</span>
      </div>

      {/* Numbers around the dial */}
      {numbers.map((num, index) => {
        const angle = (index / 12) * 360 - 90;
        const radius = 95;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        const isSelected = mode === 'hour' ? value === num || (value === 0 && num === 12) : value === num;

        return (
          <button
            key={num}
            type="button"
            className={cn(
              'absolute w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors',
              isSelected ? 'text-transparent' : 'text-on-surface hover:bg-on-surface/8'
            )}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onChange(num);
            }}
          >
            {num === 0 ? '00' : num}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Time Display Header - M3 Style
// ============================================================================

interface TimeDisplayProps {
  hour: number;
  minute: number;
  period: Period;
  mode: TimeMode;
  onModeChange: (mode: TimeMode) => void;
  onPeriodChange: (period: Period) => void;
  inputMode: InputMode;
  onHourChange?: (hour: number) => void;
  onMinuteChange?: (minute: number) => void;
}

function TimeDisplay({ hour, minute, period, mode, onModeChange, onPeriodChange, inputMode, onHourChange, onMinuteChange }: TimeDisplayProps) {
  const { t } = useTranslation();
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

  const handleHourInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '');
      let num = parseInt(val, 10);
      if (isNaN(num)) num = 12;
      if (num > 12) num = 12;
      if (num < 1) num = 1;
      onHourChange?.(num);
    },
    [onHourChange]
  );

  const handleMinuteInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '');
      let num = parseInt(val, 10);
      if (isNaN(num)) num = 0;
      if (num > 59) num = 59;
      if (num < 0) num = 0;
      onMinuteChange?.(num);
    },
    [onMinuteChange]
  );

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Hour */}
      {inputMode === 'keyboard' ? (
        <div className="flex flex-col items-center">
          <input
            ref={hourInputRef}
            type="text"
            inputMode="numeric"
            value={String(hour).padStart(2, '0')}
            onChange={handleHourInput}
            className={cn(
              'w-24 h-20 text-center text-5xl font-normal rounded-xl transition-colors outline-none',
              'bg-primary-container/60 text-on-surface',
              'focus:ring-2 focus:ring-primary'
            )}
            maxLength={2}
          />
          <span className="text-xs text-on-surface-variant mt-1.5">{t('common.hour')}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onModeChange('hour')}
          className={cn(
            'px-4 py-2 text-5xl font-normal rounded-xl transition-colors',
            mode === 'hour' ? 'bg-primary-container/60 text-on-surface' : 'text-on-surface-variant/70 hover:bg-on-surface/8'
          )}
        >
          {String(hour).padStart(2, '0')}
        </button>
      )}

      {/* Separator */}
      <span className="text-5xl font-normal text-on-surface self-start mt-2">:</span>

      {/* Minute */}
      {inputMode === 'keyboard' ? (
        <div className="flex flex-col items-center">
          <input
            ref={minuteInputRef}
            type="text"
            inputMode="numeric"
            value={String(minute).padStart(2, '0')}
            onChange={handleMinuteInput}
            className={cn(
              'w-24 h-20 text-center text-5xl font-normal rounded-xl transition-colors outline-none',
              'bg-surface-container text-on-surface',
              'focus:ring-2 focus:ring-primary'
            )}
            maxLength={2}
          />
          <span className="text-xs text-on-surface-variant mt-1.5">{t('common.minute')}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onModeChange('minute')}
          className={cn(
            'px-4 py-2 text-5xl font-normal rounded-xl transition-colors',
            mode === 'minute' ? 'bg-primary-container/60 text-on-surface' : 'text-on-surface-variant/70 hover:bg-on-surface/8'
          )}
        >
          {String(minute).padStart(2, '0')}
        </button>
      )}

      {/* AM/PM Toggle */}
      <div className="flex flex-col ml-2 border-2 border-outline-variant/40 rounded-lg overflow-hidden h-20">
        <button
          type="button"
          onClick={() => onPeriodChange('AM')}
          className={cn(
            'flex-1 px-3 text-sm font-medium transition-colors min-w-11',
            period === 'AM' ? 'bg-tertiary-container text-on-tertiary-container' : 'text-on-surface-variant hover:bg-on-surface/8'
          )}
        >
          AM
        </button>
        <div className="h-px bg-outline-variant/40" />
        <button
          type="button"
          onClick={() => onPeriodChange('PM')}
          className={cn(
            'flex-1 px-3 text-sm font-medium transition-colors min-w-11',
            period === 'PM' ? 'bg-tertiary-container text-on-tertiary-container' : 'text-on-surface-variant hover:bg-on-surface/8'
          )}
        >
          PM
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// TimePicker Dialog - M3 Modal Style
// ============================================================================

interface TimePickerDialogProps {
  open: boolean;
  onClose: () => void;
  value?: string;
  onChange: (time: string) => void;
  title?: string;
}

function TimePickerDialog({ open, onClose, value, onChange, title }: TimePickerDialogProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<TimeMode>('hour');
  const [inputMode, setInputMode] = useState<InputMode>('dial');
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<Period>('AM');
  const prevOpenRef = useRef(open);

  // Reset state when dialog opens
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const parsed = parseTime(value);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initializing dialog state on open transition
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
      setMode('hour');
      setInputMode('dial');
    }
    prevOpenRef.current = open;
  }, [open, value]);

  const handleDialChange = useCallback(
    (val: number) => {
      if (mode === 'hour') {
        setHour(val);
        // Auto-switch to minute after selecting hour
        setTimeout(() => setMode('minute'), 300);
      } else {
        setMinute(val);
      }
    },
    [mode]
  );

  const handleConfirm = useCallback(() => {
    const time24 = formatTime24(hour, minute, period);
    onChange(time24);
    onClose();
  }, [hour, minute, period, onChange, onClose]);

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
          'relative rounded-3xl overflow-hidden min-w-80',
          'bg-surface-container-high shadow-xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-5">
          <p className="text-sm text-on-surface-variant mb-5">{title || t('timePicker.selectTime')}</p>

          <TimeDisplay
            hour={hour}
            minute={minute}
            period={period}
            mode={mode}
            onModeChange={setMode}
            onPeriodChange={setPeriod}
            inputMode={inputMode}
            onHourChange={setHour}
            onMinuteChange={setMinute}
          />
        </div>

        {/* Clock dial (only in dial mode) */}
        {inputMode === 'dial' && (
          <div className="flex justify-center px-6 pb-4">
            <ClockDial mode={mode} value={mode === 'hour' ? hour : minute} onChange={handleDialChange} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Toggle input mode button */}
          <IconButton
            variant="standard"
            size="default"
            onClick={() => setInputMode((prev) => (prev === 'dial' ? 'keyboard' : 'dial'))}
            aria-label={inputMode === 'dial' ? t('timePicker.switchToKeyboard') : t('timePicker.switchToDial')}
          >
            {inputMode === 'dial' ? <Keyboard className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </IconButton>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="text" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button variant="text" onClick={handleConfirm}>
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================================================
// TimePicker Input Component
// ============================================================================

export function TimePicker({
  value,
  onChange,
  placeholder,
  use24Hour = false,
  disabled = false,
  label,
  error,
  helperText,
  className,
}: TimePickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value ? formatDisplayTime(value, use24Hour) : '';
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
        <Clock className="h-5 w-5 text-on-surface-variant shrink-0" />
        <span className={cn('flex-1 text-sm truncate', displayValue ? 'text-on-surface' : 'text-on-surface-variant/40')}>
          {displayValue || placeholder || t('timePicker.selectTime')}
        </span>
        {value && !disabled && (
          <IconButton variant="standard" size="sm" className="h-6 w-6 shrink-0" onClick={handleClear} aria-label={t('timePicker.clearTime')}>
            <span className="text-xs">✕</span>
          </IconButton>
        )}
      </button>

      {(helperText || error) && <p className={cn('mt-2 text-sm', hasError ? 'text-error' : 'text-on-surface-variant/70')}>{error || helperText}</p>}

      <TimePickerDialog open={isOpen} onClose={() => setIsOpen(false)} value={value} onChange={onChange} title={t('timePicker.selectTime')} />
    </div>
  );
}

export type { TimeMode, Period, InputMode };
