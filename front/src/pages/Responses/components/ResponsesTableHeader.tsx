import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui';

interface ResponsesTableHeaderProps {
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

export const ResponsesTableHeader = memo(function ResponsesTableHeader({ isAllSelected, onSelectAll }: ResponsesTableHeaderProps) {
  const { t } = useTranslation();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSelectAll(e.target.checked);
    },
    [onSelectAll]
  );

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-low border-b border-outline-variant/30 sticky top-0 z-10">
      <Checkbox checked={isAllSelected} onChange={handleChange} />
      <span className="flex-1 text-sm font-medium text-on-surface-variant">{t('responses.respondent')}</span>
      <span className="hidden md:block w-24 text-sm font-medium text-on-surface-variant text-center">{t('responses.duration')}</span>
      <span className="hidden md:block w-32 text-sm font-medium text-on-surface-variant text-right">{t('responses.submitted')}</span>
      <span className="w-24 text-sm font-medium text-on-surface-variant text-center">{t('common.status')}</span>
    </div>
  );
});
