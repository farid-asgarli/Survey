import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  SelectionCard,
  SelectionCardLabel,
  SelectionCardIcon,
  SelectionCardGroup,
  Switch,
  Select,
  Textarea,
} from '@/components/ui';
import {
  ListOrdered,
  CircleDot,
  Save,
  FileText,
  Hash,
  LetterText,
  Ban,
  SplitSquareVertical,
  Palette,
  MessageSquare,
  PartyPopper,
  Eye,
} from 'lucide-react';
import { usePreferencesStore } from '@/stores';
import { useUpdateSinglePreference, useThemesList } from '@/hooks';
import { cn } from '@/lib/utils';
import type { QuestionNumberingStyle, PageBreakBehavior } from '@/types';

const NUMBERING_STYLES: { id: QuestionNumberingStyle; labelKey: string; icon: typeof Hash }[] = [
  { id: 'numbers', labelKey: 'settings.surveyBuilder.numberingNumbers', icon: Hash },
  { id: 'letters', labelKey: 'settings.surveyBuilder.numberingLetters', icon: LetterText },
  { id: 'none', labelKey: 'settings.surveyBuilder.numberingNone', icon: Ban },
];

const PAGE_BREAK_OPTIONS: { id: PageBreakBehavior; labelKey: string; descKey: string }[] = [
  { id: 'auto', labelKey: 'settings.surveyBuilder.pageBreakAuto', descKey: 'settings.surveyBuilder.pageBreakAutoDesc' },
  { id: 'manual', labelKey: 'settings.surveyBuilder.pageBreakManual', descKey: 'settings.surveyBuilder.pageBreakManualDesc' },
  { id: 'per-question', labelKey: 'settings.surveyBuilder.pageBreakPerQuestion', descKey: 'settings.surveyBuilder.pageBreakPerQuestionDesc' },
];

const AUTO_SAVE_OPTIONS = [
  { value: 0, labelKey: 'settings.surveyBuilder.autoSaveDisabled' },
  { value: 15, labelKey: 'settings.surveyBuilder.autoSave15s' },
  { value: 30, labelKey: 'settings.surveyBuilder.autoSave30s' },
  { value: 60, labelKey: 'settings.surveyBuilder.autoSave1m' },
  { value: 120, labelKey: 'settings.surveyBuilder.autoSave2m' },
  { value: 300, labelKey: 'settings.surveyBuilder.autoSave5m' },
];

