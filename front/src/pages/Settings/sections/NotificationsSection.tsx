import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Switch, toast } from '@/components/ui';
import { Mail, Info } from 'lucide-react';
import { useSettingsStore } from '@/stores';

export function NotificationsSection() {
  const { t } = useTranslation();
  const { notifications, setNotificationSetting } = useSettingsStore();

  const handleToggle = (key: keyof typeof notifications) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSetting(key, e.target.checked);

    // If master toggle is turned off, show a toast
    if (key === 'emailNotifications' && !e.target.checked) {
      toast.info(t('notifications.allDisabled'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {t('notifications.emailNotifications')}
          </CardTitle>
          <CardDescription>{t('notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="py-3 border-b border-outline-variant/20">
            <Switch
              label={t('notifications.settings.allEmails.title')}
              description={t('notifications.settings.allEmails.description')}
              checked={notifications.emailNotifications}
              onChange={handleToggle('emailNotifications')}
            />
          </div>
          <div className="py-3 border-b border-outline-variant/20">
            <Switch
              label={t('notifications.settings.responseAlerts.title')}
              description={t('notifications.settings.responseAlerts.description')}
              checked={notifications.responseAlerts}
              onChange={handleToggle('responseAlerts')}
              disabled={!notifications.emailNotifications}
            />
          </div>
          <div className="py-3 border-b border-outline-variant/20">
            <Switch
              label={t('notifications.settings.completionAlerts.title')}
              description={t('notifications.settings.completionAlerts.description')}
              checked={notifications.completionAlerts}
              onChange={handleToggle('completionAlerts')}
              disabled={!notifications.emailNotifications}
            />
          </div>
          <div className="py-3 border-b border-outline-variant/20">
            <Switch
              label={t('notifications.settings.weeklyDigest.title')}
              description={t('notifications.settings.weeklyDigest.description')}
              checked={notifications.weeklyDigest}
              onChange={handleToggle('weeklyDigest')}
              disabled={!notifications.emailNotifications}
            />
          </div>
          <div className="py-3 border-b border-outline-variant/20">
            <Switch
              label={t('notifications.settings.distributionReports.title')}
              description={t('notifications.settings.distributionReports.description')}
              checked={notifications.distributionReports}
              onChange={handleToggle('distributionReports')}
              disabled={!notifications.emailNotifications}
            />
          </div>
          <div className="py-3">
            <Switch
              label={t('notifications.settings.marketing.title')}
              description={t('notifications.settings.marketing.description')}
              checked={notifications.marketingEmails}
              onChange={handleToggle('marketingEmails')}
              disabled={!notifications.emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Info */}
      <Card variant="filled" shape="rounded">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-container/50">
            <Info className="h-5 w-5 text-info" />
          </div>
          <div>
            <h4 className="font-semibold text-on-surface">{t('notifications.aboutTitle')}</h4>
            <p className="text-sm text-on-surface-variant mt-1">{t('notifications.aboutDescription')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
