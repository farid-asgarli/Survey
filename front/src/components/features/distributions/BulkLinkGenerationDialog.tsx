import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Link2, Tag, ChevronDown, ChevronUp, Info, Copy, Check } from 'lucide-react';
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
import { useGenerateBulkLinks } from '@/hooks/queries/useLinks';
import { toast } from '@/components/ui';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { bulkLinkSchema, type BulkLinkFormData } from '@/lib/validations';
import { getTomorrow, generateDateFilename } from '@/utils';
import type { BulkLinkGenerationRequest, SurveyLink } from '@/types';

interface BulkLinkGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: string;
  surveyTitle?: string;
}

function GeneratedLinksView({ links, onClose }: { links: SurveyLink[]; onClose: () => void }) {
  const { t } = useTranslation();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error(t('bulkLinkDialog.toast.copyFailed'));
    }
  };

  const handleCopyAll = async () => {
    try {
      const allUrls = links.map((link) => link.fullUrl).join('\n');
      await navigator.clipboard.writeText(allUrls);
      toast.success(t('bulkLinkDialog.toast.allCopied'));
    } catch {
      toast.error(t('bulkLinkDialog.toast.copyFailed'));
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Token', 'URL'];
    const rows = links.map((link) => [link.token, link.fullUrl]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = generateDateFilename('bulk-links', 'csv');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    toast.success(t('bulkLinkDialog.toast.downloaded'));
  };

  return (
    <>
      <DialogBody>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">{t('bulkLinkDialog.generatedCount', { count: links.length })}</p>
            <div className="flex items-center gap-2">
              <Button variant="text" size="sm" onClick={handleCopyAll}>
                <Copy className="w-4 h-4 mr-1.5" />
                {t('bulkLinkDialog.copyAll')}
              </Button>
              <Button variant="tonal" size="sm" onClick={handleDownloadCSV}>
                <Download className="w-4 h-4 mr-1.5" />
                {t('bulkLinkDialog.downloadCSV')}
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {links.map((link, index) => (
              <div key={link.id} className="flex items-center gap-2 p-2 bg-surface-container rounded-xl group">
                <code className="flex-1 text-xs text-on-surface-variant truncate">{link.fullUrl}</code>
                <Button
                  variant="text"
                  size="icon-sm"
                  onClick={() => handleCopy(link.fullUrl, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedIndex === index ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button onClick={onClose}>{t('common.done')}</Button>
      </DialogFooter>
    </>
  );
}

export function BulkLinkGenerationDialog({ open, onOpenChange, surveyId, surveyTitle }: BulkLinkGenerationDialogProps) {
  const { t } = useTranslation();

  // Toggle states (UI only - not part of form data)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enableExpiration, setEnableExpiration] = useState(false);
  const [enableUTM, setEnableUTM] = useState(false);

  // Generated links state
  const [generatedLinks, setGeneratedLinks] = useState<SurveyLink[] | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BulkLinkFormData>({
    resolver: zodResolver(bulkLinkSchema),
    defaultValues: {
      count: '10',
      namePrefix: '',
      expiresAt: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
    },
    mode: 'onChange',
  });

  const namePrefix = watch('namePrefix');
  const expiresAt = watch('expiresAt');

  const generateMutation = useGenerateBulkLinks(surveyId);

  const resetForm = useCallback(() => {
    reset();
    setShowAdvanced(false);
    setEnableExpiration(false);
    setEnableUTM(false);
    setGeneratedLinks(null);
  }, [reset]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const onFormSubmit: SubmitHandler<BulkLinkFormData> = async (data) => {
    const countNum = parseInt(data.count, 10);

    try {
      const request: BulkLinkGenerationRequest = {
        count: countNum,
        ...(data.namePrefix ? { namePrefix: data.namePrefix } : {}),
        ...(enableExpiration && data.expiresAt ? { expiresAt: new Date(data.expiresAt).toISOString() } : {}),
      };

      // Add UTM parameters
      if (enableUTM) {
        if (data.utmSource) request.source = data.utmSource;
        if (data.utmMedium) request.medium = data.utmMedium;
        if (data.utmCampaign) request.campaign = data.utmCampaign;
      }

      const result = await generateMutation.mutateAsync(request);
      setGeneratedLinks(result.links);
      toast.success(t('bulkLinkDialog.toast.generated', { count: result.generatedCount }));
    } catch (error) {
      toast.error(t('bulkLinkDialog.toast.error'));
      console.error('Error generating bulk links:', error);
    }
  };

  // Calculate minimum date for expiration (tomorrow)
  const minDateString = getTomorrow();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" showClose={false}>
        <DialogHeader
          hero
          icon={<Link2 className="h-7 w-7" />}
          title={t('bulkLinkDialog.title')}
          description={surveyTitle ? t('bulkLinkDialog.descriptionWithTitle', { title: surveyTitle }) : t('bulkLinkDialog.description')}
          showClose
        />

        {generatedLinks ? (
          <GeneratedLinksView links={generatedLinks} onClose={handleClose} />
        ) : (
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <DialogBody className="space-y-6">
              {/* Count Input */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">{t('bulkLinkDialog.numberOfLinks')}</label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  placeholder={t('bulkLinkDialog.numberOfLinksPlaceholder')}
                  {...register('count')}
                  error={errors.count?.message}
                  required
                />
                <p className="text-xs text-on-surface-variant mt-1">{t('bulkLinkDialog.numberOfLinksHint')}</p>
              </div>

              {/* Name Prefix */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">{t('bulkLinkDialog.namePrefix')}</label>
                <Input placeholder={t('bulkLinkDialog.namePrefixPlaceholder')} {...register('namePrefix')} />
                <p className="text-xs text-on-surface-variant mt-1">{t('bulkLinkDialog.namePrefixHint', { prefix: namePrefix || 'Link' })}</p>
              </div>

              {/* Expiration */}
              <Card variant="outlined" className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container">
                        <Tag className="w-4 h-4 text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t('bulkLinkDialog.expirationDate')}</p>
                        <p className="text-xs text-on-surface-variant">{t('bulkLinkDialog.expirationDateDescription')}</p>
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

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {t('bulkLinkDialog.advancedOptions')}
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
                              {t('bulkLinkDialog.utmParameters')}
                              <Tooltip content={t('bulkLinkDialog.utmTooltip')}>
                                <Info className="w-3.5 h-3.5 text-on-surface-variant" />
                              </Tooltip>
                            </p>
                            <p className="text-xs text-on-surface-variant">{t('bulkLinkDialog.utmDescription')}</p>
                          </div>
                        </div>
                        <Switch checked={enableUTM} onChange={(e) => setEnableUTM(e.target.checked)} />
                      </div>
                      {enableUTM && (
                        <div className="space-y-3 pl-12">
                          <Input
                            placeholder={t('bulkLinkDialog.utmSourcePlaceholder')}
                            {...register('utmSource')}
                            size="sm"
                            label={t('bulkLinkDialog.utmSource')}
                          />
                          <Input
                            placeholder={t('bulkLinkDialog.utmMediumPlaceholder')}
                            {...register('utmMedium')}
                            size="sm"
                            label={t('bulkLinkDialog.utmMedium')}
                          />
                          <Input
                            placeholder={t('bulkLinkDialog.utmCampaignPlaceholder')}
                            {...register('utmCampaign')}
                            size="sm"
                            label={t('bulkLinkDialog.utmCampaign')}
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
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? t('bulkLinkDialog.generating') : t('bulkLinkDialog.generate')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
