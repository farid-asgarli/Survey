import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui';

interface ResponsesTableHeaderProps {
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

export function ResponsesTableHeader({ isAllSelected, onSelectAll }: ResponsesTableHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-low border-b border-outline-variant/30">
      <Checkbox checked={isAllSelected} onChange={(e) => onSelectAll(e.target.checked)} />
      <span className="flex-1 text-sm font-medium text-on-surface-variant">{t('responses.respondent')}</span>
      <span className="hidden md:block w-24 text-sm font-medium text-on-surface-variant text-center">{t('responses.duration')}</span>
      <span className="hidden md:block w-32 text-sm font-medium text-on-surface-variant text-right">{t('responses.submitted')}</span>
      <span className="w-24 text-sm font-medium text-on-surface-variant text-center">{t('common.status')}</span>
    </div>
  );
}
