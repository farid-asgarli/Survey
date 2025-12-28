import { SubscriptionTier } from '@/types/enums';

export const tierConfig = (
  t: (key: string) => string
): Record<SubscriptionTier, { label: string; description: string; color: string; bgClass: string; features: string[] }> => ({
  [SubscriptionTier.Free]: {
    label: t('workspaceSettings.billing.tiers.free.label'),
    description: t('workspaceSettings.billing.tiers.free.description'),
    color: 'text-on-surface-variant',
    bgClass: 'bg-surface-container-high',
    features: [
      t('workspaceSettings.billing.tiers.free.features.surveys'),
      t('workspaceSettings.billing.tiers.free.features.responses'),
      t('workspaceSettings.billing.tiers.free.features.analytics'),
      t('workspaceSettings.billing.tiers.free.features.teamMembers'),
    ],
  },
  [SubscriptionTier.Pro]: {
    label: t('workspaceSettings.billing.tiers.pro.label'),
    description: t('workspaceSettings.billing.tiers.pro.description'),
    color: 'text-primary',
    bgClass: 'bg-primary-container/50',
    features: [
      t('workspaceSettings.billing.tiers.pro.features.surveys'),
      t('workspaceSettings.billing.tiers.pro.features.responses'),
      t('workspaceSettings.billing.tiers.pro.features.analytics'),
      t('workspaceSettings.billing.tiers.pro.features.teamMembers'),
      t('workspaceSettings.billing.tiers.pro.features.branding'),
      t('workspaceSettings.billing.tiers.pro.features.support'),
    ],
  },
  [SubscriptionTier.Enterprise]: {
    label: t('workspaceSettings.billing.tiers.enterprise.label'),
    description: t('workspaceSettings.billing.tiers.enterprise.description'),
    color: 'text-tertiary',
    bgClass: 'bg-tertiary-container/50',
    features: [
      t('workspaceSettings.billing.tiers.enterprise.features.unlimited'),
      t('workspaceSettings.billing.tiers.enterprise.features.integrations'),
      t('workspaceSettings.billing.tiers.enterprise.features.support'),
      t('workspaceSettings.billing.tiers.enterprise.features.security'),
      t('workspaceSettings.billing.tiers.enterprise.features.sla'),
    ],
  },
});
