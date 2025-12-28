import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Switch, EmptyState, toast } from '@/components/ui';
import { Key, Copy, RefreshCw, Webhook, Plug, ExternalLink } from 'lucide-react';
import { formatDate } from '@/utils';
import type { ApiKeyData, Integration } from '../types';

interface IntegrationsSettingsProps {
  namespaceId: string;
  isOwner: boolean;
}

export function IntegrationsSettings({ namespaceId: _, isOwner }: IntegrationsSettingsProps) {
  const { t } = useTranslation();
  void _; // Used for type checking, may be needed in future
  const [webhooksEnabled, setWebhooksEnabled] = useState(false);
  const [apiKeys] = useState<ApiKeyData[]>([
    {
      id: '1',
      name: 'Production Key',
      prefix: 'sk_prod_****',
      createdAt: '2024-01-15',
      lastUsedAt: '2024-12-20',
    },
  ]);

  const handleCopyKey = (keyId: string) => {
    void keyId; // Will be used when backend is implemented
    // In production, this would fetch the full key from the backend
    toast.success(t('workspaceSettings.integrations.apiKeys.copied'));
  };

  const handleRegenerateKey = (keyId: string) => {
    void keyId; // Will be used when backend is implemented
    toast.info(t('workspaceSettings.integrations.apiKeys.regenerateComingSoon'));
  };

  const handleCreateKey = () => {
    toast.info(t('workspaceSettings.integrations.apiKeys.createComingSoon'));
  };

  const integrations: Integration[] = [
    {
      id: 'slack',
      name: 'Slack',
      description: t('workspaceSettings.integrations.apps.slack'),
      icon: '💬',
      connected: false,
      comingSoon: true,
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: t('workspaceSettings.integrations.apps.zapier'),
      icon: '⚡',
      connected: false,
      comingSoon: true,
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: t('workspaceSettings.integrations.apps.googleSheets'),
      icon: '📊',
      connected: false,
      comingSoon: true,
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: t('workspaceSettings.integrations.apps.salesforce'),
      icon: '☁️',
      connected: false,
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* API Keys Section */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('workspaceSettings.integrations.apiKeys.title')}
              </CardTitle>
              <CardDescription>{t('workspaceSettings.integrations.apiKeys.description')}</CardDescription>
            </div>
            {isOwner && (
              <Button variant="tonal" size="sm" onClick={handleCreateKey}>
                {t('workspaceSettings.integrations.apiKeys.createKey')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <EmptyState
              icon={<Key className="h-7 w-7" />}
              title={t('workspaceSettings.integrations.apiKeys.emptyTitle')}
              description={t('workspaceSettings.integrations.apiKeys.emptyDescription')}
              iconVariant="primary"
              action={
                isOwner
                  ? {
                      label: t('workspaceSettings.integrations.apiKeys.createKey'),
                      onClick: handleCreateKey,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary-container/60 flex items-center justify-center">
                      <Key className="h-5 w-5 text-on-primary-container" />
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{key.name}</p>
                      <p className="text-sm text-on-surface-variant font-mono">{key.prefix}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {key.lastUsedAt && (
                      <span className="text-xs text-on-surface-variant mr-2">
                        {t('workspaceSettings.integrations.apiKeys.lastUsed')}: {formatDate(key.lastUsedAt)}
                      </span>
                    )}
                    <Button variant="text" size="sm" onClick={() => handleCopyKey(key.id)} className="gap-1.5">
                      <Copy className="h-4 w-4" />
                      {t('common.copy')}
                    </Button>
                    {isOwner && (
                      <Button variant="text" size="sm" onClick={() => handleRegenerateKey(key.id)} className="gap-1.5 text-warning">
                        <RefreshCw className="h-4 w-4" />
                        {t('workspaceSettings.integrations.apiKeys.regenerate')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhooks Section */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                {t('workspaceSettings.integrations.webhooks.title')}
              </CardTitle>
              <CardDescription>{t('workspaceSettings.integrations.webhooks.description')}</CardDescription>
            </div>
            <Switch
              checked={webhooksEnabled}
              onChange={(e) => setWebhooksEnabled(e.target.checked)}
              disabled={!isOwner}
              label={webhooksEnabled ? t('common.enabled') : t('common.disabled')}
            />
          </div>
        </CardHeader>
        <CardContent>
          {webhooksEnabled ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <p className="text-sm text-on-surface-variant mb-3">{t('workspaceSettings.integrations.webhooks.endpointUrl')}</p>
                <div className="flex gap-2">
                  <Input placeholder="https://your-app.com/webhooks/surveys" className="font-mono text-sm" disabled={!isOwner} />
                  <Button variant="tonal" size="sm" disabled>
                    {t('common.save')}
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-info-container/30 border border-info/20">
                <p className="text-sm text-on-info-container">
                  <strong>{t('workspaceSettings.integrations.webhooks.events')}:</strong> {t('workspaceSettings.integrations.webhooks.eventsList')}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Webhook className="h-7 w-7" />}
              title={t('workspaceSettings.integrations.webhooks.disabledTitle')}
              description={t('workspaceSettings.integrations.webhooks.disabledDescription')}
              iconVariant="muted"
            />
          )}
        </CardContent>
      </Card>

      {/* Third-Party Integrations */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            {t('workspaceSettings.integrations.connectedApps.title')}
          </CardTitle>
          <CardDescription>{t('workspaceSettings.integrations.connectedApps.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 transition-colors hover:bg-surface-container"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-surface-container-high flex items-center justify-center text-2xl">{integration.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-on-surface">{integration.name}</p>
                      {integration.comingSoon && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-container text-on-secondary-container">
                          {t('common.comingSoon')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant">{integration.description}</p>
                  </div>
                </div>
                <Button variant={integration.connected ? 'outline' : 'tonal'} size="sm" disabled={integration.comingSoon} className="gap-1.5">
                  {integration.connected ? (
                    t('common.disconnect')
                  ) : (
                    <>
                      {t('common.connect')}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
