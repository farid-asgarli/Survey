import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Badge,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  Checkbox,
  toast,
} from '@/components/ui';
import { Key, Plus, Copy, AlertTriangle, Check, Trash2, Calendar, Clock, ChevronRight, Info } from 'lucide-react';
import { useSettingsStore, maskApiKey, API_KEY_SCOPES } from '@/stores';
import type { ApiKeyScope } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { createApiKeySchema, type CreateApiKeyFormData } from '@/lib/validations';
import { useDialogState, useCopyToClipboard } from '@/hooks';

export function ApiKeysSection() {
  const { t } = useTranslation();
  const { apiKeys, addApiKey, removeApiKey } = useSettingsStore();
  const createDialog = useDialogState({ onClose: () => reset() });
  const keyDialog = useDialogState<string>();
  const deleteDialog = useDialogState<string>();
  const { copy } = useCopyToClipboard();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateApiKeyFormData>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
      scopes: ['surveys:read', 'responses:read'],
    },
    mode: 'onBlur',
  });

  const watchedScopes = watch('scopes') as ApiKeyScope[];

  const onSubmit: SubmitHandler<CreateApiKeyFormData> = (data) => {
    const fullKey = addApiKey({
      name: data.name.trim(),
      scopes: data.scopes as ApiKeyScope[],
    });

    keyDialog.open(fullKey);
    createDialog.close();
    toast.success(t('apiKeys.createSuccess'));
  };

  const handleCopyKey = (key: string) => {
    copy(key, { successMessage: t('settings.security.keyCopied') });
  };

  const handleDeleteKey = (id: string) => {
    removeApiKey(id);
    deleteDialog.close();
    toast.success(t('apiKeys.deleteSuccess'));
  };

  const toggleScope = (scope: ApiKeyScope) => {
    const newScopes = watchedScopes.includes(scope) ? watchedScopes.filter((s) => s !== scope) : [...watchedScopes, scope];
    setValue('scopes', newScopes, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {/* API Keys List */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                {t('settings.security.apiKeys')}
              </CardTitle>
              <CardDescription>{t('settings.security.apiKeysDesc')}</CardDescription>
            </div>
            <Button onClick={() => createDialog.open()} size="sm">
              <Plus className="h-4 w-4" />
              {t('settings.security.createApiKey')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <EmptyState
              icon={<Key className="h-7 w-7" />}
              title={t('settings.security.noApiKeys')}
              description={t('settings.security.noApiKeysDesc')}
              iconVariant="primary"
              action={{
                label: t('settings.security.createApiKey'),
                onClick: () => createDialog.open(),
                icon: <Plus className="h-4 w-4" />,
              }}
            />
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/50">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{key.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <code className="text-xs bg-surface-container-high px-2 py-0.5 rounded-md text-on-surface-variant font-mono">
                          {maskApiKey(key.key)}
                        </code>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {formatDate(key.createdAt)}
                        </span>
                        {key.lastUsedAt && (
                          <span className="text-xs text-on-surface-variant flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last used {formatDate(key.lastUsedAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {key.scopes.map((scope) => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="text" size="sm" onClick={() => handleCopyKey(key.key)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="text" size="sm" onClick={() => deleteDialog.open(key.id)}>
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation Link */}
      <Card variant="filled" shape="rounded">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-container/50">
            <Info className="h-5 w-5 text-info" />
          </div>
          <div>
            <h4 className="font-semibold text-on-surface">{t('apiKeys.documentation')}</h4>
            <p className="text-sm text-on-surface-variant mt-1">{t('apiKeys.documentationDesc')}</p>
            <Button variant="text" size="sm" className="mt-2 -ml-2">
              {t('apiKeys.viewDocs')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={createDialog.isOpen} onOpenChange={createDialog.setOpen}>
        <DialogContent className="sm:max-w-md" showClose={false}>
          <DialogHeader
            hero
            icon={<Key className="h-7 w-7" />}
            title={t('settings.security.createApiKey')}
            description={t('apiKeys.createDesc')}
            showClose
          />
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <Input
                label={t('settings.security.keyName')}
                placeholder={t('settings.security.keyNamePlaceholder')}
                {...register('name')}
                error={errors.name?.message}
              />
              <div>
                <label className="text-sm font-medium text-on-surface mb-2 block">{t('settings.security.keyScopes')}</label>
                {errors.scopes && <p className="text-sm text-error mb-2">{errors.scopes.message}</p>}
                <div className="space-y-2">
                  {API_KEY_SCOPES.map((scope) => (
                    <label
                      key={scope.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                        watchedScopes.includes(scope.id)
                          ? 'border-primary/40 bg-primary-container/10'
                          : 'border-outline-variant/30 hover:border-outline-variant'
                      )}
                    >
                      <Checkbox checked={watchedScopes.includes(scope.id)} onChange={() => toggleScope(scope.id)} />
                      <div className="flex-1">
                        <p className="font-medium text-on-surface">{scope.label}</p>
                        <p className="text-xs text-on-surface-variant">{scope.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => createDialog.close()}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('settings.security.createKey')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Show New Key Dialog */}
      <Dialog open={keyDialog.isOpen} onOpenChange={keyDialog.setOpen}>
        <DialogContent className="sm:max-w-lg" showClose={false}>
          <DialogHeader
            hero
            icon={<Check className="h-7 w-7" />}
            title={t('settings.security.apiKeyCreated')}
            description={t('settings.security.apiKeyCreatedDesc')}
            variant="success"
            showClose
          />
          <div className="py-4">
            <div className="p-4 rounded-xl bg-surface-container-highest border border-outline-variant/30">
              <code className="text-sm font-mono break-all text-on-surface">{keyDialog.selectedItem}</code>
            </div>
            <p className="text-xs text-warning mt-3 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {t('settings.security.apiKeyWarning')}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => handleCopyKey(keyDialog.selectedItem || '')}>
              <Copy className="h-4 w-4" />
              {t('settings.security.copyKey')}
            </Button>
            <Button variant="outline" onClick={() => keyDialog.close()}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={deleteDialog.setOpen}>
        <DialogContent className="sm:max-w-md" showClose={false}>
          <DialogHeader
            hero
            icon={<Trash2 className="h-7 w-7" />}
            title={t('settings.security.deleteKey')}
            description={t('settings.security.deleteKeyConfirm')}
            variant="error"
            showClose
          />
          <div className="p-4">
            <div className="flex justify-end gap-3">
              <Button variant="text" onClick={() => deleteDialog.close()}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={() => deleteDialog.selectedItem && handleDeleteKey(deleteDialog.selectedItem)}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
