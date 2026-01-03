import { useTranslation } from 'react-i18next';
import { isPast } from '@/utils';
import { useDateTimeFormatter } from '@/hooks';
import {
  Link2,
  Copy,
  Check,
  MoreVertical,
  Plus,
  QrCode,
  ExternalLink,
  Clock,
  Users,
  MousePointerClick,
  Eye,
  Power,
  Calendar,
  Lock,
  Globe,
  Sparkles,
  Code,
  Layers,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Chip,
  Menu,
  MenuItem,
  MenuSeparator,
  Skeleton,
  Tooltip,
  EmptyState,
  toast,
} from '@/components/ui';
import { useSurveyLinks, useDeactivateLink, useUpdateLink } from '@/hooks/queries/useLinks';
import { useConfirmDialog, useDialogState, useCopyToClipboard } from '@/hooks';
import { LinkType } from '@/types';
import type { SurveyLink } from '@/types';
import { CreateLinkDialog } from './CreateLinkDialog';
import { BulkLinkGenerationDialog } from './BulkLinkGenerationDialog';
import { QRCodeDialog } from './QRCodeDialog';
import { LinkAnalyticsDrawer } from './LinkAnalyticsDrawer';

interface LinksPanelProps {
  surveyId: string;
  surveyTitle?: string;
}

// linkTypeConfig moved inside LinkCard component for translations

