import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Sparkles, Code, Calendar, Lock, Users, Link2, Tag, ChevronDown, ChevronUp, Info, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Switch,
  Tooltip,
  Card,
  CardContent,
  DatePicker,
} from '@/components/ui';
import { useCreateLink } from '@/hooks/queries/useLinks';
import { toast } from '@/components/ui';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { createLinkSchema, linkTypeStringToEnum, type CreateLinkFormData } from '@/lib/validations';
import { getTomorrow, toISOTimestamp } from '@/utils';
import type { CreateLinkRequest } from '@/types';
import { cn } from '@/lib/utils';

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: string;
  surveyTitle?: string;
}

// String type for form values
type LinkTypeString = 'Public' | 'Unique' | 'Embedded';

function LinkTypeSelector({ value, onChange }: { value: LinkTypeString; onChange: (type: LinkTypeString) => void }) {
  const { t } = useTranslation();

  const linkTypes = useMemo(
    () => [
      {
        value: 'Public' as LinkTypeString,
        label: t('createLinkDialog.types.standard'),
        icon: Globe,
        description: t('createLinkDialog.types.standardDescription'),
        color: 'bg-primary-container text-on-primary-container border-primary/30',
      },
      {
        value: 'Unique' as LinkTypeString,
        label: t('createLinkDialog.types.unique'),
        icon: Sparkles,
        description: t('createLinkDialog.types.uniqueDescription'),
        color: 'bg-tertiary-container text-on-tertiary-container border-tertiary/30',
      },
      {
        value: 'Embedded' as LinkTypeString,
        label: t('createLinkDialog.types.embedded'),
        icon: Code,
        description: t('createLinkDialog.types.embeddedDescription'),
        color: 'bg-secondary-container text-on-secondary-container border-secondary/30',
      },
    ],
    [t]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {linkTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              'relative p-5 rounded-2xl border-2 text-left transition-all duration-200',
              isSelected
                ? `${type.color} border-current ring-2 ring-current/30`
                : 'bg-surface border-outline-variant hover:border-outline hover:bg-surface-container-lowest'
            )}
          >
            {/* Checkmark indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-current/20 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  isSelected ? 'bg-surface-container-lowest/30' : 'bg-surface-container'
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">{type.label}</h4>
                <p className={cn('text-xs leading-relaxed', isSelected ? 'opacity-85' : 'text-on-surface-variant')}>{type.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function CreateLinkDialog({ open, onOpenChange, surveyId, surveyTitle }: CreateLinkDialogProps) {
  const { t } = useTranslation();

  // Toggle states (UI only - not part of form data)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enableExpiration, setEnableExpiration] = useState(false);
  const [enableMaxResponses, setEnableMaxResponses] = useState(false);
  const [enablePassword, setEnablePassword] = useState(false);
  const [enableUTM, setEnableUTM] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<CreateLinkFormData>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      linkType: 'Public',
      maxResponses: '',
      expiresAt: '',
      password: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
    },
  });

  const linkType = watch('linkType');
  const expiresAt = watch('expiresAt');

  const createMutation = useCreateLink(surveyId);

  const resetForm = useCallback(() => {
    reset();
    setShowAdvanced(false);
    setEnableExpiration(false);
    setEnableMaxResponses(false);
    setEnablePassword(false);
    setEnableUTM(false);
  }, [reset]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const onFormSubmit: SubmitHandler<CreateLinkFormData> = async (data) => {
    try {
      // Convert string linkType to numeric enum
      const linkTypeValue = linkTypeStringToEnum[data.linkType];

      const request: CreateLinkRequest = {
        type: linkTypeValue,
        ...(enableMaxResponses && data.maxResponses ? { maxResponses: parseInt(data.maxResponses, 10) } : {}),
        ...(enableExpiration && data.expiresAt ? { expiresAt: toISOTimestamp(data.expiresAt) } : {}),
        ...(enablePassword && data.password ? { password: data.password } : {}),
      };

      // Add UTM parameters as separate fields (supported by backend)
      if (enableUTM) {
        if (data.utmSource) request.source = data.utmSource;
        if (data.utmMedium) request.medium = data.utmMedium;
        if (data.utmCampaign) request.campaign = data.utmCampaign;
      }

      await createMutation.mutateAsync(request);
      toast.success(t('createLinkDialog.toast.success'));
      handleClose();
    } catch (error) {
      toast.error(t('createLinkDialog.toast.error'));
      console.error('Error creating link:', error);
    }
  };

  // Calculate minimum date for expiration (tomorrow)
  const minDateString = getTomorrow();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="flex flex-col" showClose={false}>
        <DialogHeader
          hero
          icon={<Link2 className="h-7 w-7" />}
          title={t('createLinkDialog.title')}
          description={surveyTitle ? t('createLinkDialog.descriptionWithTitle', { title: surveyTitle }) : t('createLinkDialog.description')}
          showClose
        />

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <DialogBody className="space-y-6">
            {/* Link Type Selection */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-3">{t('createLinkDialog.linkType')}</label>
              <LinkTypeSelector value={linkType} onChange={(type) => setValue('linkType', type)} />
            </div>

            {/* Basic Settings */}
            <div className="space-y-4">
              {/* Expiration */}
              <Card variant="outlined" className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container">
                        <Calendar className="w-4 h-4 text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t('createLinkDialog.expirationDate')}</p>
                        <p className="text-xs text-on-surface-variant">{t('createLinkDialog.expirationDateDescription')}</p>
                      </div>
                    </div>
                    <Switch checked={enableExpiration} onChange={(e) => setEnableExpiration(e.target.checked)} />
                  </div>
                  {enableExpiration && (
                    <div className="mt-4 pl-12">
                      <DatePicker value={expiresAt || undefined} onChange={(date) => setValue('expiresAt', date || '')} minDate={minDateString} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Max Responses */}
              <Card variant="outlined" className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container">
                        <Users className="w-4 h-4 text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t('createLinkDialog.responseLimit')}</p>
                        <p className="text-xs text-on-surface-variant">{t('createLinkDialog.responseLimitDescription')}</p>
                      </div>
                    </div>
                    <Switch checked={enableMaxResponses} onChange={(e) => setEnableMaxResponses(e.target.checked)} />
                  </div>
                  {enableMaxResponses && (
                    <div className="mt-4 pl-12">
                      <Input
                        type="number"
                        min={1}
                        placeholder={t('createLinkDialog.maxResponsesPlaceholder')}
                        {...register('maxResponses')}
                        size="sm"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Protection */}
              <Card variant="outlined" className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container">
                        <Lock className="w-4 h-4 text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t('createLinkDialog.passwordProtection')}</p>
                        <p className="text-xs text-on-surface-variant">{t('createLinkDialog.passwordProtectionDescription')}</p>
                      </div>
                    </div>
                    <Switch checked={enablePassword} onChange={(e) => setEnablePassword(e.target.checked)} />
                  </div>
                  {enablePassword && (
                    <div className="mt-4 pl-12">
                      <Input type="password" placeholder={t('createLinkDialog.passwordPlaceholder')} {...register('password')} size="sm" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {t('createLinkDialog.advancedOptions')}
            </button>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* UTM Parameters */}
                <Card variant="outlined" className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container">
                          <Tag className="w-4 h-4 text-on-surface-variant" />
                        </div>
                        <div>
                          <p className="font-medium text-sm flex items-center gap-1.5">
                            {t('createLinkDialog.utmParameters')}
                            <Tooltip content={t('createLinkDialog.utmTooltip')}>
                              <Info className="w-3.5 h-3.5 text-on-surface-variant" />
                            </Tooltip>
                          </p>
                          <p className="text-xs text-on-surface-variant">{t('createLinkDialog.utmDescription')}</p>
                        </div>
                      </div>
                      <Switch checked={enableUTM} onChange={(e) => setEnableUTM(e.target.checked)} />
                    </div>
                    {enableUTM && (
                      <div className="space-y-3 pl-12">
                        <Input
                          placeholder={t('createLinkDialog.utmSourcePlaceholder')}
                          {...register('utmSource')}
                          size="sm"
                          label={t('createLinkDialog.utmSource')}
                        />
                        <Input
                          placeholder={t('createLinkDialog.utmMediumPlaceholder')}
                          {...register('utmMedium')}
                          size="sm"
                          label={t('createLinkDialog.utmMedium')}
                        />
                        <Input
                          placeholder={t('createLinkDialog.utmCampaignPlaceholder')}
                          {...register('utmCampaign')}
                          size="sm"
                          label={t('createLinkDialog.utmCampaign')}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="text" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('createLinkDialog.creating') : t('createLinkDialog.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
