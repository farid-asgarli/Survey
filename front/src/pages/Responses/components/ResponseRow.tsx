import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Checkbox, Chip, ListItemIcon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDateTimeShort, formatDuration, formatDurationBetween } from '@/utils';
import type { ResponseListItem } from '@/types';

interface ResponseRowProps {
  response: ResponseListItem;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
}

export const ResponseRow = memo(function ResponseRow({ response, isSelected, onSelect, onClick }: ResponseRowProps) {
  const { t } = useTranslation();

  // Memoize event handlers to prevent unnecessary re-renders
  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSelect(e.target.checked);
    },
    [onSelect]
  );

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        'hover:bg-surface-container-high cursor-pointer',
        isSelected && 'bg-primary-container/20'
      )}
    >
      {/* Checkbox */}
      <div onClick={handleStopPropagation}>
        <Checkbox checked={isSelected} onChange={handleCheckboxChange} />
      </div>

      {/* Main content - clickable */}
      <div className='flex-1 min-w-0 flex items-center gap-4' onClick={onClick}>
        <ListItemIcon variant='primary' size='sm'>
          <User className='h-4 w-4' />
        </ListItemIcon>

        <div className='flex-1 min-w-0'>
          <p className='font-medium text-on-surface truncate'>{response.respondentEmail || t('responses.anonymous')}</p>
          <p className='text-sm text-on-surface-variant truncate'>{response.surveyTitle || t('surveys.unknown')}</p>
        </div>

        <div className='hidden md:flex items-center gap-4 text-sm text-on-surface-variant'>
          <div className='flex items-center gap-1.5'>
            <Clock className='h-4 w-4' />
            <span>
              {response.timeSpentSeconds != null ? formatDuration(response.timeSpentSeconds) : formatDurationBetween(response.startedAt, response.submittedAt)}
            </span>
          </div>
          <span className='w-32 text-right'>{formatDateTimeShort(response.startedAt)}</span>
        </div>

        {response.isComplete ? (
          <Chip size='sm' variant='success' icon={<CheckCircle2 className='h-3 w-3' />}>
            {t('responses.complete')}
          </Chip>
        ) : (
          <Chip size='sm' variant='warning' icon={<XCircle className='h-3 w-3' />}>
            {t('responses.partial')}
          </Chip>
        )}
      </div>
    </div>
  );
});