export function SurveyBuilderSection() {
  const { t } = useTranslation();
  const surveyBuilder = usePreferencesStore((s) => s.preferences.surveyBuilder);
  const setDefaultQuestionRequired = usePreferencesStore((s) => s.setDefaultQuestionRequired);
  const setDefaultThemeId = usePreferencesStore((s) => s.setDefaultThemeId);
  const setDefaultWelcomeMessage = usePreferencesStore((s) => s.setDefaultWelcomeMessage);
  const setDefaultThankYouMessage = usePreferencesStore((s) => s.setDefaultThankYouMessage);
  const setAutoSaveInterval = usePreferencesStore((s) => s.setAutoSaveInterval);
  const setQuestionNumberingStyle = usePreferencesStore((s) => s.setQuestionNumberingStyle);
  const setShowQuestionDescriptions = usePreferencesStore((s) => s.setShowQuestionDescriptions);
  const setDefaultPageBreakBehavior = usePreferencesStore((s) => s.setDefaultPageBreakBehavior);
  const { updateSurveyBuilder, isPending } = useUpdateSinglePreference();

  // Fetch available themes
  const { data: themesData } = useThemesList();
  const themes = themesData?.items || [];

  const handleRequiredChange = (required: boolean) => {
    setDefaultQuestionRequired(required);
    updateSurveyBuilder({ defaultQuestionRequired: required });
  };

  const handleThemeChange = (themeId: string) => {
    const id = themeId === 'none' ? null : themeId;
    setDefaultThemeId(id);
    updateSurveyBuilder({ defaultThemeId: id });
  };

  const handleWelcomeMessageChange = (message: string) => {
    setDefaultWelcomeMessage(message);
    // Debounce the API call for text inputs
  };

  const handleWelcomeMessageBlur = () => {
    updateSurveyBuilder({ defaultWelcomeMessage: surveyBuilder.defaultWelcomeMessage });
  };

  const handleThankYouMessageChange = (message: string) => {
    setDefaultThankYouMessage(message);
  };

  const handleThankYouMessageBlur = () => {
    updateSurveyBuilder({ defaultThankYouMessage: surveyBuilder.defaultThankYouMessage });
  };

  const handleAutoSaveChange = (seconds: string) => {
    const value = parseInt(seconds, 10);
    setAutoSaveInterval(value);
    updateSurveyBuilder({ autoSaveInterval: value });
  };

  const handleNumberingStyleChange = (style: QuestionNumberingStyle) => {
    setQuestionNumberingStyle(style);
    updateSurveyBuilder({ questionNumberingStyle: style });
  };

  const handleShowDescriptionsChange = (show: boolean) => {
    setShowQuestionDescriptions(show);
    updateSurveyBuilder({ showQuestionDescriptions: show });
  };

  const handlePageBreakChange = (behavior: PageBreakBehavior) => {
    setDefaultPageBreakBehavior(behavior);
    updateSurveyBuilder({ defaultPageBreakBehavior: behavior });
  };

  return (
    <div className="space-y-6">
      {/* Question Defaults */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleDot className="h-5 w-5 text-primary" />
            {t('settings.surveyBuilder.questionDefaults')}
          </CardTitle>
          <CardDescription>{t('settings.surveyBuilder.questionDefaultsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Required by Default */}
          <div className="flex items-center justify-between rounded-2xl bg-surface-container p-4">
            <div>
              <p className="font-medium text-on-surface">{t('settings.surveyBuilder.requiredByDefault')}</p>
              <p className="text-sm text-on-surface-variant">{t('settings.surveyBuilder.requiredByDefaultDesc')}</p>
            </div>
            <Switch checked={surveyBuilder.defaultQuestionRequired} onChange={(e) => handleRequiredChange(e.target.checked)} disabled={isPending} />
          </div>

          {/* Show Descriptions */}
          <div className="flex items-center justify-between rounded-2xl bg-surface-container p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-on-surface-variant" />
              <div>
                <p className="font-medium text-on-surface">{t('settings.surveyBuilder.showDescriptions')}</p>
                <p className="text-sm text-on-surface-variant">{t('settings.surveyBuilder.showDescriptionsDesc')}</p>
              </div>
            </div>
            <Switch
              checked={surveyBuilder.showQuestionDescriptions}
              onChange={(e) => handleShowDescriptionsChange(e.target.checked)}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Numbering */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-primary" />
            {t('settings.surveyBuilder.numberingStyle')}
          </CardTitle>
          <CardDescription>{t('settings.surveyBuilder.numberingStyleDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectionCardGroup columns={{ default: 3 }}>
            {NUMBERING_STYLES.map((style) => {
              const isActive = surveyBuilder.questionNumberingStyle === style.id;
              return (
                <SelectionCard
                  key={style.id}
                  isSelected={isActive}
                  onClick={() => handleNumberingStyleChange(style.id)}
                  disabled={isPending}
                  shape="rounded-2xl"
                >
                  <SelectionCardIcon isSelected={isActive} size="md">
                    <style.icon className="h-5 w-5" />
                  </SelectionCardIcon>
                  <SelectionCardLabel isSelected={isActive}>{t(style.labelKey)}</SelectionCardLabel>
                </SelectionCard>
              );
            })}
          </SelectionCardGroup>
        </CardContent>
      </Card>

      {/* Default Theme */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            {t('settings.surveyBuilder.defaultTheme')}
          </CardTitle>
          <CardDescription>{t('settings.surveyBuilder.defaultThemeDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={surveyBuilder.defaultThemeId || 'none'}
            onChange={handleThemeChange}
            disabled={isPending}
            placeholder={t('settings.surveyBuilder.selectTheme')}
            options={[
              { value: 'none', label: t('settings.surveyBuilder.noDefaultTheme') },
              ...themes.map((theme: { id: string; name: string }) => ({
                value: theme.id,
                label: theme.name,
              })),
            ]}
          />
        </CardContent>
      </Card>

      {/* Default Messages */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t('settings.surveyBuilder.defaultMessages')}
          </CardTitle>
          <CardDescription>{t('settings.surveyBuilder.defaultMessagesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
              <FileText className="h-4 w-4" />
              {t('settings.surveyBuilder.welcomeMessage')}
            </label>
            <Textarea
              value={surveyBuilder.defaultWelcomeMessage}
              onChange={(e) => handleWelcomeMessageChange(e.target.value)}
              onBlur={handleWelcomeMessageBlur}
              placeholder={t('settings.surveyBuilder.welcomeMessagePlaceholder')}
              rows={3}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
              <PartyPopper className="h-4 w-4" />
              {t('settings.surveyBuilder.thankYouMessage')}
            </label>
            <Textarea
              value={surveyBuilder.defaultThankYouMessage}
              onChange={(e) => handleThankYouMessageChange(e.target.value)}
              onBlur={handleThankYouMessageBlur}
              placeholder={t('settings.surveyBuilder.thankYouMessagePlaceholder')}
              rows={3}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Save */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            {t('settings.surveyBuilder.autoSave')}
          </CardTitle>
          <CardDescription>{t('settings.surveyBuilder.autoSaveDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={surveyBuilder.autoSaveInterval.toString()}
            onChange={handleAutoSaveChange}
            disabled={isPending}
            options={AUTO_SAVE_OPTIONS.map((option) => ({
              value: option.value.toString(),
              label: t(option.labelKey),
            }))}
          />
        </CardContent>
      </Card>

      {/* Page Break Behavior */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SplitSquareVertical className="h-5 w-5 text-primary" />
            {t('settings.surveyBuilder.pageBreakBehavior')}
          </CardTitle>
          <CardDescription>{t('settings.surveyBuilder.pageBreakBehaviorDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {PAGE_BREAK_OPTIONS.map((option) => {
            const isActive = surveyBuilder.defaultPageBreakBehavior === option.id;
            return (
              <div
                key={option.id}
                onClick={() => !isPending && handlePageBreakChange(option.id)}
                className={cn(
                  'cursor-pointer rounded-2xl p-4 transition-all',
                  isActive ? 'bg-primary/10 ring-2 ring-primary' : 'bg-surface-container hover:bg-surface-container-high',
                  isPending && 'opacity-50 cursor-not-allowed'
                )}
              >
                <p className={cn('font-medium', isActive ? 'text-primary' : 'text-on-surface')}>{t(option.labelKey)}</p>
                <p className="text-sm text-on-surface-variant">{t(option.descKey)}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
