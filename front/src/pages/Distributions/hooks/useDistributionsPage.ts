/**
 * Custom hook for distribution page state and handlers
 *
 * Manages:
 * - Tab navigation with URL sync
 * - Status filtering and search
 * - Dialog states (create, stats drawer)
 * - Distribution actions (send, cancel, delete) with confirmations
 *
 * @example
 * ```tsx
 * const { activeTab, handleTabChange, handleSendDistribution } = useDistributionsPage(surveyId);
 * ```
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useSendDistribution, useCancelDistribution, useDeleteDistribution } from '@/hooks/queries/useDistributions';
import { useConfirmDialog, useDialogState } from '@/hooks';
import { toast } from '@/components/ui';
import type { EmailDistribution } from '@/types';
import type { StatusFilter, DistributionTab } from '../types';

/** Return type for useDistributionsPage hook */
export interface UseDistributionsPageReturn {
  // State
  activeTab: DistributionTab;
  statusFilter: StatusFilter;
  searchQuery: string;
  createDialog: ReturnType<typeof useDialogState>;
  statsDrawer: ReturnType<typeof useDialogState<EmailDistribution>>;
  // Setters
  setStatusFilter: (filter: StatusFilter) => void;
  setSearchQuery: (query: string) => void;
  // Handlers
  handleTabChange: (tab: DistributionTab) => void;
  handleViewDistribution: (distribution: EmailDistribution) => void;
  handleSendDistribution: (distId: string) => Promise<void>;
  handleCancelDistribution: (distId: string) => Promise<void>;
  handleDeleteDistribution: (distId: string) => Promise<void>;
  // Mutations
  sendDistribution: ReturnType<typeof useSendDistribution>;
  // Confirm Dialog
  ConfirmDialog: ReturnType<typeof useConfirmDialog>['ConfirmDialog'];
}

export function useDistributionsPage(selectedSurveyId: string): UseDistributionsPageReturn {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DistributionTab>(() => (searchParams.get('tab') as DistributionTab) || 'links');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const createDialog = useDialogState();
  const statsDrawer = useDialogState<EmailDistribution>();

  // Mutations
  const sendDistribution = useSendDistribution(selectedSurveyId);
  const cancelDistribution = useCancelDistribution(selectedSurveyId);
  const deleteDistribution = useDeleteDistribution(selectedSurveyId);

  const { ConfirmDialog, confirm } = useConfirmDialog();

  // Update URL when tab changes
  const handleTabChange = useCallback(
    (tab: DistributionTab) => {
      setActiveTab(tab);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', tab);
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleViewDistribution = useCallback(
    (distribution: EmailDistribution) => {
      statsDrawer.open(distribution);
    },
    [statsDrawer]
  );

  const handleSendDistribution = useCallback(
    async (distId: string) => {
      const confirmed = await confirm({
        title: t('distributions.sendDistribution'),
        description: t('distributions.sendConfirm'),
        confirmText: t('distributions.sendNow'),
      });

      if (!confirmed) return;

      try {
        await sendDistribution.mutateAsync(distId);
        toast.success(t('distributions.sendSuccess'));
      } catch (error) {
        // Error is already handled by React Query's onError or global error handler
        // Only show toast if not already handled
        const message = error instanceof Error ? error.message : t('common.unknownError');
        toast.error(t('distributions.sendError'), { description: message });
      }
    },
    [confirm, sendDistribution, t]
  );

  const handleCancelDistribution = useCallback(
    async (distId: string) => {
      const confirmed = await confirm({
        title: t('distributions.cancelDistribution'),
        description: t('distributions.cancelConfirm'),
        confirmText: t('distributions.cancelDistribution'),
        variant: 'destructive',
      });

      if (!confirmed) return;

      try {
        await cancelDistribution.mutateAsync(distId);
        toast.success(t('distributions.cancelSuccess'));
      } catch (error) {
        const message = error instanceof Error ? error.message : t('common.unknownError');
        toast.error(t('distributions.cancelError'), { description: message });
      }
    },
    [confirm, cancelDistribution, t]
  );

  const handleDeleteDistribution = useCallback(
    async (distId: string) => {
      const confirmed = await confirm({
        title: t('distributions.deleteDistribution'),
        description: t('distributions.deleteConfirm'),
        confirmText: t('common.delete'),
        variant: 'destructive',
      });

      if (!confirmed) return;

      try {
        await deleteDistribution.mutateAsync(distId);
        toast.success(t('distributions.deleteSuccess'));
      } catch (error) {
        const message = error instanceof Error ? error.message : t('common.unknownError');
        toast.error(t('distributions.deleteError'), { description: message });
      }
    },
    [confirm, deleteDistribution, t]
  );

  return {
    // State
    activeTab,
    statusFilter,
    searchQuery,
    createDialog,
    statsDrawer,
    // Setters
    setStatusFilter,
    setSearchQuery,
    // Handlers
    handleTabChange,
    handleViewDistribution,
    handleSendDistribution,
    handleCancelDistribution,
    handleDeleteDistribution,
    // Mutations
    sendDistribution,
    // Confirm Dialog
    ConfirmDialog,
  };
}
