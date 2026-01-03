import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Globe, Info, AlertCircle, Users, Mail, Bell, CalendarClock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  DatePicker,
  Textarea,
  Select,
  Checkbox,
} from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { formatDateForInput, getToday, getUserTimezone, isValidTimeFormat, toISOTimestamp, isPast } from '@/utils';
import { SurveyStatus, RecurrencePattern, AudienceType } from '@/types/enums';
import type { RecurringSurvey, DayOfWeek, CreateRecurringSurveyRequest, UpdateRecurringSurveyRequest, Survey } from '@/types';

interface RecurringScheduleEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurringSurvey?: RecurringSurvey; // If provided, edit mode
  surveys?: Survey[]; // Available surveys to select from (for create mode)
  onSubmit: (data: CreateRecurringSurveyRequest | UpdateRecurringSurveyRequest) => Promise<void>;
  isLoading?: boolean;
}

// Helper function to get localized pattern options
function usePatternOptions(): SelectOption[] {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { value: String(RecurrencePattern.Daily), label: t('recurringSurveys.form.daily') },
      { value: String(RecurrencePattern.Weekly), label: t('recurringSurveys.form.weekly') },
      { value: String(RecurrencePattern.BiWeekly), label: t('recurringSurveys.form.biWeekly') },
      { value: String(RecurrencePattern.Monthly), label: t('recurringSurveys.form.monthly') },
      { value: String(RecurrencePattern.Quarterly), label: t('recurringSurveys.form.quarterly') },
      { value: String(RecurrencePattern.Custom), label: t('recurringSurveys.form.custom') },
    ],
    [t]
  );
}

// Helper function to get localized day of week options
function useDayOfWeekOptions() {
  const { t } = useTranslation();
  return useMemo(
    () =>
      [
        { value: 0, label: t('recurringSurveys.form.daysOfWeek.sun') },
        { value: 1, label: t('recurringSurveys.form.daysOfWeek.mon') },
        { value: 2, label: t('recurringSurveys.form.daysOfWeek.tue') },
        { value: 3, label: t('recurringSurveys.form.daysOfWeek.wed') },
        { value: 4, label: t('recurringSurveys.form.daysOfWeek.thu') },
        { value: 5, label: t('recurringSurveys.form.daysOfWeek.fri') },
        { value: 6, label: t('recurringSurveys.form.daysOfWeek.sat') },
      ] as const,
    [t]
  );
}

const dayOfMonthOptions: SelectOption[] = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: `Day ${i + 1}`,
}));

// Helper function to get localized audience type options
function useAudienceTypeOptions(): SelectOption[] {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { value: String(AudienceType.StaticList), label: t('recurringSurveys.form.audienceType.staticList') },
      { value: String(AudienceType.AllContacts), label: t('recurringSurveys.form.audienceType.allContacts') },
    ],
    [t]
  );
}

// Helper function to get localized timezone options
function useTimezoneOptions(): SelectOption[] {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { value: 'UTC', label: t('recurringSurveys.form.timezones.utc') },
      { value: 'America/New_York', label: t('recurringSurveys.form.timezones.eastern') },
      { value: 'America/Chicago', label: t('recurringSurveys.form.timezones.central') },
      { value: 'America/Denver', label: t('recurringSurveys.form.timezones.mountain') },
      { value: 'America/Los_Angeles', label: t('recurringSurveys.form.timezones.pacific') },
      { value: 'Europe/London', label: t('recurringSurveys.form.timezones.london') },
      { value: 'Europe/Paris', label: t('recurringSurveys.form.timezones.paris') },
      { value: 'Europe/Berlin', label: t('recurringSurveys.form.timezones.berlin') },
      { value: 'Asia/Tokyo', label: t('recurringSurveys.form.timezones.tokyo') },
      { value: 'Asia/Shanghai', label: t('recurringSurveys.form.timezones.shanghai') },
      { value: 'Asia/Singapore', label: t('recurringSurveys.form.timezones.singapore') },
      { value: 'Australia/Sydney', label: t('recurringSurveys.form.timezones.sydney') },
    ],
    [t]
  );
}

// Get browser timezone
function getBrowserTimezone(): string {
  return getUserTimezone();
}

// Validate time format (HH:mm or HH:mm:ss)
function isValidTime(time: string): boolean {
  return isValidTimeFormat(time);
}

// Convert sendTime to display format (HH:mm)
function formatTimeForDisplay(time?: string): string {
  if (!time) return '09:00';
  // Remove seconds if present
  return time.slice(0, 5);
}

