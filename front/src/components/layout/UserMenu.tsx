import { type HTMLAttributes, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useUser, useAuthStore } from '@/stores';
import { Avatar, Divider, LanguageSwitcher } from '@/components/ui';
import { User, Settings, LogOut, Palette } from 'lucide-react';
import { useUserAvatarUrl } from '@/hooks';

interface UserMenuProps extends HTMLAttributes<HTMLDivElement> {
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

export function UserMenu({ className, onSettingsClick, onLogoutClick, ...props }: UserMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const user = useUser();
  const logout = useAuthStore((s) => s.logout);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    onLogoutClick?.();
  };

  // Get the resolved avatar URL (3D avatar or Azure AD photo)
  const avatarUrl = useUserAvatarUrl();

  if (!user) return null;

  const userInitials = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.charAt(0).toUpperCase();

  return (
    <div className={cn('relative', className)} {...props}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        aria-label={t('a11y.userMenu')}
        aria-expanded={open}
        aria-haspopup='menu'
        className={cn(
          'flex items-center gap-2 p-1.5 rounded-full',
          'hover:bg-on-surface/8 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
        )}
      >
        <Avatar src={avatarUrl} fallback={userInitials} size='default' />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={cn(
            'absolute top-full right-0 mt-2 w-64 py-2 rounded-2xl z-50',
            'bg-surface-container border-2 border-outline-variant',
            'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150'
          )}
        >
          {/* User info */}
          <div className='px-4 py-3'>
            <div className='flex items-center gap-3'>
              <Avatar src={avatarUrl} fallback={userInitials} size='lg' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-on-surface truncate'>
                  {user.firstName || ''} {user.lastName || ''}
                </p>
                <p className='text-xs text-on-surface-variant truncate'>{user.email}</p>
              </div>
            </div>
          </div>

          <Divider className='my-1' />

          {/* Menu items */}
          <div className='py-1'>
            <button
              onClick={() => {
                setOpen(false);
                onSettingsClick?.();
              }}
              className={cn('flex w-full items-center gap-3 px-4 py-2.5', 'text-on-surface hover:bg-on-surface/5 transition-colors')}
            >
              <User className='h-5 w-5 text-on-surface-variant' />
              <span className='text-sm'>{t('navigation.profile')}</span>
            </button>

            <button
              onClick={() => {
                setOpen(false);
                onSettingsClick?.();
              }}
              className={cn('flex w-full items-center gap-3 px-4 py-2.5', 'text-on-surface hover:bg-on-surface/5 transition-colors')}
            >
              <Settings className='h-5 w-5 text-on-surface-variant' />
              <span className='text-sm'>{t('navigation.settings')}</span>
            </button>

            <button
              onClick={() => setOpen(false)}
              className={cn('flex w-full items-center gap-3 px-4 py-2.5', 'text-on-surface hover:bg-on-surface/5 transition-colors')}
            >
              <Palette className='h-5 w-5 text-on-surface-variant' />
              <span className='text-sm'>{t('navigation.appearance')}</span>
            </button>

            {/* Language Switcher */}
            <div className='px-4 py-2.5'>
              <LanguageSwitcher variant='default' />
            </div>
          </div>

          <Divider className='my-1' />

          {/* Logout */}
          <div className='py-1'>
            <button onClick={handleLogout} className={cn('flex w-full items-center gap-3 px-4 py-2.5', 'text-error hover:bg-error/5 transition-colors')}>
              <LogOut className='h-5 w-5' />
              <span className='text-sm'>{t('auth.signOut')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
