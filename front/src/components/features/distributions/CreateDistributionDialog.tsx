// CreateDistributionDialog - Dialog for creating email distributions
// M3 Expressive design with improved visual hierarchy and UX

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Users, Clock, Send, Calendar, Type, FileText, User, AtSign, Sparkles, Check, ChevronRight, Zap, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, Button, Input, Textarea, Skeleton, Card, DatePicker } from '@/components/ui';
import { RecipientImporter } from './RecipientImporter';
import { useCreateDistribution } from '@/hooks/queries/useDistributions';
import { useEmailTemplates, useEmailTemplate } from '@/hooks/queries/useEmailTemplates';
import { toast } from '@/components/ui';
import { getToday } from '@/utils';
import type { CreateDistributionRequest } from '@/types';

interface CreateDistributionDialogProps {
  surveyId: string;
  surveyTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Fallback templates when API templates are not available
const fallbackTemplates: { id: string; name: string; subject: string; htmlBody: string; icon: typeof Mail }[] = [
  {
    id: 'default',
    name: 'Default',
    subject: 'We would love your feedback',
    icon: Mail,
    htmlBody: `<p>Hello,</p>

<p>We're conducting a survey and would greatly appreciate your input. Your feedback helps us improve our services.</p>

<p><a href="{{surveyLink}}">Click here to take the survey</a></p>

<p>This survey should take about 5-10 minutes to complete.</p>

<p>Thank you for your time!</p>`,
  },
  {
    id: 'reminder',
    name: 'Reminder',
    subject: 'Reminder: Your feedback is valuable to us',
    icon: Clock,
    htmlBody: `<p>Hello,</p>

<p>We noticed you haven't completed our survey yet. We'd really appreciate if you could take a few minutes to share your thoughts.</p>  

<p><a href="{{surveyLink}}">Click here to take the survey</a></p>

<p>Your input is invaluable to us.</p>

<p>Best regards</p>`,
  },
  {
    id: 'formal',
    name: 'Formal',
    subject: 'Survey Invitation',
    icon: FileText,
    htmlBody: `<p>Dear Participant,</p>

<p>You have been selected to participate in our survey. Your responses will be kept confidential and will be used to improve our services.</p>

<p>Please click the link below to access the survey:</p>
<p><a href="{{surveyLink}}">{{surveyLink}}</a></p>

<p>We appreciate your participation.</p>

<p>Sincerely</p>`,
  },
];

type SendOption = 'now' | 'schedule';

export function CreateDistributionDialog({ surveyId, surveyTitle, open, onOpenChange, onSuccess }: CreateDistributionDialogProps) {
  const { t } = useTranslation();

  // Step configuration for the wizard
  const STEPS = useMemo(
    () =>
      [
        { id: 1, label: t('createDistribution.steps.recipients'), icon: Users, description: t('createDistribution.steps.recipientsDesc') },
        { id: 2, label: t('createDistribution.steps.content'), icon: PenLine, description: t('createDistribution.steps.contentDesc') },
        { id: 3, label: t('createDistribution.steps.schedule'), icon: Calendar, description: t('createDistribution.steps.scheduleDesc') },
      ] as const,
    [t]
  );

  const [step, setStep] = useState(1);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [sendOption, setSendOption] = useState<SendOption>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  // Track if template has been initialized to avoid re-initialization
  const templateInitializedRef = useRef(false);
  const prevSelectedApiTemplateRef = useRef<string | undefined>(undefined);

  // Fetch email templates from API
  const { data: apiTemplates, isLoading: templatesLoading } = useEmailTemplates();

  // Template options for selector (API templates + fallback)
  const templateOptions = useMemo(() => {
    const options: { id: string; name: string; subject: string; icon?: typeof Mail }[] = [];
    if (apiTemplates && apiTemplates.length > 0) {
      options.push(...apiTemplates.map((t) => ({ id: t.id, name: t.name, subject: t.subject })));
    }
    // Always add fallback templates as alternatives
    options.push(...fallbackTemplates.map((t) => ({ id: t.id, name: t.name, subject: t.subject, icon: t.icon })));
    return options;
  }, [apiTemplates]);

  // Fetch full template details when an API template is selected
  const isApiTemplate = useMemo(() => apiTemplates?.some((t) => t.id === selectedTemplateId) ?? false, [apiTemplates, selectedTemplateId]);
  const { data: selectedApiTemplate } = useEmailTemplate(isApiTemplate ? selectedTemplateId ?? undefined : undefined);

  // Initialize with first template when templates load
  // Using ref to prevent re-initialization and event-based state update
  useEffect(() => {
    if (templateOptions.length > 0 && !templateInitializedRef.current) {
      templateInitializedRef.current = true;
      const firstTemplate = templateOptions[0];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- One-time initialization when templates load, guarded by ref
      setSelectedTemplateId(firstTemplate.id);
      setSubject(firstTemplate.subject);
      const fallback = fallbackTemplates.find((t) => t.id === firstTemplate.id);
      if (fallback) {
        setBody(fallback.htmlBody);
      }
    }
  }, [templateOptions]);

  // Update body when full API template is loaded
  useEffect(() => {
    if (selectedApiTemplate && prevSelectedApiTemplateRef.current !== selectedApiTemplate.id) {
      prevSelectedApiTemplateRef.current = selectedApiTemplate.id;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing state with fetched API data, guarded by ref to prevent loops
      setBody(selectedApiTemplate.htmlBody || '');
    }
  }, [selectedApiTemplate]);

  const createDistribution = useCreateDistribution(surveyId);

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      setSelectedTemplateId(templateId);
      // Check if it's a fallback template first (for immediate feedback)
      const fallback = fallbackTemplates.find((t) => t.id === templateId);
      if (fallback) {
        setSubject(fallback.subject);
        setBody(fallback.htmlBody);
      } else {
        // For API template, set subject immediately, body will load via useEffect
        const apiTemplate = apiTemplates?.find((t) => t.id === templateId);
        if (apiTemplate) {
          setSubject(apiTemplate.subject);
          // Body will be updated when useEmailTemplate fetches the full template
        }
      }
    },
    [apiTemplates]
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset form after animation
    setTimeout(() => {
      setStep(1);
      setRecipients([]);
      setSelectedTemplateId(null);
      setSubject('');
      setBody('');
      setSenderName('');
      setSenderEmail('');
      setSendOption('now');
      setScheduleDate('');
      setScheduleTime('09:00');
      templateInitializedRef.current = false;
    }, 300);
  }, [onOpenChange]);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, 3));
  }, []);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      // Determine if this is an API template or fallback template
      const isApiTemplate = apiTemplates?.some((t) => t.id === selectedTemplateId);

      // Convert email strings to RecipientInput format
      const recipientInputs = recipients.map((email) => ({ email }));

      const data: CreateDistributionRequest = {
        subject,
        body,
        recipients: recipientInputs,
        emailTemplateId: isApiTemplate ? selectedTemplateId ?? undefined : undefined,
        senderName: senderName.trim() || undefined,
        senderEmail: senderEmail.trim() || undefined,
      };

      await createDistribution.mutateAsync(data);

      toast.success(sendOption === 'schedule' ? t('createDistribution.scheduleSuccess') : t('createDistribution.createSuccess'));

      handleClose();
      onSuccess?.();
    } catch {
      toast.error(t('createDistribution.createError'));
    }
  }, [
    subject,
    body,
    recipients,
    selectedTemplateId,
    apiTemplates,
    senderName,
    senderEmail,
    sendOption,
    scheduleDate,
    scheduleTime,
    createDistribution,
    handleClose,
    onSuccess,
  ]);

  const isStep1Valid = recipients.length > 0;
  const isStep2Valid = subject.trim().length > 0 && body.trim().length > 0;
  const isStep3Valid = sendOption === 'now' || (sendOption === 'schedule' && scheduleDate);

  const canSubmit = isStep1Valid && isStep2Valid && isStep3Valid;

  // Get minimum date (today)
  const today = getToday();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" showClose={false}>
        <DialogHeader
          hero
          icon={<Mail className="h-7 w-7" />}
          title={t('createDistribution.title')}
          description={surveyTitle ? t('createDistribution.descriptionWithTitle', { title: surveyTitle }) : t('createDistribution.description')}
          showClose
        />

        {/* Progress Steps - M3 Expressive */}
        <div className="px-6 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-1 w-full">
            {STEPS.map((s, index) => {
              const StepIcon = s.icon;
              const isActive = s.id === step;
              const isCompleted = s.id < step;
              const isLast = index === STEPS.length - 1;

              return (
                <div key={s.id} className="flex items-center flex-1">
                  {/* Step indicator */}
                  <button
                    onClick={() => (isCompleted ? setStep(s.id) : undefined)}
                    disabled={!isCompleted}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-300',
                      isActive && 'bg-primary-container',
                      isCompleted && 'hover:bg-surface-container-high cursor-pointer',
                      !isActive && !isCompleted && 'opacity-60'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300',
                        isActive && 'bg-primary text-on-primary',
                        isCompleted && 'bg-primary/20 text-primary',
                        !isActive && !isCompleted && 'bg-surface-container-high text-on-surface-variant'
                      )}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className={cn('text-sm font-medium', isActive ? 'text-on-primary-container' : 'text-on-surface-variant')}>{s.label}</div>
                      <div className={cn('text-xs', isActive ? 'text-on-primary-container/70' : 'text-on-surface-variant/60')}>{s.description}</div>
                    </div>
                  </button>

                  {/* Connector */}
                  {!isLast && (
                    <div className="flex-1 flex items-center px-2">
                      <div
                        className={cn(
                          'h-0.5 w-full rounded-full transition-colors duration-300',
                          isCompleted ? 'bg-primary' : 'bg-outline-variant/30'
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogBody className="min-h-100">
          {/* Step 1: Recipients */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">{t('createDistribution.addRecipients')}</h3>
                  <p className="text-sm text-on-surface-variant">{t('createDistribution.importOrAddManually')}</p>
                </div>
              </div>

              <RecipientImporter recipients={recipients} onChange={setRecipients} maxRecipients={10000} />

              {recipients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                    <AtSign className="w-10 h-10 text-on-surface-variant/50" />
                  </div>
                  <h4 className="font-medium text-on-surface mb-1">{t('createDistribution.noRecipientsYet')}</h4>
                  <p className="text-sm text-on-surface-variant text-center max-w-xs">{t('createDistribution.noRecipientsDesc')}</p>
                </div>
              )}

              {recipients.length > 0 && (
                <Card variant="highlighted" padding="default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-on-surface">
                        {t('createDistribution.recipientsAdded', { count: recipients.length })}
                      </div>
                      <div className="text-xs text-on-surface-variant">{t('createDistribution.readyToProceed')}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Email Content */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <PenLine className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">{t('createDistribution.emailContent')}</h3>
                  <p className="text-sm text-on-surface-variant">{t('createDistribution.customizeMessage')}</p>
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t('createDistribution.chooseTemplate')}
                </label>
                {templatesLoading ? (
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {templateOptions.map((template) => {
                      const isSelected = selectedTemplateId === template.id;
                      const fallback = fallbackTemplates.find((t) => t.id === template.id);
                      const TemplateIcon = fallback?.icon || FileText;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateChange(template.id)}
                          className={cn(
                            'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
                            isSelected
                              ? 'border-primary bg-primary-container/30 ring-1 ring-primary/20'
                              : 'border-outline-variant/30 bg-surface hover:border-primary/50 hover:bg-surface-container/50'
                          )}
                        >
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                              isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                            )}
                          >
                            <TemplateIcon className="w-5 h-5" />
                          </div>
                          <span className={cn('text-sm font-medium', isSelected ? 'text-primary' : 'text-on-surface')}>{template.name}</span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-on-primary" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sender Info */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('createDistribution.senderDetails')}
                  <span className="text-xs font-normal text-on-surface-variant">({t('common.optional')})</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder={t('createDistribution.namePlaceholder')}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    startIcon={<User className="w-4 h-4" />}
                  />
                  <Input
                    placeholder={t('createDistribution.emailPlaceholder')}
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    startIcon={<Mail className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  {t('createDistribution.subjectLine')}
                </label>
                <Input
                  placeholder={t('createDistribution.subjectPlaceholder')}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  error={subject.trim().length === 0 ? t('createDistribution.subjectRequired') : undefined}
                />
              </div>

              {/* Body */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('createDistribution.emailBody')}
                </label>
                <Textarea
                  placeholder={t('createDistribution.bodyPlaceholder')}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                  error={body.trim().length === 0 ? t('createDistribution.bodyRequired') : undefined}
                />
                <p className="text-xs text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-xl">
                  💡 {t('createDistribution.surveyLinkHint')}{' '}
                  <code className="bg-surface-container-high px-1.5 py-0.5 rounded font-mono text-xs">{'{{surveyLink}}'}</code>
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">{t('createDistribution.whenToSend')}</h3>
                  <p className="text-sm text-on-surface-variant">{t('createDistribution.chooseWhenEmailsGoOut')}</p>
                </div>
              </div>

              {/* Send Options - Card Selection */}
              <div className="grid grid-cols-2 gap-4">
                {/* Send Now Card */}
                <button
                  onClick={() => setSendOption('now')}
                  className={cn(
                    'relative flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-200 text-center',
                    sendOption === 'now'
                      ? 'border-primary bg-primary-container/30 ring-1 ring-primary/20'
                      : 'border-outline-variant/30 bg-surface hover:border-primary/50 hover:bg-surface-container/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
                      sendOption === 'now' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                    )}
                  >
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <div className={cn('text-lg font-semibold mb-1', sendOption === 'now' ? 'text-primary' : 'text-on-surface')}>
                      {t('createDistribution.sendNow')}
                    </div>
                    <div className="text-sm text-on-surface-variant">{t('createDistribution.deliverImmediately')}</div>
                  </div>
                  {sendOption === 'now' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-on-primary" />
                    </div>
                  )}
                </button>

                {/* Schedule Card */}
                <button
                  onClick={() => setSendOption('schedule')}
                  className={cn(
                    'relative flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-200 text-center',
                    sendOption === 'schedule'
                      ? 'border-primary bg-primary-container/30 ring-1 ring-primary/20'
                      : 'border-outline-variant/30 bg-surface hover:border-primary/50 hover:bg-surface-container/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
                      sendOption === 'schedule' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                    )}
                  >
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <div className={cn('text-lg font-semibold mb-1', sendOption === 'schedule' ? 'text-primary' : 'text-on-surface')}>
                      {t('createDistribution.scheduleLabel')}
                    </div>
                    <div className="text-sm text-on-surface-variant">{t('createDistribution.pickDateTime')}</div>
                  </div>
                  {sendOption === 'schedule' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-on-primary" />
                    </div>
                  )}
                </button>
              </div>

              {/* Schedule Date/Time Picker */}
              {sendOption === 'schedule' && (
                <div className="space-y-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                  <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('createDistribution.selectDateTime')}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <DatePicker
                      label={t('common.date')}
                      value={scheduleDate || undefined}
                      onChange={(date) => setScheduleDate(date || '')}
                      minDate={today}
                    />
                    <Input label={t('common.time')} type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                  </div>

                  {scheduleDate && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{t('createDistribution.scheduledFor')}</p>
                        <p className="text-sm text-on-surface-variant">
                          {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Distribution Summary */}
              <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4" />
                  {t('createDistribution.summary')}
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl bg-surface-container-low">
                    <div className="text-2xl font-bold text-primary mb-1">{recipients.length}</div>
                    <div className="text-xs text-on-surface-variant">{t('createDistribution.summaryRecipients')}</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface-container-low">
                    <div className="text-lg font-semibold text-on-surface mb-1 truncate px-2" title={subject}>
                      {subject ? subject.substring(0, 12) + (subject.length > 12 ? '...' : '') : '—'}
                    </div>
                    <div className="text-xs text-on-surface-variant">{t('createDistribution.summarySubject')}</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface-container-low">
                    <div className="text-lg font-semibold text-on-surface mb-1">
                      {sendOption === 'now'
                        ? t('createDistribution.now')
                        : scheduleDate
                        ? new Date(scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </div>
                    <div className="text-xs text-on-surface-variant">{t('createDistribution.summarySendTime')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          {step > 1 && (
            <Button variant="text" onClick={handleBack}>
              {t('common.back')}
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="text" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext} disabled={step === 1 && !isStep1Valid}>
              {t('common.continue')}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canSubmit || createDistribution.isPending}>
              {createDistribution.isPending ? (
                t('createDistribution.creating')
              ) : sendOption === 'now' ? (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('createDistribution.sendNow')}
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('createDistribution.scheduleLabel')}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
