// DistributionsPage - Manage survey links and email distributions

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Mail, Link2 } from 'lucide-react';
import { renderPageIcon } from '@/config';
import {
  Button,
  Input,
  Skeleton,
  FAB,
  Tabs,
  TabsList,
  TabsTrigger,
  Select,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  EmptyState,
} from '@/components/ui';
import { Layout, PageHeader } from '@/components/layout';
import { LinksPanel, CreateDistributionDialog, DistributionStats } from '@/components/features/distributions';
import { useSurveysList } from '@/hooks/queries/useSurveys';
import { useDistributions } from '@/hooks/queries/useDistributions';
import { DistributionCard } from './components/DistributionCard';
import { useDistributionsPage } from './hooks/useDistributionsPage';
import { mockDistributions } from './constants';
import type { StatusFilter, DistributionTab } from './types';

export function DistributionsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(searchParams.get('surveyId') || '');

  // Fetch surveys for the dropdown
  const { data: surveysData, isLoading: surveysLoading } = useSurveysList({ status: 'all' });
  const surveys = surveysData?.items ?? [];

  // Fetch distributions for selected survey - fallback to mock if API unavailable
  const { data: apiDistributions, isLoading: distributionsLoading } = useDistributions(selectedSurveyId || undefined);
  const distributions = apiDistributions ?? (selectedSurveyId ? mockDistributions : []);

  const selectedSurvey = surveys.find((s) => s.id === selectedSurveyId);

  // Custom hook for page state and handlers
  const {
    activeTab,
    statusFilter,
    searchQuery,
    createDialog,
    statsDrawer,
    setStatusFilter,
    setSearchQuery,
    handleTabChange,
    handleViewDistribution,
    handleSendDistribution,
    handleCancelDistribution,
    handleDeleteDistribution,
    sendDistribution,
    ConfirmDialog,
  } = useDistributionsPage(selectedSurveyId);

  // Update URL when survey changes
  const handleSurveyChange = useCallback(
    (surveyId: string) => {
      setSelectedSurveyId(surveyId);
      const newParams = new URLSearchParams(searchParams);
      if (surveyId) {
        newParams.set('surveyId', surveyId);
      } else {
        newParams.delete('surveyId');
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Filter distributions
  const filteredDistributions = distributions.filter((dist) => {
    if (statusFilter !== 'all' && dist.status !== statusFilter) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return dist.subject.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <PageHeader icon={renderPageIcon('distributions')} title={t('navigation.distributions')} description={t('distributions.description')} />

        {/* Distribution Type Tabs & Survey Selector - unified header row */}
        <div className="px-4 md:px-6 py-3 flex flex-wrap items-center gap-4 border-b border-outline-variant/30">
          <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as DistributionTab)} variant="segmented">
            <TabsList>
              <TabsTrigger value="links" className="gap-2">
                <Link2 className="w-4 h-4" />
                {t('distributions.surveyLinks')}
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="w-4 h-4" />
                {t('distributions.emailCampaigns')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Survey Selector - always visible, right of tabs */}
          <div className="w-64 sm:ml-auto">
            <Select
              placeholder={surveysLoading ? t('common.loading') : t('distributions.selectSurvey')}
              options={surveys.map((s) => ({
                value: s.id,
                label: `${s.title} (${s.status})`,
              }))}
              value={selectedSurveyId}
              onChange={handleSurveyChange}
              disabled={surveysLoading}
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'links' && (
          <div className="flex-1 overflow-auto">
            {/* Links Panel or Empty State */}
            <div className="p-4 md:p-6">
              {selectedSurveyId ? (
                <LinksPanel surveyId={selectedSurveyId} surveyTitle={selectedSurvey?.title} />
              ) : (
                <EmptyState
                  icon={<Link2 className="h-7 w-7" />}
                  title={t('distributions.selectASurvey')}
                  description={t('distributions.selectSurveyForLinks')}
                  iconVariant="default"
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <>
            {/* Filters toolbar - only shown when survey is selected */}
            {selectedSurveyId && (
              <div className="px-4 md:px-6 py-3 border-b border-outline-variant/30">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filters */}
                  <Tabs value={String(statusFilter)} onValueChange={(v) => setStatusFilter(v as StatusFilter)} variant="segmented">
                    <TabsList>
                      <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
                      <TabsTrigger value="Draft">{t('distributions.statusDraft')}</TabsTrigger>
                      <TabsTrigger value="Scheduled">{t('distributions.statusScheduled')}</TabsTrigger>
                      <TabsTrigger value="Sent">{t('distributions.statusSent')}</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Right side: Search + Count + Action */}
                  <div className="flex items-center gap-3 ml-auto">
                    <Input
                      placeholder={t('distributions.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      startIcon={<Search className="h-4 w-4" />}
                      className="w-44"
                    />

                    <Button onClick={() => createDialog.open()} className="hidden sm:flex">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('distributions.newDistribution')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Email Content */}
            <div className="flex-1 overflow-auto p-4 md:px-6 md:pb-6">
              {!selectedSurveyId ? (
                <EmptyState
                  icon={<Mail className="h-7 w-7" />}
                  title={t('distributions.selectASurvey')}
                  description={t('distributions.selectSurveyForEmail')}
                  iconVariant="default"
                  size="full"
                />
              ) : distributionsLoading ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-2xl" />
                  ))}
                </div>
              ) : filteredDistributions.length === 0 ? (
                <EmptyState
                  icon={<Mail className="h-7 w-7" />}
                  title={searchQuery || statusFilter !== 'all' ? t('distributions.noFound') : t('distributions.createFirst')}
                  description={searchQuery || statusFilter !== 'all' ? t('distributions.tryAdjustFilters') : t('distributions.createFirstDesc')}
                  iconVariant={searchQuery || statusFilter !== 'all' ? 'default' : 'primary'}
                  size="full"
                  action={
                    !searchQuery && statusFilter === 'all'
                      ? {
                          label: t('distributions.newDistribution'),
                          onClick: () => createDialog.open(),
                          icon: <Plus className="h-4 w-4" />,
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDistributions.map((dist) => (
                    <DistributionCard
                      key={dist.id}
                      distribution={dist}
                      onView={() => handleViewDistribution(dist)}
                      onSend={() => handleSendDistribution(dist.id)}
                      onCancel={() => handleCancelDistribution(dist.id)}
                      onDelete={() => handleDeleteDistribution(dist.id)}
                      isSending={sendDistribution.isPending}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* FAB for mobile */}
            {selectedSurveyId && <FAB icon={<Plus className="h-6 w-6" />} className="sm:hidden" onClick={() => createDialog.open()} />}
          </>
        )}
      </div>

      {/* Create Distribution Dialog */}
      <CreateDistributionDialog
        surveyId={selectedSurveyId}
        surveyTitle={selectedSurvey?.title}
        open={createDialog.isOpen}
        onOpenChange={createDialog.setOpen}
      />

      {/* Distribution Stats Drawer */}
      <Drawer open={statsDrawer.isOpen} onOpenChange={statsDrawer.setOpen} side="right">
        <DrawerContent className="max-w-2xl!">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {t('distributions.distributionDetails')}
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            {statsDrawer.selectedItem && selectedSurveyId && (
              <DistributionStats surveyId={selectedSurveyId} distributionId={statsDrawer.selectedItem.id} />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </Layout>
  );
}
