// CreateDistributionDialog - Dialog for creating email distributions
// M3 Expressive design with improved visual hierarchy and UX

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Users, Send, Calendar, Type, FileText, User, AtSign, Sparkles, Check, ChevronRight, Zap, PenLine, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Skeleton,
  Card,
  DatePicker,
  SelectionCard,
  SelectionCardIcon,
  SelectionCardLabel,
  SelectionCardDescription,
  SelectionCardGroup,
  IconContainer,
} from '@/components/ui';
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
  const { data: templatesResponse, isLoading: templatesLoading } = useEmailTemplates();

  // Memoize apiTemplates to prevent dependency array issues
  const apiTemplates = useMemo(() => templatesResponse?.items ?? [], [templatesResponse?.items]);

  // Template options for selector (API templates only)
  const templateOptions = useMemo(() => {
    return apiTemplates.map((t) => ({ id: t.id, name: t.name, subject: t.subject }));
  }, [apiTemplates]);

  // Fetch full template details when an API template is selected
  const isApiTemplate = useMemo(() => apiTemplates.some((t) => t.id === selectedTemplateId), [apiTemplates, selectedTemplateId]);
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
      // Body will be loaded when useEmailTemplate fetches the full template
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
      // Set subject immediately, body will load via useEffect when full template is fetched
      const apiTemplate = apiTemplates.find((t) => t.id === templateId);
      if (apiTemplate) {
        setSubject(apiTemplate.subject);
        // Body will be updated when useEmailTemplate fetches the full template
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
      const isApiTemplate = apiTemplates.some((t) => t.id === selectedTemplateId);

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
  }, [subject, body, recipients, selectedTemplateId, apiTemplates, senderName, senderEmail, sendOption, createDistribution, handleClose, onSuccess, t]);

  const isStep1Valid = recipients.length > 0;
  const isStep2Valid = subject.trim().length > 0 && body.trim().length > 0;
  const isStep3Valid = sendOption === 'now' || (sendOption === 'schedule' && scheduleDate);

  const canSubmit = isStep1Valid && isStep2Valid && isStep3Valid;

  // Get minimum date (today)
  const today = getToday();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size='xl' showClose={false}>
        <DialogHeader
          hero
          icon={<Mail className='h-7 w-7' />}
          title={t('createDistribution.title')}
          description={surveyTitle ? t('createDistribution.descriptionWithTitle', { title: surveyTitle }) : t('createDistribution.description')}
          showClose
        />

        {/* Progress Steps - M3 Expressive */}
        <div className='px-6 py-4 border-b border-outline-variant/30'>
          <div className='flex items-center gap-1 w-full'>
            {STEPS.map((s, index) => {
              const StepIcon = s.icon;
              const isActive = s.id === step;
              const isCompleted = s.id < step;
              const isLast = index === STEPS.length - 1;

              return (
                <div key={s.id} className='flex items-center flex-1'>
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
                      {isCompleted ? <Check className='w-5 h-5' /> : <StepIcon className='w-5 h-5' />}
                    </div>
                    <div className='hidden sm:block text-left'>
                      <div className={cn('text-sm font-medium', isActive ? 'text-on-primary-container' : 'text-on-surface-variant')}>{s.label}</div>
                      <div className={cn('text-xs', isActive ? 'text-on-primary-container/70' : 'text-on-surface-variant/60')}>{s.description}</div>
                    </div>
                  </button>

                  {/* Connector */}
                  {!isLast && (
                    <div className='flex-1 flex items-center px-2'>
                      <div className={cn('h-0.5 w-full rounded-full transition-colors duration-300', isCompleted ? 'bg-primary' : 'bg-outline-variant/30')} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogBody className='min-h-100'>
          {/* Step 1: Recipients */}
          {step === 1 && (
            <div className='space-y-5'>
              {/* Section Header */}
              <div className='flex items-center gap-3'>
                <IconContainer emphasis='emphasized' shape='rounded' variant='primary' icon={<Users />} />
                <div>
                  <h3 className='font-semibold text-on-surface'>{t('createDistribution.addRecipients')}</h3>
                  <p className='text-sm text-on-surface-variant'>{t('createDistribution.importOrAddManually')}</p>
                </div>
              </div>

              <RecipientImporter recipients={recipients} onChange={setRecipients} maxRecipients={10000} />

              {recipients.length === 0 && (
                <div className='flex flex-col items-center justify-center py-8 px-4'>
                  <IconContainer emphasis='maximum' shape='circle' variant='muted' icon={<AtSign />} className='mb-4' />
                  <h4 className='font-medium text-on-surface mb-1'>{t('createDistribution.noRecipientsYet')}</h4>
                  <p className='text-sm text-on-surface-variant text-center max-w-xs'>{t('createDistribution.noRecipientsDesc')}</p>
                </div>
              )}

              {recipients.length > 0 && (
                <Card variant='highlighted' padding='default'>
                  <div className='flex items-center gap-3'>
                    <IconContainer emphasis='standard' shape='rounded' variant='primary' icon={<Check />} />
                    <div className='flex-1'>
                      <div className='text-sm font-medium text-on-surface'>{t('createDistribution.recipientsAdded', { count: recipients.length })}</div>
                      <div className='text-xs text-on-surface-variant'>{t('createDistribution.readyToProceed')}</div>
                    </div>
                    <ChevronRight className='w-5 h-5 text-on-surface-variant' />
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Email Content */}
          {step === 2 && (
            <div className='space-y-6'>
              {/* Section Header */}
              <div className='flex items-center gap-3'>
                <IconContainer emphasis='emphasized' shape='rounded' variant='primary' icon={<PenLine />} />
                <div>
                  <h3 className='font-semibold text-on-surface'>{t('createDistribution.emailContent')}</h3>
                  <p className='text-sm text-on-surface-variant'>{t('createDistribution.customizeMessage')}</p>
                </div>
              </div>

              {/* Template Selection */}
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
                  <Sparkles className='w-4 h-4' />
                  {t('createDistribution.chooseTemplate')}
                </label>
                {templatesLoading ? (
                  <SelectionCardGroup columns={{ default: 3 }} gap={3}>
                    <Skeleton className='h-24 rounded-2xl' />
                    <Skeleton className='h-24 rounded-2xl' />
                    <Skeleton className='h-24 rounded-2xl' />
                  </SelectionCardGroup>
                ) : (
                  <SelectionCardGroup columns={{ default: 3 }} gap={3}>
                    {templateOptions.map((template) => {
                      const isSelected = selectedTemplateId === template.id;
                      return (
                        <SelectionCard
                          key={template.id}
                          isSelected={isSelected}
                          onClick={() => handleTemplateChange(template.id)}
                          size='md'
                          shape='rounded-2xl'
                          layout='vertical'
                          gap={2}
                          showRing
                        >
                          <SelectionCardIcon isSelected={isSelected} size='md'>
                            <FileText className='w-5 h-5' />
                          </SelectionCardIcon>
                          <SelectionCardLabel isSelected={isSelected}>{template.name}</SelectionCardLabel>
                        </SelectionCard>
                      );
                    })}
                  </SelectionCardGroup>
                )}
              </div>

              {/* Sender Info */}
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
                  <User className='w-4 h-4' />
                  {t('createDistribution.senderDetails')}
                  <span className='text-xs font-normal text-on-surface-variant'>({t('common.optional')})</span>
                </label>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Input
                    placeholder={t('createDistribution.namePlaceholder')}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    startIcon={<User className='w-4 h-4' />}
                  />
                  <Input
                    placeholder={t('createDistribution.emailPlaceholder')}
                    type='email'
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    startIcon={<Mail className='w-4 h-4' />}
                  />
                </div>
              </div>

              {/* Subject */}
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
                  <Type className='w-4 h-4' />
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
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
                  <FileText className='w-4 h-4' />
                  {t('createDistribution.emailBody')}
                </label>
                <Textarea
                  placeholder={t('createDistribution.bodyPlaceholder')}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className='font-mono text-sm'
                  error={body.trim().length === 0 ? t('createDistribution.bodyRequired') : undefined}
                />
                <p className='text-xs text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-xl'>
                  💡 {t('createDistribution.surveyLinkHint')}{' '}
                  <code className='bg-surface-container-high px-1.5 py-0.5 rounded font-mono text-xs'>{'{{surveyLink}}'}</code>
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className='space-y-6'>
              {/* Section Header */}
              <div className='flex items-center gap-3'>
                <IconContainer emphasis='emphasized' shape='rounded' variant='primary' icon={<Calendar />} />
                <div>
                  <h3 className='font-semibold text-on-surface'>{t('createDistribution.whenToSend')}</h3>
                  <p className='text-sm text-on-surface-variant'>{t('createDistribution.chooseWhenEmailsGoOut')}</p>
                </div>
              </div>

              {/* Send Options - Card Selection */}
              <SelectionCardGroup columns={{ default: 2 }} gap={4}>
                {/* Send Now Card */}
                <SelectionCard
                  isSelected={sendOption === 'now'}
                  onClick={() => setSendOption('now')}
                  size='lg'
                  shape='rounded-3xl'
                  layout='vertical'
                  gap={4}
                  showRing
                  className='text-center'
                >
                  <SelectionCardIcon isSelected={sendOption === 'now'} size='lg' className='w-16 h-16 rounded-2xl'>
                    <Zap className='w-8 h-8' />
                  </SelectionCardIcon>
                  <div>
                    <SelectionCardLabel isSelected={sendOption === 'now'} className='text-lg mb-1 block'>
                      {t('createDistribution.sendNow')}
                    </SelectionCardLabel>
                    <SelectionCardDescription>{t('createDistribution.deliverImmediately')}</SelectionCardDescription>
                  </div>
                </SelectionCard>

                {/* Schedule Card */}
                <SelectionCard
                  isSelected={sendOption === 'schedule'}
                  onClick={() => setSendOption('schedule')}
                  size='lg'
                  shape='rounded-3xl'
                  layout='vertical'
                  gap={4}
                  showRing
                  className='text-center'
                >
                  <SelectionCardIcon isSelected={sendOption === 'schedule'} size='lg' className='w-16 h-16 rounded-2xl'>
                    <Clock className='w-8 h-8' />
                  </SelectionCardIcon>
                  <div>
                    <SelectionCardLabel isSelected={sendOption === 'schedule'} className='text-lg mb-1 block'>
                      {t('createDistribution.scheduleLabel')}
                    </SelectionCardLabel>
                    <SelectionCardDescription>{t('createDistribution.pickDateTime')}</SelectionCardDescription>
                  </div>
                </SelectionCard>
              </SelectionCardGroup>

              {/* Schedule Date/Time Picker */}
              {sendOption === 'schedule' && (
                <Card variant='filled' padding='lg' shape='soft'>
                  <div className='space-y-4'>
                    <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
                      <Calendar className='w-4 h-4' />
                      {t('createDistribution.selectDateTime')}
                    </label>
                    <div className='grid grid-cols-2 gap-4'>
                      <DatePicker label={t('common.date')} value={scheduleDate || undefined} onChange={(date) => setScheduleDate(date || '')} minDate={today} />
                      <Input label={t('common.time')} type='time' value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                    </div>

                    {scheduleDate && (
                      <Card variant='highlighted' padding='default'>
                        <div className='flex items-center gap-3'>
                          <IconContainer emphasis='standard' shape='rounded' variant='primary' icon={<Calendar />} />
                          <div>
                            <p className='text-sm font-medium text-on-surface'>{t('createDistribution.scheduledFor')}</p>
                            <p className='text-sm text-on-surface-variant'>
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
                      </Card>
                    )}
                  </div>
                </Card>
              )}

              {/* Distribution Summary */}
              <Card variant='outlined' padding='lg' shape='soft'>
                <label className='text-sm font-semibold text-on-surface flex items-center gap-2 mb-4'>
                  <FileText className='w-4 h-4' />
                  {t('createDistribution.summary')}
                </label>
                <div className='grid grid-cols-3 gap-4'>
                  <Card variant='filled' padding='sm' shape='soft' className='text-center'>
                    <div className='text-2xl font-bold text-primary mb-1'>{recipients.length}</div>
                    <div className='text-xs text-on-surface-variant'>{t('createDistribution.summaryRecipients')}</div>
                  </Card>
                  <Card variant='filled' padding='sm' shape='soft' className='text-center'>
                    <div className='text-lg font-semibold text-on-surface mb-1 truncate px-2' title={subject}>
                      {subject ? subject.substring(0, 12) + (subject.length > 12 ? '...' : '') : '—'}
                    </div>
                    <div className='text-xs text-on-surface-variant'>{t('createDistribution.summarySubject')}</div>
                  </Card>
                  <Card variant='filled' padding='sm' shape='soft' className='text-center'>
                    <div className='text-lg font-semibold text-on-surface mb-1'>
                      {sendOption === 'now'
                        ? t('createDistribution.now')
                        : scheduleDate
                        ? new Date(scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </div>
                    <div className='text-xs text-on-surface-variant'>{t('createDistribution.summarySendTime')}</div>
                  </Card>
                </div>
              </Card>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          {step > 1 && (
            <Button variant='text' onClick={handleBack}>
              {t('common.back')}
            </Button>
          )}
          <div className='flex-1' />
          <Button variant='text' onClick={handleClose}>
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
                  <Send className='w-4 h-4 mr-2' />
                  {t('createDistribution.sendNow')}
                </>
              ) : (
                <>
                  <Calendar className='w-4 h-4 mr-2' />
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
