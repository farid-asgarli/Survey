import { useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { Building2, Globe, Sparkles } from 'lucide-react';
import { useCreateNamespace } from '@/hooks';
import { toast } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { createNamespaceSchema, type CreateNamespaceFormData } from '@/lib/validations';

interface CreateNamespaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNamespaceDialog({ open, onOpenChange }: CreateNamespaceDialogProps) {
  const { t } = useTranslation();
  const createNamespace = useCreateNamespace();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    watch,
    setValue,
  } = useForm<CreateNamespaceFormData>({
    resolver: zodResolver(createNamespaceSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
    mode: 'onBlur',
  });

  const watchedName = watch('name');
  const watchedSlug = watch('slug');

  // Auto-generate slug from name when slug hasn't been manually edited
  useEffect(() => {
    // Only auto-generate if slug is empty or matches the previous auto-generated value
    const autoSlug = watchedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    // Check if the current slug is empty or matches what we would auto-generate from previous name
    const currentSlugIsAuto =
      !watchedSlug ||
      watchedSlug === autoSlug ||
      watchedSlug ===
        watchedName
          .slice(0, -1)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 50);

    if (currentSlugIsAuto && autoSlug !== watchedSlug) {
      setValue('slug', autoSlug, { shouldValidate: false });
    }
  }, [watchedName, watchedSlug, setValue]);

  // Handle dialog close with reset
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        reset();
      }
      onOpenChange(newOpen);
    },
    [onOpenChange, reset]
  );

  const onSubmit: SubmitHandler<CreateNamespaceFormData> = async (data) => {
    try {
      await createNamespace.mutateAsync({
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description?.trim() || undefined,
      });

      toast.success(t('workspaces.create.success'));
      handleOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
      const message = err?.response?.data?.message || t('workspaces.create.error');
      toast.error(message);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow valid slug characters
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setValue('slug', sanitized, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="default" showClose={false}>
        <DialogHeader
          hero
          icon={<Building2 className="h-7 w-7" />}
          title={t('workspaces.create.title')}
          description={t('workspaces.create.description')}
          showClose
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-5">
            {/* Name Input */}
            <Input
              label={t('workspaces.create.nameLabel')}
              placeholder={t('workspaces.create.namePlaceholder')}
              {...register('name')}
              error={touchedFields.name ? errors.name?.message : undefined}
              startIcon={<Building2 className="h-5 w-5" />}
              autoFocus
            />

            {/* Slug Input */}
            <Input
              label={t('workspaces.create.urlLabel')}
              placeholder="my-awesome-workspace"
              value={watchedSlug}
              onChange={handleSlugChange}
              error={touchedFields.slug ? errors.slug?.message : undefined}
              helperText={t('workspaces.create.urlHelper')}
              startIcon={<Globe className="h-5 w-5" />}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('workspaces.create.descriptionLabel')}</label>
              <Textarea placeholder={t('workspaces.create.descriptionPlaceholder')} {...register('description')} rows={3} className="resize-none" />
            </div>

            {/* Feature hint */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-tertiary-container/30 border border-tertiary/20">
              <Sparkles className="h-5 w-5 text-tertiary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-on-surface">{t('workspaces.create.proTip')}</p>
                <p className="text-sm text-on-surface-variant">{t('workspaces.create.proTipText')}</p>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="text" onClick={() => handleOpenChange(false)} disabled={createNamespace.isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createNamespace.isPending}>
              {createNamespace.isPending ? t('workspaces.create.creating') : t('workspaces.createWorkspace')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
