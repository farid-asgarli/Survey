import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useDeleteNamespace } from '@/hooks';
import { useConfirmDialog } from '@/hooks';

interface DangerZoneProps {
  namespaceId: string;
  namespaceName: string;
  isOwner: boolean;
  onDeleted: () => void;
}

export function DangerZone({ namespaceId, namespaceName, isOwner, onDeleted }: DangerZoneProps) {
  const { t } = useTranslation();
  const deleteNamespace = useDeleteNamespace();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: t('workspaceSettings.dangerZone.deleteTitle'),
      description: t('workspaceSettings.dangerZone.deleteConfirmation', { name: namespaceName }),
      confirmText: t('workspaceSettings.dangerZone.deleteTitle'),
      variant: 'destructive',
    });

    if (confirmed) {
      await deleteNamespace.mutateAsync(namespaceId);
      onDeleted();
    }
  };

  if (!isOwner) return null;

  return (
    <>
      <Card variant="outlined" className="border-error/30">
        <CardHeader>
          <CardTitle className="text-error flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t('workspaceSettings.dangerZone.title')}
          </CardTitle>
          <CardDescription>{t('workspaceSettings.dangerZone.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-error/5 border border-error/20">
            <div>
              <p className="font-medium text-on-surface">{t('workspaceSettings.dangerZone.deleteWorkspace')}</p>
              <p className="text-sm text-on-surface-variant">{t('workspaceSettings.dangerZone.deleteWarning')}</p>
            </div>
            <Button
              variant="outline"
              className="text-error border-error/30 hover:bg-error/10"
              onClick={handleDelete}
              disabled={deleteNamespace.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteNamespace.isPending ? t('common.deleting') : t('workspaceSettings.dangerZone.deleteTitle')}
            </Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog />
    </>
  );
}
