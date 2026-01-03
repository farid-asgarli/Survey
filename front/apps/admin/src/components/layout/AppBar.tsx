import { type HTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { IconButton } from '@/components/ui';

interface AppBarProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  elevated?: boolean;
}

export function AppBar({ className, title, leading, trailing, showMenuButton = false, onMenuClick, elevated = false, children, ...props }: AppBarProps) {
  const { t } = useTranslation();
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-20 items-center gap-4 px-4',
        'bg-surface-container-lowest/90 backdrop-blur-lg transition-all duration-200',
        elevated && 'border-b border-outline-variant/25',
        className
      )}
      {...props}
    >
      {/* Leading section */}
      <div className='flex items-center gap-2'>
        {showMenuButton && (
          <IconButton aria-label={t('common.openMenu')} variant='standard' onClick={onMenuClick}>
            <Menu className='h-6 w-6' />
          </IconButton>
        )}
        {leading}
      </div>

      {/* Title */}
      {title && <h1 className='text-xl font-bold text-on-surface truncate'>{title}</h1>}

      {/* Children (flexible content) */}
      <div className='flex-1'>{children}</div>

      {/* Trailing section */}
      {trailing && <div className='flex items-center gap-1'>{trailing}</div>}
    </header>
  );
}
