import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
import { useViewTransitionNavigate } from '@/hooks';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, EmptyState } from '@/components/ui';
import { Building2, ArrowLeft, Settings, Users, CreditCard, Plug } from 'lucide-react';
import { MembersManagement } from '@/components/features/namespaces';
import { useNamespaceDetail } from '@/hooks';
import { useAuthStore } from '@/stores';
import { GeneralSettings, BillingSettings, IntegrationsSettings, DangerZone } from './sections';

export function NamespaceSettingsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useViewTransitionNavigate();
  const [activeTab, setActiveTab] = useState('general');

  const { data: namespace, isLoading, error } = useNamespaceDetail(id);
  const currentUser = useAuthStore((s) => s.user);

  const isOwner = namespace?.ownerId === currentUser?.id;

  const tabs = [
    { value: 'general', label: t('workspaceSettings.tabs.general'), icon: Settings },
    { value: 'members', label: t('workspaceSettings.tabs.members'), icon: Users },
    { value: 'integrations', label: t('workspaceSettings.tabs.integrations'), icon: Plug },
    { value: 'billing', label: t('workspaceSettings.tabs.billing'), icon: CreditCard },
  ];

  if (error) {
    return (
      <Layout>
        <EmptyState
          icon={<Building2 className="h-7 w-7" />}
          title={t('workspaceSettings.errors.loadFailed')}
          description={t('workspaceSettings.errors.loadFailedDescription')}
          iconVariant="muted"
          size="full"
          action={{
            label: t('workspaceSettings.backToWorkspaces'),
            onClick: () => navigate('/workspaces'),
            variant: 'outline',
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-4">
            <Button variant="text" size="sm" onClick={() => navigate('/workspaces')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container">
              <Building2 className="h-7 w-7 text-on-primary-container" />
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-on-surface">{namespace?.name}</h1>
                  <p className="text-on-surface-variant">{namespace?.slug}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} variant="pills">
              <TabsList className="mb-6">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                {id && <GeneralSettings namespaceId={id} isOwner={isOwner} />}
                {id && namespace && (
                  <DangerZone namespaceId={id} namespaceName={namespace.name} isOwner={isOwner} onDeleted={() => navigate('/workspaces')} />
                )}
              </TabsContent>

              <TabsContent value="members">
                {id && currentUser && <MembersManagement namespaceId={id} currentUserId={currentUser.id} isOwner={isOwner} />}
              </TabsContent>

              <TabsContent value="integrations">{id && <IntegrationsSettings namespaceId={id} isOwner={isOwner} />}</TabsContent>

              <TabsContent value="billing">
                <BillingSettings namespace={namespace} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
