import { useTranslation } from 'react-i18next';
import { MoreVertical, Edit, Eye, Copy, ExternalLink, Trash2, Send, Archive, FileText, Users, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardContent, IconButton, Menu, MenuItem, MenuSeparator, Tooltip } from '@/components/ui';
import { SurveyStatusBadge } from './SurveyStatusBadge';
import { useViewTransitionNavigate, useDateTimeFormatter } from '@/hooks';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils';
import { SurveyStatus } from '@/types';
import type { Survey } from '@/types';

interface SurveyCardProps {
  survey: Survey;
  onEdit?: () => void;
  onPreview?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onPublish?: () => void;
  onClose?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function SurveyCard({ survey, onEdit, onPreview, onDuplicate, onShare, onPublish, onClose, onDelete, className }: SurveyCardProps) {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const isDraft = survey.status === SurveyStatus.Draft;
  const isPublished = survey.status === SurveyStatus.Published;
  const isClosed = survey.status === SurveyStatus.Closed;
  const isArchived = survey.status === SurveyStatus.Archived;

  const handleCardClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/surveys/${survey.id}/edit`);
    }
  };

  return (
    <Card variant='elevated' className={cn('group cursor-pointer', isArchived && 'opacity-70', className)} onClick={handleCardClick}>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-2'>
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full shrink-0',
              isDraft && 'bg-surface-container-high text-on-surface-variant',
              isPublished && 'bg-success-container/60 text-on-success-container',
              isClosed && 'bg-surface-container-high text-on-surface-variant/70',
              isArchived && 'bg-surface-container text-on-surface-variant/50'
            )}
          >
            <FileText className='h-4 w-4' />
          </div>
          <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
            <Menu
              trigger={
                <IconButton variant='standard' size='sm' aria-label={t('a11y.moreOptions')} className='h-8 w-8'>
                  <MoreVertical className='h-4 w-4' />
                </IconButton>
              }
              align='end'
            >
              <MenuItem onClick={() => onEdit?.()} icon={<Edit className='h-4 w-4' />}>
                {t('common.edit')}
              </MenuItem>
              <MenuItem onClick={() => onPreview?.()} icon={<Eye className='h-4 w-4' />}>
                {t('templates.preview')}
              </MenuItem>
              <MenuItem onClick={() => onDuplicate?.()} icon={<Copy className='h-4 w-4' />}>
                {t('common.duplicate')}
              </MenuItem>
              {isPublished && (
                <MenuItem onClick={() => onShare?.()} icon={<ExternalLink className='h-4 w-4' />}>
                  {t('distributions.shareLink')}
                </MenuItem>
              )}
              <MenuSeparator />
              {isDraft && (
                <MenuItem onClick={() => onPublish?.()} icon={<Send className='h-4 w-4' />}>
                  {t('surveys.publishSurvey')}
                </MenuItem>
              )}
              {isPublished && (
                <MenuItem onClick={() => onClose?.()} icon={<Archive className='h-4 w-4' />}>
                  {t('surveys.closeSurvey')}
                </MenuItem>
              )}
              <MenuItem onClick={() => onDelete?.()} destructive icon={<Trash2 className='h-4 w-4' />}>
                {t('common.delete')}
              </MenuItem>
            </Menu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <h3 className='font-medium text-on-surface mb-1 group-hover:text-primary transition-colors truncate'>{survey.title}</h3>
        {survey.description && <p className='text-sm text-on-surface-variant line-clamp-2 mb-3'>{survey.description}</p>}
        {!survey.description && <div className='mb-3' />}
        <div className='flex items-center justify-between text-xs text-on-surface-variant'>
          <div className='flex items-center gap-3'>
            <span className='flex items-center gap-1'>
              <FileText className='h-3 w-3' />
              {survey.questionCount ?? survey.questions?.length ?? 0} {t('surveys.questions')}
            </span>
            <span className='flex items-center gap-1'>
              <Users className='h-3 w-3' />
              {formatNumber(survey.responseCount)} {t('surveys.responses')}
            </span>
          </div>
          <SurveyStatusBadge status={survey.status} size='sm' />
        </div>
      </CardContent>
    </Card>
  );
}

// List view variant
type SurveyListItemProps = SurveyCardProps;

export function SurveyListItem({ survey, onEdit, onPreview, onDuplicate, onShare, onPublish, onClose, onDelete, className }: SurveyListItemProps) {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const { formatRelativeTime } = useDateTimeFormatter();
  const isDraft = survey.status === SurveyStatus.Draft;
  const isPublished = survey.status === SurveyStatus.Published;
  const isClosed = survey.status === SurveyStatus.Closed;
  const isArchived = survey.status === SurveyStatus.Archived;

  const handleClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/surveys/${survey.id}/edit`);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3.5 transition-colors duration-200',
        'hover:bg-surface-container-high',
        'cursor-pointer group',
        isArchived && 'opacity-70',
        className
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
          isDraft && 'bg-surface-container-highest',
          isPublished && 'bg-success-container/50',
          isClosed && 'bg-surface-container-high',
          isArchived && 'bg-surface-container'
        )}
      >
        <FileText
          className={cn(
            'h-5 w-5',
            isDraft && 'text-on-surface-variant',
            isPublished && 'text-success',
            isClosed && 'text-on-surface-variant/70',
            isArchived && 'text-on-surface-variant/50'
          )}
        />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-0.5'>
          <h3 className='font-semibold text-on-surface truncate group-hover:text-primary transition-colors'>{survey.title}</h3>
        </div>
        <p className='text-sm text-on-surface-variant flex items-center gap-3'>
          <span>
            {survey.questionCount ?? survey.questions?.length ?? 0} {t('surveys.questions')}
          </span>
          <span>·</span>
          <span>
            {formatNumber(survey.responseCount)} {t('surveys.responses')}
          </span>
          <span>·</span>
          <span>
            {t('common.updated')} {formatRelativeTime(survey.updatedAt)}
          </span>
        </p>
      </div>

      {/* Status */}
      <SurveyStatusBadge status={survey.status} />

      {/* Actions */}
      <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
        {isPublished && (
          <Tooltip content={t('responses.title')}>
            <IconButton variant='standard' size='sm' aria-label={t('responses.title')} onClick={() => navigate(`/surveys/${survey.id}/responses`)}>
              <BarChart3 className='h-4 w-4' />
            </IconButton>
          </Tooltip>
        )}

        <Menu
          trigger={
            <IconButton variant='standard' size='sm' aria-label={t('a11y.moreOptions')}>
              <MoreVertical className='h-4 w-4' />
            </IconButton>
          }
          align='end'
        >
          <MenuItem onClick={() => onEdit?.()} icon={<Edit className='h-4 w-4' />}>
            {t('common.edit')}
          </MenuItem>
          <MenuItem onClick={() => onPreview?.()} icon={<Eye className='h-4 w-4' />}>
            {t('templates.preview')}
          </MenuItem>
          <MenuItem onClick={() => onDuplicate?.()} icon={<Copy className='h-4 w-4' />}>
            {t('common.duplicate')}
          </MenuItem>
          {isPublished && (
            <MenuItem onClick={() => onShare?.()} icon={<ExternalLink className='h-4 w-4' />}>
              {t('distributions.shareLink')}
            </MenuItem>
          )}
          <MenuSeparator />
          {isDraft && (
            <MenuItem onClick={() => onPublish?.()} icon={<Send className='h-4 w-4' />}>
              {t('surveys.publishSurvey')}
            </MenuItem>
          )}
          {isPublished && (
            <MenuItem onClick={() => onClose?.()} icon={<Archive className='h-4 w-4' />}>
              {t('surveys.closeSurvey')}
            </MenuItem>
          )}
          <MenuItem onClick={() => onDelete?.()} destructive icon={<Trash2 className='h-4 w-4' />}>
            {t('common.delete')}
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
