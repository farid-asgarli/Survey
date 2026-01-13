import { type TextareaHTMLAttributes, type Ref, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '..';

const textareaVariants = cva(
  'flex min-h-[120px] w-full bg-transparent text-on-surface ring-offset-surface transition-all duration-200 placeholder:text-on-surface-variant/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        // Outlined - clean border with focus state
        outlined: 'border-2 border-outline-variant/50 rounded-2xl bg-surface-container-lowest focus-visible:border-primary hover:border-outline-variant',
        // Filled - container background
        filled: 'bg-surface-container border-2 border-transparent rounded-2xl focus-visible:border-primary hover:bg-surface-container-high',
        // Soft - very subtle appearance
        soft: 'bg-surface-container/60 border-2 border-transparent rounded-2xl focus-visible:bg-surface-container focus-visible:border-primary/40',
      },
      size: {
        default: 'px-4 py-3 text-sm',
        sm: 'px-3.5 py-2 text-sm',
        lg: 'px-5 py-4 text-base rounded-[1.25rem]',
      },
    },
    defaultVariants: {
      variant: 'outlined',
      size: 'default',
    },
  }
);

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>, VariantProps<typeof textareaVariants> {
  ref?: Ref<HTMLTextAreaElement>;
  label?: string;
  helperText?: string;
  error?: string;
}

function Textarea({ className, variant, size, label, helperText, error, ref, id, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const hasError = !!error;

  return (
    <div className='w-full'>
      {label && (
        <label htmlFor={textareaId} className={cn('block text-sm font-semibold mb-2', hasError ? 'text-error' : 'text-on-surface')}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(textareaVariants({ variant, size }), hasError && 'border-error focus-visible:border-error', className)}
        ref={ref}
        {...props}
      />
      {(helperText || error) && <p className={cn('mt-2 text-sm', hasError ? 'text-error' : 'text-on-surface-variant/70')}>{error || helperText}</p>}
    </div>
  );
}

export { Textarea, textareaVariants };
