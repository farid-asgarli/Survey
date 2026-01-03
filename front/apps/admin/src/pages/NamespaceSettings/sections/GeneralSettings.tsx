import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input, Textarea, Skeleton } from '@/components/ui';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Building2, Save } from 'lucide-react';
import { useNamespaceDetail, useUpdateNamespace } from '@/hooks';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { namespaceSettingsSchema, type NamespaceSettingsFormData } from '@/lib/validations';
import { filesApi } from '@/services/api';

interface GeneralSettingsProps {
  namespaceId: string;
  isOwner: boolean;
}

export function GeneralSettings({ namespaceId, isOwner }: GeneralSettingsProps) {
  const { t } = useTranslation();
  const { data: namespace, isLoading } = useNamespaceDetail(namespaceId);
  const updateNamespace = useUpdateNamespace();

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
      <Card variant='elevated'>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-48' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-14 w-full' />
          <Skeleton className='h-24 w-full' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant='elevated'>
      <CardHeader>
        <CardTitle>{t('workspaceSettings.general.title')}</CardTitle>
        <CardDescription>{t('workspaceSettings.general.description')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className='space-y-6'>
          {/* Logo Section */}
          <ImageUploader
            label={t('workspaceSettings.general.logo')}
            value={watchedLogoUrl}
            onChange={(url) => setValue('logoUrl', url, { shouldDirty: true })}
            helperText={t('workspaceSettings.general.logoHelperText')}
            disabled={!isOwner}
            category='logo'
            onUpload={(file) => filesApi.uploadImage(file, 'logo')}
          />

          {/* Name Input */}
          <Input
            label={t('workspaceSettings.general.name')}
            {...register('name')}
            error={touchedFields.name ? errors.name?.message : undefined}
            disabled={!isOwner}
            startIcon={<Building2 className='h-5 w-5' />}
          />

          {/* URL (read-only) */}
          <div>
            <label className='block text-sm font-medium text-on-surface-variant mb-1.5'>{t('workspaceSettings.general.url')}</label>
            <Input value={namespace?.slug || ''} disabled helperText={t('workspaceSettings.general.urlHelperText')} />
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-on-surface-variant mb-1.5'>{t('workspaceSettings.general.descriptionLabel')}</label>
            <Textarea
              {...register('description')}
              placeholder={t('workspaceSettings.general.descriptionPlaceholder')}
              rows={3}
              disabled={!isOwner}
              className='resize-none'
            />
          </div>
        </CardContent>
        {isOwner && (
          <CardFooter className='border-t border-outline-variant/30 mt-4'>
            <Button type='submit' disabled={!isDirty || updateNamespace.isPending} className='gap-2'>
              <Save className='h-4 w-4' />
              {updateNamespace.isPending ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
