import { type HTMLAttributes, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Bell, CheckCheck, ExternalLink, MailOpen } from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { Badge } from '@survey/ui-primitives';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDateTimeFormatter,
} from '@/hooks';
import type { Notification as NotificationModel } from '@/types';
import { NotificationType, getNotificationTypeLabel } from '@/types/enums';

// Pre-defined icon components for notification types
function WorkspaceInvitationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3z" />
    </svg>
  );
}

function NewResponseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
    </svg>
  );
}

function SurveyPublishedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}

function MemberJoinedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

// Icon mapping for notification types - uses pre-defined components
const notificationIconMap: Record<number, React.ComponentType<{ className?: string }>> = {
  [NotificationType.WorkspaceInvitation]: WorkspaceInvitationIcon,
  [NotificationType.NewResponse]: NewResponseIcon,
  [NotificationType.SurveyPublished]: SurveyPublishedIcon,
  [NotificationType.MemberJoined]: MemberJoinedIcon,
};

// Get badge variant based on notification type
function getNotificationBadgeVariant(type: number): 'default' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'success' | 'info' {
  switch (type) {
    case NotificationType.WorkspaceInvitation:
      return 'default';
    case NotificationType.NewResponse:
      return 'success';
    case NotificationType.SurveyPublished:
      return 'info';
    case NotificationType.SurveyMilestone:
      return 'success';
    case NotificationType.MemberJoined:
    case NotificationType.MemberLeft:
      return 'secondary';
    case NotificationType.Security:
      return 'error';
    case NotificationType.LinkExpiration:
      return 'warning';
    default:
      return 'tertiary';
  }
}

interface NotificationItemProps {
  notification: NotificationModel;
  onMarkAsRead: (id: string) => void;
  onNavigate: (url: string) => void;
  formatTime: (date: string) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function NotificationItem({ notification, onMarkAsRead, onNavigate, formatTime, t }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      onNavigate(notification.actionUrl);
    }
  };

  // Get the icon component outside of JSX to avoid React lint issues
  const IconComponent = notificationIconMap[notification.type] || Bell;

  // Translate title and message, passing metadata as interpolation variables
  const metadata = notification.metadata ?? {};
  const translatedTitle = t(notification.title, metadata);
  const translatedMessage = t(notification.message, metadata);
  const translatedActionLabel = notification.actionLabel ? t(notification.actionLabel, metadata) : undefined;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left',
        'transition-colors duration-200',
        notification.isRead ? 'bg-transparent hover:bg-on-surface/5' : 'bg-primary-container/10 hover:bg-primary-container/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          notification.isRead ? 'bg-surface-container-high' : 'bg-primary-container'
        )}
      >
        <IconComponent className={cn('w-5 h-5', notification.isRead ? 'text-on-surface-variant' : 'text-on-primary-container')} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium truncate', notification.isRead ? 'text-on-surface-variant' : 'text-on-surface')}>{translatedTitle}</p>
          {!notification.isRead && <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />}
        </div>
        <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{translatedMessage}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant={getNotificationBadgeVariant(notification.type)} size="sm">
            {getNotificationTypeLabel(notification.type)}
          </Badge>
          <span className="text-[10px] text-on-surface-variant">{formatTime(notification.createdAt)}</span>
        </div>
        {notification.actionUrl && translatedActionLabel && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-primary">
            <ExternalLink className="w-3 h-3" />
            <span>{translatedActionLabel}</span>
          </div>
        )}
      </div>
    </button>
  );
}

function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

interface NotificationCenterProps extends HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
}

export function NotificationCenter({ className, ...props }: NotificationCenterProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { formatRelativeTime } = useDateTimeFormatter();

  // Queries
  const { data: countData } = useUnreadNotificationCount();
  const { data: notificationsData, isLoading } = useNotifications(1, 10, true, open);

  // Mutations
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = countData?.unreadCount ?? 0;
  const notifications = notificationsData?.items ?? [];

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleNavigate = (url: string) => {
    setOpen(false);
    // Check if it's an internal URL
    if (url.startsWith('/')) {
      navigate(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/settings?tab=notifications');
  };

  return (
    <div className={cn('relative', className)} {...props}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        aria-label={t('notifications.title')}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'relative p-2.5 rounded-full',
          'hover:bg-surface-container-high transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          open && 'bg-surface-container-high'
        )}
      >
        <Bell className="h-5 w-5 text-on-surface-variant" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute flex items-center justify-center',
              'bg-error text-on-error text-[10px] font-bold',
              unreadCount > 9 ? 'top-1 right-0 min-w-5 h-5 px-1 rounded-full' : 'top-2 right-2 w-2 h-2 rounded-full'
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount > 0 && unreadCount <= 9 ? '' : ''}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t('notifications.title')}
          className={cn(
            'absolute top-full right-0 mt-2 w-96 max-h-120 rounded-3xl z-50',
            'bg-surface-container border-2 border-outline-variant',
            'flex flex-col overflow-hidden',
            'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/50">
            <h2 className="text-base font-semibold text-on-surface">{t('notifications.title')}</h2>
            {unreadCount > 0 && (
              <Button variant="text" size="sm" onClick={handleMarkAllAsRead} disabled={markAllAsRead.isPending}>
                <CheckCheck className="w-4 h-4 mr-1.5" />
                {t('notifications.markAllAsRead')}
              </Button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="divide-y divide-outline-variant/30">
                {[...Array(3)].map((_, i) => (
                  <NotificationItemSkeleton key={i} />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                  <MailOpen className="w-8 h-8 text-on-surface-variant" />
                </div>
                <p className="text-sm font-medium text-on-surface">{t('notifications.empty.title')}</p>
                <p className="text-xs text-on-surface-variant mt-1">{t('notifications.empty.description')}</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onNavigate={handleNavigate}
                    formatTime={formatRelativeTime}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-outline-variant/50 p-2">
              <Button variant="text" size="sm" className="w-full" onClick={handleViewAll}>
                {t('notifications.viewAll')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
