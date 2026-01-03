import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@survey/ui-primitives';

interface OfflineIndicatorProps {
  /** Position of the indicator */
  position?: 'top' | 'bottom';
  /** Whether to show a reconnect button */
  showReconnectButton?: boolean;
  /** Custom offline message */
  offlineMessage?: string;
  /** Custom online message (shown briefly when reconnecting) */
  onlineMessage?: string;
  /** Duration to show the online message (ms) */
  onlineDuration?: number;
  /** Whether the indicator is dismissible when offline */
  dismissible?: boolean;
  /** Callback when connection status changes */
  onStatusChange?: (isOnline: boolean) => void;
  /** Additional class names */
  className?: string;
}

function OfflineIndicator({
  position = 'bottom',
  showReconnectButton = true,
  offlineMessage,
  onlineMessage,
  onlineDuration = 3000,
  dismissible = false,
  onStatusChange,
  className,
}: OfflineIndicatorProps) {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setIsDismissed(false);
      onStatusChange?.(true);

      // Hide online toast after duration
      setTimeout(() => {
        setShowOnlineToast(false);
      }, onlineDuration);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
      setIsDismissed(false);
      onStatusChange?.(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onlineDuration, onStatusChange]);

  // Manual reconnect check
  const handleReconnect = useCallback(async () => {
    setIsChecking(true);
    try {
      // Try to fetch a small resource to verify connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-store',
      });
      if (response.ok) {
        setIsOnline(true);
        setShowOnlineToast(true);
        onStatusChange?.(true);
        setTimeout(() => setShowOnlineToast(false), onlineDuration);
      }
    } catch {
      // Still offline
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, [onlineDuration, onStatusChange]);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Don't render if online and not showing toast, or if dismissed
  if ((isOnline && !showOnlineToast) || isDismissed) {
    return null;
  }

  const isShowingOnline = isOnline && showOnlineToast;

  return (
    <div
      className={cn('fixed left-0 right-0 z-50 flex justify-center px-4 pointer-events-none', position === 'top' ? 'top-4' : 'bottom-4', className)}
      role="alert"
      aria-live="polite"
    >
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 shadow-lg pointer-events-auto max-w-md w-full',
          'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
          isShowingOnline
            ? 'bg-success-container border-success/30 text-on-success-container'
            : 'bg-warning-container border-warning/30 text-on-warning-container'
        )}
      >
        {/* Icon */}
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', isShowingOnline ? 'bg-success/20' : 'bg-warning/20')}>
          {isShowingOnline ? <Wifi className="h-5 w-5 text-success" /> : <WifiOff className="h-5 w-5 text-warning" />}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {isShowingOnline ? onlineMessage || t('offline.backOnline') : offlineMessage || t('offline.message')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isShowingOnline && showReconnectButton && (
            <Button
              variant="text"
              size="sm"
              onClick={handleReconnect}
              disabled={isChecking}
              className="text-on-warning-container hover:bg-warning/20"
            >
              <RefreshCw className={cn('h-4 w-4', isChecking && 'animate-spin')} />
              <span className="sr-only sm:not-sr-only sm:ml-1">{t('offline.retry')}</span>
            </Button>
          )}
          {dismissible && !isShowingOnline && (
            <Button variant="text" size="icon-sm" onClick={handleDismiss} className="text-on-warning-container hover:bg-warning/20">
              <X className="h-4 w-4" />
              <span className="sr-only">{t('offline.dismiss')}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for checking online status
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Wrapper component that shows children only when online
interface OnlineOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function OnlineOnly({ children, fallback }: OnlineOnlyProps) {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

export { OfflineIndicator, useOnlineStatus, OnlineOnly };
