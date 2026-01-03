import { useState, useLayoutEffect, useEffect, useRef, useCallback, type ReactNode, type HTMLAttributes, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '..';

interface MenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
  className?: string;
}

interface MenuItemProps extends HTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

interface MenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

function Menu({ trigger, children, align = 'start', side = 'bottom', className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position
  const calculatePosition = useCallback(
    (menuHeight: number = 200) => {
      if (!triggerRef.current) return null;

      const rect = triggerRef.current.getBoundingClientRect();

      let top = side === 'bottom' ? rect.bottom + 6 : rect.top - menuHeight - 6;
      let left = rect.left;

      if (align === 'center') {
        left = rect.left + rect.width / 2;
      } else if (align === 'end') {
        left = rect.right;
      }

      // Adjust if menu would go off screen
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 6;
      }
      if (top < 0) {
        top = rect.bottom + 6;
      }

      return { top, left };
    },
    [align, side]
  );

  // Calculate position synchronously when opening
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      setPosition(calculatePosition());
    } else {
      setPosition(null);
    }
    setOpen(!open);
  };

  // Update position after menu renders (to get actual height)
  useLayoutEffect(() => {
    if (open && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight;
      setPosition(calculatePosition(menuHeight));
    }
  }, [open, calculatePosition]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const alignClasses = {
    start: 'origin-top-left',
    center: 'origin-top -translate-x-1/2',
    end: 'origin-top-right -translate-x-full',
  };

  return (
    <>
      <div ref={triggerRef} onClick={handleToggle} className="inline-flex cursor-pointer">
        {trigger}
      </div>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            className={cn(
              'fixed z-50 min-w-52 py-2 rounded-2xl',
              'bg-surface-container-lowest border border-outline-variant/20',
              'shadow-xl shadow-scrim/15',
              'animate-in fade-in zoom-in-95 duration-150',
              alignClasses[align],
              className
            )}
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {/* Pass close function to children */}
            <div
              onClick={() => {
                setOpen(false);
                setPosition(null);
              }}
            >
              {children}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function MenuItem({ className, icon, destructive = false, disabled = false, ref, children, ...props }: MenuItemProps) {
  return (
    <button
      type="button"
      ref={ref}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 mx-1.5 text-sm text-left transition-colors rounded-xl',
        'focus-visible:outline-none focus-visible:bg-surface-container-high',
        destructive ? 'text-error hover:bg-error/8' : 'text-on-surface hover:bg-surface-container-high',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{ width: 'calc(100% - 12px)' }}
      {...props}
    >
      {icon && <span className="shrink-0 w-5 h-5 [&>svg]:w-5 [&>svg]:h-5">{icon}</span>}
      <span className="flex-1 font-medium">{children}</span>
    </button>
  );
}

function MenuSeparator({ className, ref, ...props }: MenuSeparatorProps) {
  return <div ref={ref} className={cn('my-2 h-px bg-outline-variant/30 mx-3', className)} {...props} />;
}

export { Menu, MenuItem, MenuSeparator };
