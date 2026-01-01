// DistributionCard - Card component for displaying email distribution

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { formatDateTimeShort } from '@/utils';
import { MoreVertical, Eye, Trash2, Pause, Send, Users, Calendar } from 'lucide-react';
import { Button, Card, CardContent, Chip, Menu, MenuItem, MenuSeparator } from '@/components/ui';
import { statusConfigKeys } from '../constants';
import { DistributionStatus } from '@/types';
import type { EmailDistributionSummary } from '@/types';

interface DistributionCardProps {
  distribution: EmailDistributionSummary;
  onView: () => void;
  onSend: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isSending?: boolean;
}

export function DistributionCard({ distribution, onView, onSend, onCancel, onDelete, isSending }: DistributionCardProps) {
  const { t } = useTranslation();
  const config = statusConfigKeys[distribution.status];
  const StatusIcon = config.icon;

  // Summary only has sentCount and openedCount - calculate open rate
  const openRate = distribution.sentCount > 0 ? Math.round((distribution.openedCount / distribution.sentCount) * 100) : 0;

  const isSent = distribution.status === DistributionStatus.Sent || distribution.status === DistributionStatus.Sending;

  return (
    <Card variant='elevated' className='group'>
      <CardContent className='p-5'>
        {/* Header: Status Icon + Title + Menu */}
        <div className='flex items-start gap-3 mb-4'>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', config.color)}>
            <StatusIcon className='h-5 w-5' />
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-on-surface line-clamp-1 leading-tight'>{distribution.subject || t('distributions.untitledDistribution')}</h3>
            <p className='text-sm text-on-surface-variant mt-0.5'>
              {t('distributions.created')} {formatDateTimeShort(distribution.createdAt)}
            </p>
          </div>
          <Menu
            trigger={
              <Button variant='text' size='icon-sm' className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            }
            align='end'
          >
            <MenuItem onClick={onView} icon={<Eye className='h-4 w-4' />}>
              {t('distributions.viewDetails')}
            </MenuItem>
            {distribution.status === DistributionStatus.Scheduled && (
              <MenuItem onClick={onCancel} icon={<Pause className='h-4 w-4' />}>
                {t('distributions.cancelSchedule')}
              </MenuItem>
            )}
            {distribution.status === DistributionStatus.Draft && (
              <MenuItem onClick={onSend} icon={<Send className='h-4 w-4' />} disabled={isSending}>
                {isSending ? t('distributions.sending') : t('distributions.sendNow')}
              </MenuItem>
            )}
            <MenuSeparator />
            <MenuItem onClick={onDelete} destructive icon={<Trash2 className='h-4 w-4' />}>
              {t('common.delete')}
            </MenuItem>
          </Menu>
        </div>

        {/* Metrics for Sent distributions - shows open rate from summary data */}
        {isSent && (
          <div className='space-y-3 mb-4'>
            <div>
              <div className='flex justify-between items-center mb-1.5'>
                <span className='text-sm text-on-surface-variant'>{t('distributions.openRate')}</span>
                <span className='text-sm font-semibold text-tertiary'>{openRate}%</span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-tertiary/15'>
                <div className='h-full rounded-full bg-tertiary transition-all duration-500' style={{ width: `${openRate}%` }} />
              </div>
            </div>
            <div className='text-sm text-on-surface-variant text-center'>
              {t('distributions.sentCountLabel', { sent: distribution.sentCount, total: distribution.totalRecipients })}
            </div>
          </div>
        )}

        {/* Scheduled info */}
        {distribution.status === DistributionStatus.Scheduled && distribution.scheduledAt && (
          <div className='flex items-center gap-2 p-3 rounded-xl bg-warning/8 border border-warning/20 mb-4'>
            <Calendar className='h-4 w-4 text-warning shrink-0' />
            <span className='text-sm font-medium text-on-surface'>
              {t('distributions.scheduledFor')} {formatDateTimeShort(distribution.scheduledAt)}
            </span>
          </div>
        )}

        {/* Draft info */}
        {distribution.status === DistributionStatus.Draft && (
          <div className='flex items-center gap-2 p-3 rounded-xl bg-surface-container-high mb-4'>
            <Send className='h-4 w-4 text-on-surface-variant shrink-0' />
            <span className='text-sm text-on-surface-variant'>{t('distributions.readyToSend', { count: distribution.totalRecipients })}</span>
          </div>
        )}

        {/* Footer: Recipients + Status Badge */}
        <div className='flex items-center justify-between pt-3 border-t border-outline-variant/30'>
          <div className='flex items-center gap-1.5 text-sm text-on-surface-variant'>
            <Users className='h-4 w-4' />
            <span>{t('distributions.recipientsCount', { count: distribution.totalRecipients })}</span>
          </div>
          <Chip size='sm' className={config.color}>
            {t(config.labelKey)}
          </Chip>
        </div>
      </CardContent>
    </Card>
  );
}
