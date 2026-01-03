import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/components/ui';
import { Crown, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Namespace, SubscriptionTier } from '@/types';
import { SubscriptionTier as ST } from '@/types/enums';
import { tierConfig } from '../config';

interface BillingSettingsProps {
  namespace: Namespace | undefined;
}

export function BillingSettings({ namespace }: BillingSettingsProps) {
  const { t } = useTranslation();
  const tier = tierConfig(t)[namespace?.subscriptionTier as SubscriptionTier] || tierConfig(t)[ST.Free];

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{t('workspaceSettings.billing.title')}</CardTitle>
          <CardDescription>{t('workspaceSettings.billing.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container-low">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', tier.bgClass)}>
              <Crown className={cn('h-6 w-6', tier.color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-on-surface">{tier.label}</h3>
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', tier.bgClass, tier.color)}>
                  {t('workspaceSettings.billing.currentPlan')}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">{tier.description}</p>
              <ul className="mt-3 space-y-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="text-sm text-on-surface-variant flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-outline-variant/30 mt-4">
          <Button variant="outline" disabled>
            <CreditCard className="h-4 w-4 mr-2" />
            {t('workspaceSettings.billing.upgradePlan')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