// Inner form component that gets remounted when key changes to reset state
function RecurringScheduleForm({
  recurringSurvey,
  surveys,
  onSubmit,
  isLoading,
  onCancel,
}: {
  recurringSurvey?: RecurringSurvey;
  surveys?: Survey[];
  onSubmit: (data: CreateRecurringSurveyRequest | UpdateRecurringSurveyRequest) => Promise<void>;
  isLoading?: boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const isEditMode = !!recurringSurvey;

  // Get localized options
  const patternOptions = usePatternOptions();
  const dayOfWeekOptions = useDayOfWeekOptions();
  const audienceTypeOptions = useAudienceTypeOptions();
  const timezoneOptions = useTimezoneOptions();

  // Initialize form state from recurringSurvey or defaults
  const [surveyId, setSurveyId] = useState(() => recurringSurvey?.surveyId ?? '');
  const [name, setName] = useState(() => recurringSurvey?.name ?? '');
  const [pattern, setPattern] = useState<RecurrencePattern>(() => recurringSurvey?.pattern ?? RecurrencePattern.Weekly);
  const [cronExpression, setCronExpression] = useState(() => recurringSurvey?.cronExpression ?? '');
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(() => recurringSurvey?.daysOfWeek ?? [1]); // Default Monday
  const [dayOfMonth, setDayOfMonth] = useState(() => recurringSurvey?.dayOfMonth ?? 1);
  const [sendTime, setSendTime] = useState(() => formatTimeForDisplay(recurringSurvey?.sendTime));
  const [timezoneId, setTimezoneId] = useState(() => recurringSurvey?.timezoneId ?? getBrowserTimezone());
  const [endsAt, setEndsAt] = useState(() => formatDateForInput(recurringSurvey?.endsAt));
  const [maxRuns, setMaxRuns] = useState<number | undefined>(() => recurringSurvey?.maxRuns);

  // Audience
  const [audienceType, setAudienceType] = useState<AudienceType>(() => recurringSurvey?.audienceType ?? AudienceType.StaticList);
  const [recipientEmails, setRecipientEmails] = useState(() => recurringSurvey?.recipientEmails?.join('\n') ?? '');

  // Reminders
  const [sendReminders, setSendReminders] = useState(() => recurringSurvey?.sendReminders ?? false);
  const [reminderDaysAfter, setReminderDaysAfter] = useState(() => recurringSurvey?.reminderDaysAfter ?? 3);
  const [maxReminders, setMaxReminders] = useState(() => recurringSurvey?.maxReminders ?? 2);

  // Email customization
  const [customSubject, setCustomSubject] = useState(() => recurringSurvey?.customSubject ?? '');
  const [customMessage, setCustomMessage] = useState(() => recurringSurvey?.customMessage ?? '');

  // Activation
  const [activateImmediately, setActivateImmediately] = useState(true);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Survey options for select
  const surveyOptions: SelectOption[] = useMemo(() => {
    if (!surveys) return [];
    return surveys
      .filter((s) => s.status === SurveyStatus.Published)
      .map((s) => ({
        value: s.id,
        label: s.title,
      }));
  }, [surveys]);

  // Show relevant fields based on pattern
  const showDaysOfWeek = pattern === RecurrencePattern.Weekly || pattern === RecurrencePattern.BiWeekly;
  const showDayOfMonth = pattern === RecurrencePattern.Monthly || pattern === RecurrencePattern.Quarterly;
  const showCronExpression = pattern === RecurrencePattern.Custom;

  // Handle day of week toggle (multi-select for weekly patterns)
  const toggleDayOfWeek = (day: DayOfWeek) => {
    if (daysOfWeek.includes(day)) {
      // Don't allow empty selection
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort((a, b) => a - b));
    }
  };

  // Validate form
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!isEditMode && !surveyId) {
      newErrors.surveyId = t('recurringSurveys.form.validation.selectSurvey');
    }

    if (!name.trim()) {
      newErrors.name = t('recurringSurveys.form.nameRequired');
    }

    if (!isValidTime(sendTime)) {
      newErrors.sendTime = t('recurringSurveys.form.validation.validTime');
    }

    if (pattern === RecurrencePattern.Custom && !cronExpression.trim()) {
      newErrors.cronExpression = 'Cron expression is required for custom schedules';
    }

    if (audienceType === AudienceType.StaticList) {
      const emails = recipientEmails
        .split(/[\n,;]/)
        .map((e) => e.trim())
        .filter(Boolean);
      if (emails.length === 0) {
        newErrors.recipientEmails = 'At least one email address is required';
      }
    }

    if (endsAt) {
      if (isPast(endsAt)) {
        newErrors.endsAt = 'End date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handle form submission
  async function handleSubmit() {
    if (!validate()) return;

    // Parse recipient emails
    const emails =
      audienceType === AudienceType.StaticList
        ? recipientEmails
            .split(/[\n,;]/)
            .map((e) => e.trim())
            .filter(Boolean)
        : undefined;

    const baseData = {
      name: name.trim(),
      pattern,
      sendTime: sendTime.includes(':') && sendTime.split(':').length === 2 ? `${sendTime}:00` : sendTime,
      timezoneId,
      audienceType,
      recipientEmails: emails,
      sendReminders,
      reminderDaysAfter: sendReminders ? reminderDaysAfter : undefined,
      maxReminders: sendReminders ? maxReminders : undefined,
      customSubject: customSubject.trim() || undefined,
      customMessage: customMessage.trim() || undefined,
      endsAt: endsAt ? toISOTimestamp(endsAt) : undefined,
      maxRuns: maxRuns || undefined,
      ...(showCronExpression && { cronExpression: cronExpression.trim() }),
      ...(showDaysOfWeek && { daysOfWeek }),
      ...(showDayOfMonth && { dayOfMonth }),
    };

    if (isEditMode) {
      await onSubmit(baseData as UpdateRecurringSurveyRequest);
    } else {
      await onSubmit({
        surveyId,
        activateImmediately,
        ...baseData,
      } as CreateRecurringSurveyRequest);
    }
  }

  return (
    <>
      <DialogHeader
        hero
        icon={<CalendarClock className="h-7 w-7" />}
        title={isEditMode ? t('recurringSurveys.editTitle') : t('recurringSurveys.createTitle')}
        description={isEditMode ? t('recurringSurveys.editDescription') : t('recurringSurveys.createDescription')}
        showClose
      />

      <DialogBody className="space-y-6">
        {/* Survey selection (create mode only) */}
        {!isEditMode && (
          <div>
            <Select
              label="Survey"
              placeholder="Select a published survey..."
              options={surveyOptions}
              value={surveyId}
              onChange={setSurveyId}
              error={errors.surveyId}
              searchable
            />
            {surveyOptions.length === 0 && (
              <p className="mt-2 text-sm text-warning flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                No published surveys available. Publish a survey first.
              </p>
            )}
          </div>
        )}

        {/* Name */}
        <Input
          label={t('recurringSurveys.form.scheduleName')}
          placeholder={t('recurringSurveys.form.scheduleNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        {/* Schedule section */}
        <div className="p-4 bg-surface-container-low rounded-2xl space-y-4">
          <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Pattern
          </h4>

          <Select label="Repeat" options={patternOptions} value={String(pattern)} onChange={(v) => setPattern(parseInt(v) as RecurrencePattern)} />

          {/* Days of week (for weekly/bi-weekly) */}
          {showDaysOfWeek && (
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t('recurringSurveys.form.daysOfWeek')}</label>
              <div className="flex flex-wrap gap-2">
                {dayOfWeekOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDayOfWeek(value as DayOfWeek)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      daysOfWeek.includes(value as DayOfWeek)
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">{t('recurringSurveys.form.daysOfWeekHelper')}</p>
            </div>
          )}

          {/* Day of Month (for monthly/quarterly) */}
          {showDayOfMonth && (
            <Select label="Day of Month" options={dayOfMonthOptions} value={String(dayOfMonth)} onChange={(v) => setDayOfMonth(Number(v))} />
          )}

          {/* Cron expression (for custom) */}
          {showCronExpression && (
            <div>
              <Input
                label={t('recurringSurveys.cronExpression')}
                placeholder="e.g., 0 9 * * MON-FRI"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                error={errors.cronExpression}
              />
              <p className="mt-1 text-xs text-on-surface-variant">{t('recurringSurveys.cronHelp')}</p>
            </div>
          )}
        </div>

        {/* Time settings */}
        <div className="p-4 bg-surface-container-low rounded-2xl space-y-4">
          <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('recurringSurveys.timeSettings')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t('recurringSurveys.form.sendTime')}</label>
              <Input type="time" value={sendTime} onChange={(e) => setSendTime(e.target.value)} error={errors.sendTime} />
            </div>

            <Select label={t('common.timezone')} options={timezoneOptions} value={timezoneId} onChange={setTimezoneId} searchable />
          </div>

          <p className="text-xs text-on-surface-variant flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {t('recurringSurveys.sendTimeInfo', { time: sendTime, timezone: timezoneId })}
          </p>
        </div>

        {/* Audience section */}
        <div className="p-4 bg-surface-container-low rounded-2xl space-y-4">
          <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('recurringSurveys.audience')}
          </h4>

          <Select
            label="Recipient Type"
            options={audienceTypeOptions}
            value={String(audienceType)}
            onChange={(v) => setAudienceType(parseInt(v) as AudienceType)}
          />

          {audienceType === AudienceType.StaticList && (
            <div>
              <Textarea
                label="Email Addresses"
                placeholder="Enter email addresses (one per line, or separated by commas)"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
                rows={4}
                error={errors.recipientEmails}
              />
              <p className="mt-1 text-xs text-on-surface-variant">
                {
                  recipientEmails
                    .split(/[\n,;]/)
                    .map((e) => e.trim())
                    .filter(Boolean).length
                }{' '}
                email(s) entered
              </p>
            </div>
          )}

          {audienceType === AudienceType.AllContacts && (
            <p className="text-sm text-on-surface-variant flex items-start gap-1.5">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              The survey will be sent to all contacts in your namespace.
            </p>
          )}
        </div>

        {/* Email customization */}
        <div className="p-4 bg-surface-container-low rounded-2xl space-y-4">
          <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Customization
          </h4>

          <Input
            label="Custom Subject (optional)"
            placeholder="Leave empty to use survey title"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
          />

          <Textarea
            label="Custom Message (optional)"
            placeholder="Add a custom message to the email invitation..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
          />
        </div>

        {/* Reminders section */}
        <div className="p-4 bg-surface-container-low rounded-2xl space-y-4">
          <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminders
          </h4>

          <Checkbox label="Send reminder emails to non-respondents" checked={sendReminders} onChange={(e) => setSendReminders(e.target.checked)} />

          {sendReminders && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">{t('recurringSurveys.form.daysAfterSend')}</label>
                <Input type="number" min={1} max={30} value={reminderDaysAfter} onChange={(e) => setReminderDaysAfter(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">{t('recurringSurveys.form.maxReminders')}</label>
                <Input type="number" min={1} max={5} value={maxReminders} onChange={(e) => setMaxReminders(Number(e.target.value))} />
              </div>
            </div>
          )}
        </div>

        {/* End conditions */}
        <div className="p-4 bg-surface-container-low rounded-2xl space-y-4">
          <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Globe className="h-4 w-4" />
            End Conditions (optional)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t('recurringSurveys.form.endDate')}</label>
              <DatePicker value={endsAt || undefined} onChange={(date) => setEndsAt(date || '')} minDate={getToday()} error={errors.endsAt} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t('recurringSurveys.form.maxRuns')}</label>
              <Input
                type="number"
                min={1}
                placeholder={t('recurringSurveys.form.maxRunsPlaceholder')}
                value={maxRuns ?? ''}
                onChange={(e) => setMaxRuns(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <p className="text-xs text-on-surface-variant flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Leave both empty for indefinite scheduling.
          </p>
        </div>

        {/* Activation (create mode only) */}
        {!isEditMode && (
          <Checkbox
            label="Activate immediately after creation"
            description={t('recurringSurveys.pausedStateHint')}
            checked={activateImmediately}
            onChange={(e) => setActivateImmediately(e.target.checked)}
          />
        )}
      </DialogBody>

      <DialogFooter className="gap-2">
        <Button variant="text" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button variant="filled" onClick={handleSubmit} disabled={isLoading || (!isEditMode && surveyOptions.length === 0)} loading={isLoading}>
          {isEditMode ? t('common.saveChanges') : t('recurringSurveys.createSchedule')}
        </Button>
      </DialogFooter>
    </>
  );
}

// Main component - uses key to reset form when dialog opens/closes or survey changes
export function RecurringScheduleEditor({ open, onOpenChange, recurringSurvey, surveys, onSubmit, isLoading }: RecurringScheduleEditorProps) {
  // Generate a key that changes when we need to reset the form
  const formKey = open ? `open-${recurringSurvey?.id ?? 'create'}` : 'closed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" showClose={false}>
        {/* Using key forces React to remount the form when it changes */}
        <RecurringScheduleForm
          key={formKey}
          recurringSurvey={recurringSurvey}
          surveys={surveys}
          onSubmit={onSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
