// Custom hook for distribution page state and handlers

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useSendDistribution, useCancelDistribution, useDeleteDistribution } from '@/hooks/queries/useDistributions';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { EmailDistribution } from '@/types';
import type { StatusFilter, DistributionTab } from '../types';

export function useDistributionsPage(selectedSurveyId: string) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DistributionTab>((searchParams.get('tab') as DistributionTab) || 'links');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<EmailDistribution | null>(null);
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);

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
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleViewDistribution = useCallback((distribution: EmailDistribution) => {
    setSelectedDistribution(distribution);
    setShowStatsDrawer(true);
  }, []);

  const handleSendDistribution = useCallback(
    async (distId: string) => {
      const confirmed = await confirm({
        title: t('distributions.sendDistribution'),
        description: t('distributions.sendConfirm'),
        confirmText: t('distributions.sendNow'),
      });

      if (confirmed) {
        await sendDistribution.mutateAsync(distId);
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

      if (confirmed) {
        await cancelDistribution.mutateAsync(distId);
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

      if (confirmed) {
        await deleteDistribution.mutateAsync(distId);
      }
    },
    [confirm, deleteDistribution, t]
  );

  return {
    // State
    activeTab,
    statusFilter,
    searchQuery,
    showCreateDialog,
    selectedDistribution,
    showStatsDrawer,
    // Setters
    setStatusFilter,
    setSearchQuery,
    setShowCreateDialog,
    setShowStatsDrawer,
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
