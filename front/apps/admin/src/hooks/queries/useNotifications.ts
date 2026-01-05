// React Query hooks for Notifications operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services';
import type { NotificationsResponse, NotificationCount } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys
export const notificationKeys = createExtendedQueryKeys('notifications', (base) => ({
  unreadCount: () => [...base.all, 'unread-count'] as const,
  paginated: (params: { pageNumber: number; pageSize: number; includeRead: boolean }) => [...base.all, 'list', params] as const,
}));

/**
 * Hook to fetch notifications with pagination
 */
export function useNotifications(pageNumber = 1, pageSize = 20, includeRead = true, enabled = true) {
  return useQuery({
    queryKey: notificationKeys.paginated({ pageNumber, pageSize, includeRead }),
    queryFn: () => notificationsApi.getNotifications(pageNumber, pageSize, includeRead),
    staleTime: STALE_TIMES.SHORT,
    enabled,
  });
}

/**
 * Hook to fetch unread notification count
 * This is polled frequently to keep the badge updated
 */
export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: STALE_TIMES.SHORT,
    // Poll every 30 seconds when the tab is focused
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    enabled,
  });
}

/**
 * Hook to mark a single notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() });

      // Snapshot the previous count
      const previousCount = queryClient.getQueryData<NotificationCount>(notificationKeys.unreadCount());

      // Optimistically update the count
      if (previousCount && previousCount.unreadCount > 0) {
        queryClient.setQueryData<NotificationCount>(notificationKeys.unreadCount(), {
          ...previousCount,
          unreadCount: previousCount.unreadCount - 1,
        });
      }

      // Update the notification in any cached lists
      queryClient.setQueriesData<NotificationsResponse>({ queryKey: [...notificationKeys.all, 'list'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
        };
      });

      return { previousCount };
    },
    onError: (_err, _notificationId, context) => {
      // Rollback on error
      if (context?.previousCount) {
        queryClient.setQueryData<NotificationCount>(notificationKeys.unreadCount(), context.previousCount);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Snapshot the previous count
      const previousCount = queryClient.getQueryData<NotificationCount>(notificationKeys.unreadCount());

      // Optimistically set count to 0
      if (previousCount) {
        queryClient.setQueryData<NotificationCount>(notificationKeys.unreadCount(), {
          ...previousCount,
          unreadCount: 0,
        });
      }

      // Mark all notifications in cached lists as read
      queryClient.setQueriesData<NotificationsResponse>({ queryKey: [...notificationKeys.all, 'list'] }, (old) => {
        if (!old) return old;
        const now = new Date().toISOString();
        return {
          ...old,
          items: old.items.map((n) => ({ ...n, isRead: true, readAt: now })),
        };
      });

      return { previousCount };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCount) {
        queryClient.setQueryData<NotificationCount>(notificationKeys.unreadCount(), context.previousCount);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
