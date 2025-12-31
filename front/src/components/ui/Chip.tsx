import { type HTMLAttributes, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const chipVariants = cva('inline-flex items-center gap-2 font-medium transition-all duration-200 select-none whitespace-nowrap', {
  variants: {
    variant: {
      // Assist chip - subtle background
      assist: 'bg-surface-container border border-outline-variant/40 text-on-surface hover:bg-surface-container-high',
      // Filter chip - toggleable
      filter: 'bg-surface-container-lowest border border-outline-variant/40 text-on-surface hover:bg-surface-container',
      // Filter selected - primary tint
      'filter-selected': 'bg-primary-container/60 text-on-primary-container border border-primary/30',
      // Input chip - for entered values
      input: 'bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high',
      // Suggestion chip
      suggestion:
        'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
      // Success chip - for status like "Complete"
      success: 'bg-success-container/60 text-on-success-container border border-success/20',
      // Warning chip
      warning: 'bg-warning-container/60 text-on-warning-container border border-warning/20',
      // Error chip
      error: 'bg-error-container/60 text-on-error-container border border-error/20',
    },
    size: {
      default: 'h-8 px-4 rounded-full text-sm',
      sm: 'h-6 px-3 text-xs rounded-full',
      lg: 'h-10 px-5 rounded-full text-base',
    },
  },
  defaultVariants: {
    variant: 'assist',
    size: 'default',
  },
});

interface ChipProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof chipVariants> {
  ref?: Ref<HTMLDivElement>;
  icon?: React.ReactNode;
  onRemove?: () => void;
  removeAriaLabel?: string;
  selected?: boolean;
}

function Chip({ className, variant, size, icon, onRemove, removeAriaLabel, selected, ref, children, onClick, ...props }: ChipProps) {
  const { t } = useTranslation();
  const actualVariant = selected && variant === 'filter' ? 'filter-selected' : variant;
  const isClickable = !!onClick;

  return (
    <div
      ref={ref}
      className={cn(chipVariants({ variant: actualVariant, size, className }), isClickable && 'cursor-pointer active:scale-[0.98]')}
      onClick={onClick}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
            }
          : undefined
      }
      {...props}
    >
      {icon && <span className="shrink-0 -ml-0.5">{icon}</span>}
      <span className="truncate flex justify-center items-center">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 p-0.5 rounded-full hover:bg-on-surface/10 -mr-1 transition-colors"
          aria-label={removeAriaLabel || t('a11y.remove')}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export { Chip, chipVariants };
