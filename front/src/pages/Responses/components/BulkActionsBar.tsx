import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Button, Checkbox } from '@/components/ui';

interface BulkActionsBarProps {
  selectedCount: number;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const BulkActionsBar = memo(function BulkActionsBar({ selectedCount, isAllSelected, onSelectAll, onDelete, isDeleting }: BulkActionsBarProps) {
  const { t } = useTranslation();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSelectAll(e.target.checked);
    },
    [onSelectAll]
  );

  if (selectedCount === 0) return null;

  return (
    <div className="px-4 md:px-6 py-3 bg-primary-container/30 border-b border-outline-variant/30 flex items-center gap-4">
      <Checkbox checked={isAllSelected} onChange={handleChange} />
      <span className="text-sm font-medium text-on-surface">{t('responses.selected', { count: selectedCount })}</span>
      <div className="flex-1" />
      <Button variant="tonal" size="sm" onClick={onDelete} disabled={isDeleting} className="text-error">
        <Trash2 className="h-4 w-4 mr-2" />
        {t('responses.deleteSelected')}
      </Button>
    </div>
  );
});