function LinkCard({
  link,
  onShowQR,
  onViewAnalytics,
  onDeactivate,
  onReactivate,
}: {
  link: SurveyLink;
  onShowQR: (link: SurveyLink) => void;
  onViewAnalytics: (link: SurveyLink) => void;
  onDeactivate: (linkId: string) => void;
  onReactivate: (linkId: string) => void;
}) {
  const { t } = useTranslation();
  const { formatDateTime, formatRelativeTime } = useDateTimeFormatter();
  const { copied, copy } = useCopyToClipboard();

  const linkTypeConfig: Record<LinkType, { label: string; icon: typeof Globe; color: string; description: string }> = {
    [LinkType.Public]: {
      label: t('linksPanel.types.standard'),
      icon: Globe,
      color: 'bg-primary-container text-on-primary-container',
      description: t('linksPanel.types.standardDescription'),
    },
    [LinkType.Unique]: {
      label: t('linksPanel.types.unique'),
      icon: Sparkles,
      color: 'bg-tertiary-container text-on-tertiary-container',
      description: t('linksPanel.types.uniqueDescription'),
    },
    [LinkType.Embedded]: {
      label: t('linksPanel.types.embedded'),
      icon: Code,
      color: 'bg-secondary-container text-on-secondary-container',
      description: t('linksPanel.types.embeddedDescription'),
    },
    [LinkType.Campaign]: {
      label: t('linksPanel.types.campaign', 'Campaign'),
      icon: Layers,
      color: 'bg-warning-container text-on-warning-container',
      description: t('linksPanel.types.campaignDescription', 'Campaign tracking link'),
    },
    [LinkType.QrCode]: {
      label: t('linksPanel.types.qrCode', 'QR Code'),
      icon: QrCode,
      color: 'bg-info-container text-on-info-container',
      description: t('linksPanel.types.qrCodeDescription', 'QR code link'),
    },
  };

  const config = linkTypeConfig[link.type] || linkTypeConfig[LinkType.Public];
  const TypeIcon = config.icon;

  const isExpired = link.expiresAt ? isPast(link.expiresAt) : false;
  const isMaxedOut = link.maxUses ? link.responseCount >= link.maxUses : false;
  const isDisabled = !link.isActive || isExpired || isMaxedOut;

  const handleCopy = () => {
    copy(link.fullUrl, {
      successMessage: t('linksPanel.toast.copied'),
      errorMessage: t('linksPanel.toast.copyFailed'),
    });
  };

  const getStatusInfo = () => {
    if (!link.isActive) return { label: t('linksPanel.status.inactive'), color: 'bg-surface-container text-on-surface-variant' };
    if (isExpired) return { label: t('linksPanel.status.expired'), color: 'bg-error-container text-on-error-container' };
    if (isMaxedOut) return { label: t('linksPanel.status.limitReached'), color: 'bg-warning-container text-on-warning-container' };
    return { label: t('linksPanel.status.active'), color: 'bg-success-container text-on-success-container' };
  };

  const status = getStatusInfo();

  return (
    <Card variant='outlined' className='group hover:border-outline transition-colors'>
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          {/* Type Icon */}
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
            <TypeIcon className='w-5 h-5' />
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <Chip size='sm' className={config.color}>
                {config.label}
              </Chip>
              <Chip size='sm' className={status.color}>
                {status.label}
              </Chip>
              {link.hasPassword && (
                <Tooltip content={t('linksPanel.passwordProtected')}>
                  <Lock className='w-3.5 h-3.5 text-on-surface-variant' />
                </Tooltip>
              )}
            </div>

            {/* URL */}
            <div className='flex items-center gap-2 mb-2'>
              <code className='text-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-lg truncate max-w-75'>{link.token}</code>
              <Button variant='text' size='icon-sm' onClick={handleCopy} className='opacity-0 group-hover:opacity-100 transition-opacity'>
                {copied ? <Check className='w-4 h-4 text-success' /> : <Copy className='w-4 h-4' />}
              </Button>
            </div>

            {/* Stats */}
            <div className='flex items-center gap-4 text-xs text-on-surface-variant'>
              <Tooltip content={t('linksPanel.totalClicks')}>
                <div className='flex items-center gap-1'>
                  <MousePointerClick className='w-3.5 h-3.5' />
                  <span>{link.usageCount}</span>
                </div>
              </Tooltip>
              <Tooltip content={t('linksPanel.responses')}>
                <div className='flex items-center gap-1'>
                  <Users className='w-3.5 h-3.5' />
                  <span>
                    {link.responseCount}
                    {link.maxUses && ` / ${link.maxUses}`}
                  </span>
                </div>
              </Tooltip>
              {link.expiresAt && (
                <Tooltip content={t('linksPanel.expiresAt', { date: formatDateTime(link.expiresAt) })}>
                  <div className={`flex items-center gap-1 ${isExpired ? 'text-error' : ''}`}>
                    <Calendar className='w-3.5 h-3.5' />
                    <span>{isExpired ? t('linksPanel.status.expired') : formatRelativeTime(link.expiresAt)}</span>
                  </div>
                </Tooltip>
              )}
              <div className='flex items-center gap-1'>
                <Clock className='w-3.5 h-3.5' />
                <span>{formatRelativeTime(link.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-1'>
            <Tooltip content={t('linksPanel.showQRCode')}>
              <Button variant='text' size='icon-sm' onClick={() => onShowQR(link)}>
                <QrCode className='w-4 h-4' />
              </Button>
            </Tooltip>
            <Tooltip content={t('linksPanel.openLink')}>
              <Button variant='text' size='icon-sm' onClick={() => window.open(link.fullUrl, '_blank')} disabled={isDisabled}>
                <ExternalLink className='w-4 h-4' />
              </Button>
            </Tooltip>
            <Menu
              trigger={
                <Button variant='text' size='icon-sm'>
                  <MoreVertical className='w-4 h-4' />
                </Button>
              }
              align='end'
            >
              <MenuItem onClick={() => onViewAnalytics(link)} icon={<Eye className='w-4 h-4' />}>
                {t('linksPanel.viewAnalytics')}
              </MenuItem>
              <MenuItem onClick={handleCopy} icon={<Copy className='w-4 h-4' />}>
                {t('linksPanel.copyLink')}
              </MenuItem>
              <MenuItem onClick={() => onShowQR(link)} icon={<QrCode className='w-4 h-4' />}>
                {t('linksPanel.showQRCode')}
              </MenuItem>
              <MenuSeparator />
              {link.isActive ? (
                <MenuItem onClick={() => onDeactivate(link.id)} icon={<Power className='w-4 h-4' />} destructive>
                  {t('linksPanel.deactivate')}
                </MenuItem>
              ) : (
                <MenuItem onClick={() => onReactivate(link.id)} icon={<Power className='w-4 h-4' />}>
                  {t('linksPanel.reactivate')}
                </MenuItem>
              )}
            </Menu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LinksSkeleton() {
  return (
    <div className='space-y-3'>
      {[1, 2, 3].map((i) => (
        <Card key={i} variant='outlined'>
          <CardContent className='p-4'>
            <div className='flex items-start gap-3'>
              <Skeleton className='w-10 h-10 rounded-xl' />
              <div className='flex-1'>
                <div className='flex gap-2 mb-2'>
                  <Skeleton className='h-6 w-20 rounded-lg' />
                  <Skeleton className='h-6 w-16 rounded-lg' />
                </div>
                <Skeleton className='h-5 w-48 mb-2' />
                <div className='flex gap-4'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LinksEmptyState({ onCreateLink }: { onCreateLink: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<Link2 className='h-7 w-7' />}
      title={t('linksPanel.emptyState.title')}
      description={t('linksPanel.emptyState.description')}
      iconVariant='primary'
      action={{
        label: t('linksPanel.createLink'),
        onClick: onCreateLink,
        icon: <Plus className='h-4 w-4' />,
      }}
    />
  );
}

export function LinksPanel({ surveyId, surveyTitle }: LinksPanelProps) {
  const { t } = useTranslation();
  const createDialog = useDialogState();
  const bulkDialog = useDialogState();
  const qrDialog = useDialogState<SurveyLink>();
  const analyticsDrawer = useDialogState<SurveyLink>();

  const { data: linksData, isLoading, error } = useSurveyLinks(surveyId);
  const deactivateMutation = useDeactivateLink(surveyId);
  const updateLinkMutation = useUpdateLink(surveyId);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Extract links array from paginated response
  const links = linksData?.items ?? [];

  const handleDeactivate = async (linkId: string) => {
    const confirmed = await confirm({
      title: t('linksPanel.confirm.deactivateTitle'),
      description: t('linksPanel.confirm.deactivateDescription'),
      confirmText: t('linksPanel.deactivate'),
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        await deactivateMutation.mutateAsync(linkId);
        toast.success(t('linksPanel.toast.deactivated'));
      } catch {
        toast.error(t('linksPanel.toast.deactivateFailed'));
      }
    }
  };

  const handleReactivate = async (linkId: string) => {
    const confirmed = await confirm({
      title: t('linksPanel.confirm.reactivateTitle'),
      description: t('linksPanel.confirm.reactivateDescription'),
      confirmText: t('linksPanel.reactivate'),
    });

    if (confirmed) {
      try {
        await updateLinkMutation.mutateAsync({ linkId, data: { isActive: true } });
        toast.success(t('linksPanel.toast.reactivated'));
      } catch {
        toast.error(t('linksPanel.toast.reactivateFailed'));
      }
    }
  };

  const activeLinks = links?.filter((l) => l.isActive) ?? [];
  const inactiveLinks = links?.filter((l) => !l.isActive) ?? [];

  return (
    <>
      <Card variant='elevated' className='overflow-hidden'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Link2 className='w-5 h-5' />
                {t('linksPanel.title')}
              </CardTitle>
              <CardDescription>{t('linksPanel.description')}</CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='tonal' onClick={() => bulkDialog.open()}>
                <Layers className='w-4 h-4 mr-2' />
                {t('linksPanel.bulkGenerate')}
              </Button>
              <Button onClick={() => createDialog.open()}>
                <Plus className='w-4 h-4 mr-2' />
                {t('linksPanel.newLink')}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {isLoading ? (
            <LinksSkeleton />
          ) : error ? (
            <div className='text-center py-8 text-error'>
              <p>{t('linksPanel.error')}</p>
            </div>
          ) : !links || links.length === 0 ? (
            <LinksEmptyState onCreateLink={() => createDialog.open()} />
          ) : (
            <>
              {/* Active Links */}
              {activeLinks.length > 0 && (
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium text-on-surface-variant uppercase tracking-wide'>
                    {t('linksPanel.activeLinks', { count: activeLinks.length })}
                  </h4>
                  {activeLinks.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onShowQR={qrDialog.open}
                      onViewAnalytics={analyticsDrawer.open}
                      onDeactivate={handleDeactivate}
                      onReactivate={handleReactivate}
                    />
                  ))}
                </div>
              )}

              {/* Inactive Links */}
              {inactiveLinks.length > 0 && (
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium text-on-surface-variant uppercase tracking-wide'>
                    {t('linksPanel.inactiveLinks', { count: inactiveLinks.length })}
                  </h4>
                  {inactiveLinks.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onShowQR={qrDialog.open}
                      onViewAnalytics={analyticsDrawer.open}
                      onDeactivate={handleDeactivate}
                      onReactivate={handleReactivate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateLinkDialog open={createDialog.isOpen} onOpenChange={createDialog.setOpen} surveyId={surveyId} surveyTitle={surveyTitle} />

      <BulkLinkGenerationDialog open={bulkDialog.isOpen} onOpenChange={bulkDialog.setOpen} surveyId={surveyId} surveyTitle={surveyTitle} />

      <QRCodeDialog link={qrDialog.selectedItem} onClose={qrDialog.close} />

      <LinkAnalyticsDrawer link={analyticsDrawer.selectedItem} surveyId={surveyId} onClose={analyticsDrawer.close} />

      <ConfirmDialog />
    </>
  );
}
