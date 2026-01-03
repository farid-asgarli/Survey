import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileStack, FileText, Globe, Lock, Sparkles, ChevronDown, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  Menu,
  MenuItem,
} from '@/components/ui';
import { useSurveysList } from '@/hooks/queries/useSurveys';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { createTemplateSchema, type CreateTemplateFormData } from '@/lib/validations';
import { getCategoryOptions } from './templateUtils';
import { cn } from '@/lib/utils';
import { getCurrentLanguage } from '@/i18n';
import { SUPPORTED_LANGUAGES, getLanguageInfo } from '@/config/languages';
import type { TemplateCategory, Survey } from '@/types';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTemplateData) => void | Promise<void>;
  isLoading?: boolean;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  category: TemplateCategory;
  isPublic: boolean;
  // Either surveyId (from existing) or null (from scratch)
  surveyId?: string;
  /** Language code for the initial translation */
  languageCode: string;
}

type CreateMode = 'scratch' | 'survey';

// Mode selection card component
function ModeCard({
  mode,
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
}: {
  mode: CreateMode;
  selected: boolean;
  onSelect: (mode: CreateMode) => void;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={cn(
        'flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
        'hover:bg-surface-container-high',
        selected ? 'border-primary bg-primary/5' : 'border-outline-variant/50 hover:border-outline-variant'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
          selected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-center">
        <p className={cn('text-sm font-medium', selected ? 'text-primary' : 'text-on-surface')}>{title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
      </div>
    </button>
  );
}

// Get initial language - use current UI language if it's a supported template language, otherwise 'en'
const getInitialLanguage = (): string => {
  const currentLang = getCurrentLanguage();
  return SUPPORTED_LANGUAGES.some((l) => l.code === currentLang) ? currentLang : 'en';
};

function CreateTemplateForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: CreateTemplateData) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<CreateMode>('scratch');
  const [languageCode, setLanguageCode] = useState<string>(getInitialLanguage());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'feedback',
      isPublic: false,
      surveyId: '',
    },
    mode: 'onChange',
  });

  const name = watch('name');
  const category = watch('category');
  const isPublic = watch('isPublic');
  const surveyId = watch('surveyId');

  // Fetch surveys for "from existing survey" mode
  const { data: surveysData, isLoading: isSurveysLoading } = useSurveysList();
  const surveys = surveysData?.items || [];

  const onFormSubmit: SubmitHandler<CreateTemplateFormData> = async (data) => {
    await onSubmit({
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      category: data.category as TemplateCategory,
      isPublic: data.isPublic,
      surveyId: mode === 'survey' ? data.surveyId : undefined,
      languageCode,
    });
  };

  const isValid = name.trim().length > 0 && (mode === 'scratch' || surveyId);

  const categoryOptions = getCategoryOptions();

  // Convert surveys to select options
  const surveyOptions = surveys.map((s: Survey) => ({
    value: s.id,
    label: `${s.title}${
      s.questionCount || s.questions?.length ? ` (${t('templates.form.questions', { count: s.questionCount ?? s.questions?.length })})` : ''
    }`,
  }));

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <DialogBody className="space-y-5">
        {/* Mode selector - card style */}
        <div className="flex gap-3">
          <ModeCard
            mode="scratch"
            selected={mode === 'scratch'}
            onSelect={setMode}
            icon={Sparkles}
            title={t('templates.form.modes.scratch')}
            description={t('templates.form.modes.scratchDescription')}
          />
          <ModeCard
            mode="survey"
            selected={mode === 'survey'}
            onSelect={setMode}
            icon={FileText}
            title={t('templates.form.modes.survey')}
            description={t('templates.form.modes.surveyDescription')}
          />
        </div>

        {/* Survey selector (only shown in survey mode) */}
        {mode === 'survey' && (
          <Select
            label={t('templates.form.selectSurvey')}
            options={surveyOptions}
            value={surveyId || ''}
            onChange={(v) => setValue('surveyId', v, { shouldValidate: true })}
            placeholder={isSurveysLoading ? t('templates.form.loadingSurveys') : t('templates.form.chooseSurvey')}
            disabled={isLoading || isSurveysLoading}
          />
        )}

        {/* Template details section */}
        <div className="space-y-4">
          {/* Template name */}
          <Input
            label={t('templates.form.name')}
            placeholder={t('templates.form.namePlaceholder')}
            {...register('name')}
            error={errors.name?.message}
            autoFocus={mode === 'scratch'}
            disabled={isLoading}
          />

          {/* Description */}
          <Textarea
            label={t('templates.form.templateDescription')}
            placeholder={t('templates.form.descriptionPlaceholder')}
            {...register('description')}
            rows={2}
            disabled={isLoading}
            helperText={t('templates.form.descriptionHelperText')}
          />

          {/* Category */}
          <Select
            label={t('templates.form.category')}
            options={categoryOptions}
            value={category}
            onChange={(v) => setValue('category', v, { shouldValidate: true })}
            disabled={isLoading}
          />
        </div>

        {/* Visibility toggle - improved design */}
        <button
          type="button"
          onClick={() => setValue('isPublic', !isPublic)}
          disabled={isLoading}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left',
            isPublic ? 'border-success/50 bg-success/5' : 'border-outline-variant/50 hover:border-outline-variant hover:bg-surface-container-low'
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
              isPublic ? 'bg-success/15 text-success' : 'bg-surface-container-high text-on-surface-variant'
            )}
          >
            {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface">
              {isPublic ? t('templates.form.visibility.public') : t('templates.form.visibility.private')}
            </p>
            <p className="text-xs text-on-surface-variant">
              {isPublic ? t('templates.form.visibility.publicDescription') : t('templates.form.visibility.privateDescription')}
            </p>
          </div>
          <Switch checked={isPublic} onChange={() => {}} disabled={isLoading} />
        </button>
      </DialogBody>

      <DialogFooter>
        {/* Language Selector - Dropdown Menu */}
        <div className="flex items-center gap-2 mr-auto">
          <Globe className="h-4 w-4 text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">{t('templates.form.language', 'Language')}:</span>
          <Menu
            align="start"
            trigger={
              <button
                type="button"
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  'bg-surface-container hover:bg-surface-container-high border border-outline-variant/40',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span>{getLanguageInfo(languageCode).flag}</span>
                <span>{getLanguageInfo(languageCode).nativeName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-on-surface-variant" />
              </button>
            }
          >
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = languageCode === lang.code;
              return (
                <MenuItem key={lang.code} onClick={() => setLanguageCode(lang.code)} className={cn(isSelected && 'bg-primary/8')}>
                  <span className="mr-2">{lang.flag}</span>
                  <span className="flex-1">{lang.nativeName}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </MenuItem>
              );
            })}
          </Menu>
        </div>
        <Button type="button" variant="text" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="filled" disabled={!isValid || isLoading} loading={isLoading}>
          {t('templates.createTemplate')}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateTemplateDialog({ open, onOpenChange, onSubmit, isLoading = false }: CreateTemplateDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" showClose={false}>
        <DialogHeader
          hero
          icon={<FileStack className="h-7 w-7" />}
          title={t('templates.form.title')}
          description={t('templates.form.description')}
          showClose
        />

        {open && <CreateTemplateForm key="create-template-form" onSubmit={onSubmit} onCancel={() => onOpenChange(false)} isLoading={isLoading} />}
      </DialogContent>
    </Dialog>
  );
}
