// CreateEmailTemplateDialog - Dialog for creating new email templates

import { useCallback, useState } from 'react';
import { Mail, FileText, Type, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, Button, Input, Select, toast } from '@/components/ui';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { createEmailTemplateSchema, type CreateEmailTemplateFormData } from '@/lib/validations';
import { useCreateEmailTemplate } from '@/hooks/queries/useEmailTemplates';
import { EmailTemplateType } from '@/types/enums';
import { LANGUAGES, getCurrentLanguage, type LanguageCode } from '@/i18n';
import type { CreateEmailTemplateRequest } from '@/types';

interface CreateEmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (templateId: string) => void;
}

// String type for form (zod schema uses strings)
type EmailTemplateTypeString = 'SurveyInvitation' | 'SurveyReminder' | 'ThankYou' | 'Custom';

const templateTypes: { value: EmailTemplateTypeString; label: string; description: string }[] = [
  { value: 'SurveyInvitation', label: 'Invitation', description: 'Initial survey invitation emails' },
  { value: 'SurveyReminder', label: 'Reminder', description: 'Follow-up reminder emails' },
  { value: 'ThankYou', label: 'Thank You', description: 'Post-completion thank you emails' },
  { value: 'Custom', label: 'Custom', description: 'Custom purpose templates' },
];

// Map string form values to numeric enum
const templateTypeStringToEnum: Record<EmailTemplateTypeString, EmailTemplateType> = {
  SurveyInvitation: EmailTemplateType.SurveyInvitation,
  SurveyReminder: EmailTemplateType.SurveyReminder,
  ThankYou: EmailTemplateType.ThankYou,
  Custom: EmailTemplateType.Custom,
};

const defaultTemplateContent: Record<EmailTemplateTypeString, { subject: string; htmlBody: string }> = {
  SurveyInvitation: {
    subject: 'You are invited to participate in our survey',
    htmlBody: `<p>Hello {{firstName}},</p>

<p>We would love to hear from you! Please take a few minutes to complete our survey.</p>

<p><a href="{{surveyLink}}">Click here to take the survey</a></p>

<p>Your feedback is important to us and will help us improve our services.</p>

<p>Thank you for your time!</p>

<p>Best regards,<br>{{senderName}}</p>`,
  },
  SurveyReminder: {
    subject: 'Reminder: We still want to hear from you',
    htmlBody: `<p>Hello {{firstName}},</p>

<p>This is a friendly reminder to complete our survey. We noticed you haven't had a chance to respond yet.</p>

<p><a href="{{surveyLink}}">Click here to take the survey</a></p>

<p>Your input is valuable and will only take a few minutes.</p>

<p>Thank you!</p>

<p>Best regards,<br>{{senderName}}</p>`,
  },
  ThankYou: {
    subject: 'Thank you for completing our survey',
    htmlBody: `<p>Hello {{firstName}},</p>

<p>Thank you for taking the time to complete our survey! Your feedback is greatly appreciated.</p>

<p>We will use your insights to improve our products and services.</p>

<p>Best regards,<br>{{senderName}}</p>`,
  },
  Custom: {
    subject: '',
    htmlBody: `<p>Hello {{firstName}},</p>

<p><a href="{{surveyLink}}">Take the survey</a></p>

<p>Best regards,<br>{{senderName}}</p>`,
  },
};

export function CreateEmailTemplateDialog({ open, onOpenChange, onSuccess }: CreateEmailTemplateDialogProps) {
  // Language state for localization
  const [languageCode, setLanguageCode] = useState<LanguageCode>(getCurrentLanguage());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateEmailTemplateFormData>({
    resolver: zodResolver(createEmailTemplateSchema),
    defaultValues: {
      name: '',
      type: 'SurveyInvitation',
    },
    mode: 'onChange',
  });

  const type = watch('type') as EmailTemplateTypeString;

  const createTemplate = useCreateEmailTemplate();

  const onFormSubmit: SubmitHandler<CreateEmailTemplateFormData> = useCallback(
    async (data) => {
      try {
        const formType = data.type as EmailTemplateTypeString;
        const defaultContent = defaultTemplateContent[formType];
        const requestData: CreateEmailTemplateRequest = {
          name: data.name.trim(),
          type: templateTypeStringToEnum[formType],
          subject: defaultContent.subject,
          htmlBody: defaultContent.htmlBody,
          languageCode,
        };

        const newTemplate = await createTemplate.mutateAsync(requestData);
        toast.success('Template created successfully');
        onSuccess?.(newTemplate.id);
        onOpenChange(false);
        reset();
      } catch (error) {
        console.error('Failed to create template:', error);
        toast.error('Failed to create template');
      }
    },
    [createTemplate, onSuccess, onOpenChange, reset, languageCode]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false);
      reset();
      setLanguageCode(getCurrentLanguage());
    }
  }, [isSubmitting, onOpenChange, reset]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="default" showClose={false}>
        <DialogHeader
          hero
          icon={<Mail className="h-7 w-7" />}
          title="Create Email Template"
          description="Create a new email template for your survey distributions."
          showClose
        />

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <DialogBody className="space-y-6">
            {/* Template Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Template Name</label>
              <Input
                {...register('name')}
                placeholder="e.g., Customer Satisfaction Survey Invite"
                startIcon={<Type className="h-4 w-4" />}
                error={errors.name?.message}
                autoFocus
              />
            </div>

            {/* Template Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Template Type</label>
              <Select
                value={type}
                onChange={(value) => setValue('type', value as EmailTemplateTypeString, { shouldValidate: true })}
                options={templateTypes.map((t) => ({
                  value: t.value,
                  label: t.label,
                }))}
              />
              <p className="text-xs text-on-surface-variant">{templateTypes.find((t) => t.value === type)?.description}</p>
            </div>

            {/* Preview hint */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-on-surface">Default content will be added</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    A starter template with common placeholders like {`{{firstName}}`}, {`{{surveyLink}}`}, and {`{{senderName}}`} will be created.
                    You can customize it in the editor.
                  </p>
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            {/* Language selector */}
            <div className="flex-1 flex items-center gap-2">
              <Globe className="h-4 w-4 text-on-surface-variant" />
              <Select
                value={languageCode}
                onChange={(value) => setLanguageCode(value as LanguageCode)}
                options={LANGUAGES.map((lang) => ({
                  value: lang.code,
                  label: lang.nativeName,
                }))}
                className="w-40"
              />
            </div>
            <Button type="button" variant="text" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid} loading={isSubmitting}>
              Create Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
