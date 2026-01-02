import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, FileStack, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { useTemplateSchema, type UseTemplateFormData } from '@/lib/validations';
import { getCategoryInfo } from './templateUtils';
import type { SurveyTemplateSummary, TemplateCategory } from '@/types';
import { LANGUAGES, getCurrentLanguage, type LanguageCode } from '@/i18n';

interface UseTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: SurveyTemplateSummary | null;
  onSubmit: (data: { title: string; description?: string; languageCode: string }) => void | Promise<void>;
  isLoading?: boolean;
}

function UseTemplateForm({
  template,
  onSubmit,
  onCancel,
  isLoading,
}: {
  template: SurveyTemplateSummary;
  onSubmit: (data: { title: string; description?: string; languageCode: string }) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const [showDescription, setShowDescription] = useState(!!template.description);
  const [languageCode, setLanguageCode] = useState<LanguageCode>(getCurrentLanguage());

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UseTemplateFormData>({
    resolver: zodResolver(useTemplateSchema),
    defaultValues: {
      title: `${template.name} - Copy`,
      description: template.description || '',
    },
    mode: 'onChange',
  });

  const onFormSubmit: SubmitHandler<UseTemplateFormData> = async (data) => {
    await onSubmit({
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      languageCode,
    });
  };

  const categoryInfo = getCategoryInfo((template.category || 'other') as TemplateCategory);
  const CategoryIcon = categoryInfo.icon;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <DialogBody className='space-y-4'>
        {/* Template info card */}
        <div className='p-4 rounded-xl bg-surface-container border border-outline-variant/30'>
          <div className='flex items-start gap-3'>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high ${categoryInfo.color}`}>
              <CategoryIcon className='h-5 w-5' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='font-medium text-on-surface truncate'>{template.name}</p>
              <p className='text-xs text-on-surface-variant'>
                {template.questionCount} questions • {categoryInfo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Title input */}
        <Input
          label={t('templates.useTemplateDialog.surveyTitle')}
          placeholder={t('templates.useTemplateDialog.surveyTitlePlaceholder')}
          {...register('title')}
          error={errors.title?.message}
          autoFocus
          disabled={isLoading}
        />

        {/* Description */}
        {showDescription ? (
          <Textarea
            label={t('templates.useTemplateDialog.descriptionOptional')}
            placeholder={t('templates.useTemplateDialog.descriptionPlaceholder')}
            {...register('description')}
            rows={3}
            disabled={isLoading}
          />
        ) : (
          <button
            type='button'
            onClick={() => setShowDescription(true)}
            className='text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1'
            disabled={isLoading}
          >
            <Sparkles className='h-4 w-4' />
            {t('templates.useTemplateDialog.addDescription')}
          </button>
        )}

        {/* Language selector */}
        <div className='flex items-center gap-2'>
          <label htmlFor='survey-language' className='text-sm text-on-surface-variant'>
            {t('templates.useTemplateDialog.language')}
          </label>
          <select
            id='survey-language'
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value as LanguageCode)}
            className='h-9 px-3 rounded-md border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50'
            disabled={isLoading}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.nativeName}
              </option>
            ))}
          </select>
        </div>

        <p className='text-xs text-on-surface-variant text-center'>{t('templates.useTemplateDialog.infoMessage')}</p>
      </DialogBody>

      <DialogFooter className='pt-4'>
        <Button type='button' variant='text' onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button type='submit' variant='filled' disabled={!isValid || isLoading} loading={isLoading}>
          <Copy className='h-4 w-4 mr-2' />
          {t('templates.useTemplateDialog.createButton')}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UseTemplateDialog({ open, onOpenChange, template, onSubmit, isLoading = false }: UseTemplateDialogProps) {
  const { t } = useTranslation();
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size='default' showClose={false}>
        <DialogHeader
          hero
          icon={<FileStack className='h-7 w-7' />}
          title={t('templates.useTemplateDialog.title')}
          description={t('templates.useTemplateDialog.description')}
          showClose
        />

        {open && template && (
          <UseTemplateForm key={template.id} template={template} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} isLoading={isLoading} />
        )}
      </DialogContent>
    </Dialog>
  );
}
