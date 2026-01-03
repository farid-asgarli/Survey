import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Chip } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useDateTimeFormatter } from '@/hooks';
import { getSurveyStatusLabel } from '@/types';
import { getSurveyStatusChipVariant } from '@/config';
import type { Survey } from '@/types';

interface RecentSurveyItemProps {
  survey: Survey;
  onClick: () => void;
}

export function RecentSurveyItem({ survey, onClick }: RecentSurveyItemProps) {
  const { t } = useTranslation();
  const { formatDateShort } = useDateTimeFormatter();
  const chipVariant = getSurveyStatusChipVariant(survey.status);
  const updatedDate = formatDateShort(survey.updatedAt || survey.createdAt);

  return (
    <button
      onClick={onClick}
      className={cn('flex items-center gap-4 px-4 py-3.5 w-full text-left', 'hover:bg-surface-container-high', 'transition-colors duration-200')}
    >
      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant'>
        <FileText className='h-5 w-5' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='font-semibold text-on-surface truncate'>{survey.title}</p>
        <div className='flex items-center gap-2 mt-0.5'>
          <span className='text-sm text-on-surface-variant'>
            {survey.responseCount} {t('surveys.responses')}
          </span>
          <span className='text-on-surface-variant/40'>•</span>
          <span className='text-sm text-on-surface-variant'>{updatedDate}</span>
        </div>
      </div>
      <Chip variant={chipVariant} size='sm'>
        {getSurveyStatusLabel(survey.status)}
      </Chip>
    </button>
  );
}
