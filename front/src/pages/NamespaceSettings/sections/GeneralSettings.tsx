import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input, Textarea, Skeleton } from '@/components/ui';
import { Building2, Save, Link2, X, Image as ImageIcon } from 'lucide-react';
import { useNamespaceDetail, useUpdateNamespace } from '@/hooks';
import { cn } from '@/lib/utils';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { namespaceSettingsSchema, type NamespaceSettingsFormData } from '@/lib/validations';

interface GeneralSettingsProps {
  namespaceId: string;
  isOwner: boolean;
}

export function GeneralSettings({ namespaceId, isOwner }: GeneralSettingsProps) {
  const { t } = useTranslation();
  const { data: namespace, isLoading } = useNamespaceDetail(namespaceId);
  const updateNamespace = useUpdateNamespace();
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<NamespaceSettingsFormData>({
    resolver: zodResolver(namespaceSettingsSchema),
    defaultValues: {
      name: '',
      description: '',
      logoUrl: '',
    },
    mode: 'onBlur',
  });

  const watchedLogoUrl = watch('logoUrl');

  // Initialize form when data loads
  useEffect(() => {
    if (namespace) {
      reset({
        name: namespace.name,
        description: namespace.description || '',
        logoUrl: namespace.logoUrl || '',
      });
    }
  }, [namespace, reset]);

  const handleRemoveLogo = () => {
    setValue('logoUrl', '', { shouldDirty: true });
  };

  const onSubmit: SubmitHandler<NamespaceSettingsFormData> = async (data) => {
    await updateNamespace.mutateAsync({
      id: namespaceId,
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        logoUrl: data.logoUrl?.trim() || undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>{t('workspaceSettings.general.title')}</CardTitle>
        <CardDescription>{t('workspaceSettings.general.description')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Logo Section */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-3">{t('workspaceSettings.general.logo')}</label>
            <div className="flex items-start gap-6">
              {/* Logo Preview */}
              <div
                className={cn(
                  'relative h-24 w-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all',
                  watchedLogoUrl ? 'border-outline-variant/50 bg-surface-container-low' : 'border-outline-variant/30 bg-surface-container-lowest',
                  isOwner && 'cursor-pointer hover:border-primary/50 hover:bg-primary/5'
                )}
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
              >
                {watchedLogoUrl ? (
                  <>
                    <img
                      src={watchedLogoUrl}
                      alt={t('workspaceSettings.general.logoAlt')}
                      className="h-full w-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {isOwner && isLogoHovered && (
                      <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="p-2 rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 text-on-surface-variant/40" />
                )}
              </div>

              {/* Logo URL Input */}
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="https://example.com/logo.png"
                  {...register('logoUrl')}
                  error={touchedFields.logoUrl ? errors.logoUrl?.message : undefined}
                  disabled={!isOwner}
                  startIcon={<Link2 className="h-5 w-5" />}
                />
                <p className="text-xs text-on-surface-variant">{t('workspaceSettings.general.logoHelperText')}</p>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <Input
            label={t('workspaceSettings.general.name')}
            {...register('name')}
            error={touchedFields.name ? errors.name?.message : undefined}
            disabled={!isOwner}
            startIcon={<Building2 className="h-5 w-5" />}
          />

          {/* URL (read-only) */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('workspaceSettings.general.url')}</label>
            <Input value={namespace?.slug || ''} disabled helperText={t('workspaceSettings.general.urlHelperText')} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('workspaceSettings.general.descriptionLabel')}</label>
            <Textarea
              {...register('description')}
              placeholder={t('workspaceSettings.general.descriptionPlaceholder')}
              rows={3}
              disabled={!isOwner}
              className="resize-none"
            />
          </div>
        </CardContent>
        {isOwner && (
          <CardFooter className="border-t border-outline-variant/30 mt-4">
            <Button type="submit" disabled={!isDirty || updateNamespace.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {updateNamespace.isPending ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
