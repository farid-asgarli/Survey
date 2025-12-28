import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, FileText, Lightbulb, Smile, Users, CalendarDays, TrendingUp, BarChart3, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { createSurveySchema, type CreateSurveyFormData } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface CreateSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; description?: string }) => void | Promise<void>;
  isLoading?: boolean;
}

// Quick start suggestions - keys for translation
const SURVEY_SUGGESTIONS: { titleKey: string; icon: LucideIcon }[] = [
  { titleKey: 'surveys.suggestions.customerSatisfaction', icon: Smile },
  { titleKey: 'surveys.suggestions.employeeFeedback', icon: Users },
  { titleKey: 'surveys.suggestions.eventRegistration', icon: CalendarDays },
  { titleKey: 'surveys.suggestions.productFeedback', icon: TrendingUp },
  { titleKey: 'surveys.suggestions.npsSurvey', icon: BarChart3 },
  { titleKey: 'surveys.suggestions.marketResearch', icon: Search },
];

// Inner form component that handles local state - resets when remounted
function CreateSurveyForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: { title: string; description?: string }) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const [showDescription, setShowDescription] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateSurveyFormData>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: {
      title: '',
      description: '',
    },
    mode: 'onChange',
  });

  const title = watch('title');

  const onFormSubmit: SubmitHandler<CreateSurveyFormData> = async (data) => {
    await onSubmit({
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
    });
  };

  const handleSuggestionClick = (titleKey: string) => {
    setValue('title', t(titleKey), { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <DialogBody className="space-y-4">
        {/* Title input */}
        <Input
          label={t('surveys.surveyTitle')}
          placeholder={t('surveys.form.titlePlaceholder')}
          {...register('title')}
          error={errors.title?.message}
          autoFocus
          disabled={isLoading}
        />

        {/* Description toggle and input */}
        {showDescription ? (
          <Textarea
            label={t('surveys.form.descriptionLabel')}
            placeholder={t('surveys.form.descriptionPlaceholder')}
            {...register('description')}
            rows={3}
            disabled={isLoading}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowDescription(true)}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            disabled={isLoading}
          >
            <FileText className="h-4 w-4" />
            {t('surveys.form.addDescription')}
          </button>
        )}

        {/* Quick suggestions */}
        {!title && (
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-3">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>{t('surveys.suggestions.title')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SURVEY_SUGGESTIONS.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.titleKey}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion.titleKey)}
                    disabled={isLoading}
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm',
                      'bg-surface-container hover:bg-surface-container-high',
                      'border-2 border-outline-variant/50 hover:border-primary/40',
                      'transition-colors duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {t(suggestion.titleKey)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="pt-4">
        <Button type="button" variant="text" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="filled" disabled={!isValid || isLoading} loading={isLoading}>
          {t('surveys.createSurvey')}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateSurveyDialog({ open, onOpenChange, onSubmit, isLoading = false }: CreateSurveyDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="default" className="overflow-hidden" showClose={false}>
        <DialogHeader
          hero
          icon={<Sparkles className="h-7 w-7" />}
          title={t('surveys.newSurvey')}
          description={t('surveys.form.getStarted')}
          showClose
        />

        {/* Use key to force remount and reset state when dialog opens */}
        {open && <CreateSurveyForm key="create-survey-form" onSubmit={onSubmit} onCancel={() => onOpenChange(false)} isLoading={isLoading} />}
      </DialogContent>
    </Dialog>
  );
}
