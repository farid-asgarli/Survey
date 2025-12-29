import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  MessageSquareHeart,
  MessagesSquare,
  FlaskConical,
  Users,
  TrendingUp,
  Gauge,
  SmilePlus,
  Plus,
  Check,
  ChevronRight,
  Sparkles,
  Star,
  MessageCircle,
  Lock,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, Button } from '@/components/ui';
import { SurveyType, CxMetricType } from '@/types';
import { getCategoryByType, DEFAULT_CX_TITLES, CX_METRICS, SURVEY_CATEGORIES } from './constants';
import type { CreateSurveyDialogProps, CreateSurveyFormData, SurveyCategory, CxMetricOption } from './types';
import { cn } from '@/lib/utils';
import { LANGUAGES, getCurrentLanguage, type LanguageCode } from '@/i18n';

// Type alias for translation function
type TFunction = ReturnType<typeof useTranslation>['t'];

// Icon mapping for categories
const CATEGORY_ICONS = {
  [SurveyType.Classic]: ClipboardList,
  [SurveyType.CustomerExperience]: MessageSquareHeart,
  [SurveyType.Conversational]: MessagesSquare,
  [SurveyType.Research]: FlaskConical,
  [SurveyType.Assessment360]: Users,
};

// Icon mapping for CX metrics
const CX_METRIC_ICONS = {
  [CxMetricType.NPS]: TrendingUp,
  [CxMetricType.CES]: Gauge,
  [CxMetricType.CSAT]: SmilePlus,
};

export function CreateSurveyDialog({ open, onOpenChange, onSubmit, isLoading = false }: CreateSurveyDialogProps) {
  const { t } = useTranslation();

  // State
  const [selectedCategory, setSelectedCategory] = useState<SurveyType>(SurveyType.Classic);
  const [cxMetric, setCxMetric] = useState<CxMetricType>(CxMetricType.NPS);
  const [languageCode, setLanguageCode] = useState<LanguageCode>(getCurrentLanguage());

  // Handle close with reset
  const handleClose = useCallback(() => {
    if (!isLoading) {
      onOpenChange(false);
      // Reset after close animation
      setTimeout(() => {
        setSelectedCategory(SurveyType.Classic);
        setCxMetric(CxMetricType.NPS);
        setLanguageCode(getCurrentLanguage());
      }, 200);
    }
  }, [isLoading, onOpenChange]);

  // Handle CX metric change
  const handleCxMetricChange = useCallback((metric: CxMetricType) => {
    setCxMetric(metric);
  }, []);

  // Generate title and submit
  const handleSubmit = useCallback(async () => {
    const categoryInfo = getCategoryByType(selectedCategory);
    if (categoryInfo?.isComingSoon) {
      return;
    }

    // Generate appropriate title
    let surveyTitle: string;
    if (selectedCategory === SurveyType.CustomerExperience) {
      const defaultTitleKey = DEFAULT_CX_TITLES[cxMetric];
      surveyTitle = t(defaultTitleKey);
    } else {
      const categoryName = t(categoryInfo?.nameKey || 'createSurvey.categories.classic.name');
      surveyTitle = t('createSurvey.defaults.untitledSurvey', { type: categoryName });
    }

    const formData: CreateSurveyFormData = {
      title: surveyTitle,
      surveyType: selectedCategory,
      cxMetricType: selectedCategory === SurveyType.CustomerExperience ? cxMetric : undefined,
      languageCode,
    };

    try {
      await onSubmit(formData);
      handleClose();
    } catch {
      // Error handling is done by the parent
    }
  }, [selectedCategory, cxMetric, languageCode, onSubmit, t, handleClose]);

  const categoryInfo = getCategoryByType(selectedCategory);
  const isComingSoon = categoryInfo?.isComingSoon;
  const isCxSurvey = selectedCategory === SurveyType.CustomerExperience;

  // Get current metric info for CX preview
  const currentMetric = useMemo(() => CX_METRICS.find((m) => m.id === cxMetric), [cxMetric]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="xl" className="p-0 overflow-hidden">
        {/* Top Header - spans full width */}
        <DialogHeader
          hero
          icon={<ClipboardList className="h-7 w-7" />}
          title={t('createSurvey.title')}
          description={t('createSurvey.subtitle')}
          variant="primary"
          className="px-6 pt-6 pb-4 border-b border-outline-variant/30"
        />

        <div className="flex flex-col md:flex-row min-h-120">
          {/* Left Panel - Survey Type Selection */}
          <div className="md:w-72 shrink-0 bg-surface p-4 border-b md:border-b-0 md:border-r border-outline-variant/30">
            {/* Survey Type List */}
            <nav className="space-y-1" role="listbox" aria-label={t('createSurvey.selectType')}>
              {SURVEY_CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category.id];
                const isSelected = selectedCategory === category.id;
                const isDisabled = category.isComingSoon;

                return (
                  <button
                    key={category.id}
                    onClick={() => !isDisabled && setSelectedCategory(category.id)}
                    disabled={isDisabled}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors',
                      isSelected ? 'bg-primary-container/50 text-on-primary-container' : 'hover:bg-surface-container-high text-on-surface',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-xl',
                        isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-medium text-sm', isSelected && 'text-on-primary-container')}>{t(category.nameKey)}</span>
                        {isDisabled && <Lock className="h-3.5 w-3.5 text-on-surface-variant/60" />}
                      </div>
                      {isDisabled && <span className="text-xs text-on-surface-variant/60">{t('common.comingSoon')}</span>}
                    </div>
                    {isSelected && <ChevronRight className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Panel - Preview Area */}
          <div className="flex-1 flex flex-col bg-surface-container-lowest">
            {/* Preview Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isCxSurvey ? (
                <CxSurveyPreview metric={cxMetric} currentMetric={currentMetric} onMetricChange={handleCxMetricChange} t={t} />
              ) : (
                <SurveyTypePreview category={categoryInfo} t={t} />
              )}
            </div>

            {/* Footer */}
            <DialogFooter className="border-t border-outline-variant/30 bg-surface">
              {/* Language Selector */}
              <div className="flex items-center gap-2 mr-auto">
                <label htmlFor="survey-language" className="text-sm text-on-surface-variant">
                  {t('createSurvey.language', 'Language')}:
                </label>
                <select
                  id="survey-language"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value as LanguageCode)}
                  className="h-9 px-3 rounded-md border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="text" onClick={handleClose} disabled={isLoading}>
                {t('common.cancel')}
              </Button>
              <Button variant="filled" onClick={handleSubmit} disabled={isLoading || isComingSoon} loading={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                {isCxSurvey
                  ? t('createSurvey.actions.startMetricSurvey', { metric: t(currentMetric?.nameKey || '') })
                  : t('createSurvey.actions.createSurvey')}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Preview Components ============

interface SurveyTypePreviewProps {
  category: SurveyCategory | undefined;
  t: TFunction;
}

function SurveyTypePreview({ category, t }: SurveyTypePreviewProps) {
  if (!category) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-on-surface mb-1">{t(category.nameKey)}</h3>
        <p className="text-sm text-on-surface-variant">{t(category.descriptionKey)}</p>
      </div>

      {/* Preview Mockup */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          {category.id === SurveyType.Classic && <ClassicSurveyMockup t={t} />}
          {category.id === SurveyType.Conversational && <ConversationalSurveyMockup t={t} />}
          {category.id === SurveyType.Research && <ResearchSurveyMockup t={t} />}
          {category.id === SurveyType.Assessment360 && <Assessment360Mockup t={t} />}
        </div>
      </div>

      {/* Features */}
      {category.features && category.features.length > 0 && (
        <div className="mt-6 pt-4 border-t border-outline-variant/30">
          <p className="text-xs font-medium text-on-surface-variant mb-3 uppercase tracking-wider">
            {t('createSurvey.preview.features', 'Features')}
          </p>
          <div className="flex flex-wrap gap-2">
            {category.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-surface-container text-xs font-medium text-on-surface-variant"
              >
                <Check className="h-3 w-3 mr-1.5 text-primary" />
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CxSurveyPreviewProps {
  metric: CxMetricType;
  currentMetric: CxMetricOption | undefined;
  onMetricChange: (metric: CxMetricType) => void;
  t: TFunction;
}

function CxSurveyPreview({ metric, currentMetric, onMetricChange, t }: CxSurveyPreviewProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Metric Selector Tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-2xl mb-6">
        {CX_METRICS.map((m) => {
          const Icon = CX_METRIC_ICONS[m.id];
          const isSelected = metric === m.id;

          return (
            <button
              key={m.id}
              onClick={() => onMetricChange(m.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors',
                isSelected ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{t(m.nameKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Metric Preview */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          {metric === CxMetricType.NPS && <NpsSurveyMockup t={t} currentMetric={currentMetric} />}
          {metric === CxMetricType.CES && <CesSurveyMockup t={t} currentMetric={currentMetric} />}
          {metric === CxMetricType.CSAT && <CsatSurveyMockup t={t} currentMetric={currentMetric} />}
        </div>
      </div>

      {/* Metric Info */}
      {currentMetric && (
        <div className="mt-6 pt-4 border-t border-outline-variant/30">
          <p className="text-sm text-on-surface-variant">{t(currentMetric.descriptionKey)}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-on-surface-variant">
            <span className="font-mono bg-surface-container px-2 py-1 rounded">
              {t('createSurvey.preview.scale', 'Scale')}: {currentMetric.scaleMin}–{currentMetric.scaleMax}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Survey Mockup Components ============

function ClassicSurveyMockup({ t }: { t: TFunction }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5">
      {/* Question */}
      <div className="mb-5">
        <div className="flex items-start gap-3 mb-4">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold">1</span>
          <p className="text-sm font-medium text-on-surface flex-1">
            {t('createSurvey.preview.classic.question', 'How satisfied are you with our service?')}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2 ml-9">
          {[
            t('createSurvey.preview.classic.option1', 'Very satisfied'),
            t('createSurvey.preview.classic.option2', 'Satisfied'),
            t('createSurvey.preview.classic.option3', 'Neutral'),
            t('createSurvey.preview.classic.option4', 'Dissatisfied'),
          ].map((option, index) => (
            <label
              key={index}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors',
                index === 0 ? 'border-primary/40 bg-primary-container/20' : 'border-outline-variant/30 hover:bg-surface-container'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  index === 0 ? 'border-primary bg-primary' : 'border-outline-variant'
                )}
              >
                {index === 0 && <div className="w-1.5 h-1.5 rounded-full bg-on-primary" />}
              </div>
              <span className="text-sm text-on-surface">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant pt-4 border-t border-outline-variant/30">
        <span>{t('createSurvey.preview.progress', 'Question 1 of 5')}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn('w-6 h-1 rounded-full', i === 1 ? 'bg-primary' : 'bg-outline-variant/30')} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ConversationalSurveyMockup({ t }: { t: TFunction }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5">
      {/* Chat-style messages */}
      <div className="space-y-4">
        {/* Bot message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="bg-surface-container rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
            <p className="text-sm text-on-surface">
              {t('createSurvey.preview.conversational.botMessage', "Hi there! 👋 I'd love to hear your thoughts.")}
            </p>
          </div>
        </div>

        {/* User response */}
        <div className="flex gap-3 justify-end">
          <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
            <p className="text-sm text-on-primary">{t('createSurvey.preview.conversational.userMessage', 'The experience was great!')}</p>
          </div>
        </div>

        {/* Bot follow-up */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="bg-surface-container rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
            <p className="text-sm text-on-surface">{t('createSurvey.preview.conversational.followUp', 'Wonderful! What did you like most?')}</p>
          </div>
        </div>

        {/* Input indicator */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-outline-variant/30">
          <div className="flex-1 bg-surface-container rounded-full px-4 py-2.5">
            <span className="text-sm text-on-surface-variant">{t('createSurvey.preview.conversational.placeholder', 'Type your answer...')}</span>
          </div>
          <MessageCircle className="w-5 h-5 text-on-surface-variant" />
        </div>
      </div>
    </div>
  );
}

function ResearchSurveyMockup({ t }: { t: TFunction }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5 opacity-60">
      {/* Conjoint-style question */}
      <div className="text-center mb-4">
        <p className="text-sm font-medium text-on-surface mb-1">{t('createSurvey.preview.research.title', 'Which option do you prefer?')}</p>
        <p className="text-xs text-on-surface-variant">{t('createSurvey.preview.research.subtitle', 'Conjoint Analysis')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { price: '$29', features: '3 features' },
          { price: '$49', features: '7 features' },
        ].map((option, index) => (
          <div key={index} className="p-4 rounded-xl border-2 border-outline-variant/30 text-center">
            <p className="text-lg font-bold text-on-surface mb-1">{option.price}</p>
            <p className="text-xs text-on-surface-variant">{option.features}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-4 pt-4 border-t border-outline-variant/30">
        <Lock className="w-5 h-5 text-on-surface-variant mx-auto mb-2" />
        <p className="text-xs text-on-surface-variant">{t('common.comingSoon')}</p>
      </div>
    </div>
  );
}

function Assessment360Mockup({ t }: { t: TFunction }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5 opacity-60">
      <div className="text-center mb-4">
        <p className="text-sm font-medium text-on-surface mb-1">{t('createSurvey.preview.assessment.title', 'Multi-rater Feedback')}</p>
      </div>

      {/* Rater groups */}
      <div className="space-y-3">
        {[
          { label: t('createSurvey.preview.assessment.self', 'Self'), count: 1 },
          { label: t('createSurvey.preview.assessment.manager', 'Manager'), count: 1 },
          { label: t('createSurvey.preview.assessment.peers', 'Peers'), count: 4 },
          { label: t('createSurvey.preview.assessment.reports', 'Direct Reports'), count: 3 },
        ].map((group, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <span className="text-sm text-on-surface">{group.label}</span>
            <span className="text-xs font-mono text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded">{group.count}</span>
          </div>
        ))}
      </div>

      <div className="text-center mt-4 pt-4 border-t border-outline-variant/30">
        <Lock className="w-5 h-5 text-on-surface-variant mx-auto mb-2" />
        <p className="text-xs text-on-surface-variant">{t('common.comingSoon')}</p>
      </div>
    </div>
  );
}

// ============ CX Metric Mockups ============

function NpsSurveyMockup({ t, currentMetric }: { t: TFunction; currentMetric: CxMetricOption | undefined }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5">
      <div className="text-center mb-5">
        <p className="text-sm font-medium text-on-surface">{currentMetric ? t(currentMetric.questionKey) : ''}</p>
      </div>

      {/* NPS Scale */}
      <div className="flex justify-between gap-1 mb-3">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            className={cn(
              'flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors',
              i === 9
                ? 'bg-primary text-on-primary'
                : i <= 6
                ? 'bg-error-container/30 text-on-error-container hover:bg-error-container/50'
                : i <= 8
                ? 'bg-warning-container/30 text-on-surface hover:bg-warning-container/50'
                : 'bg-success-container/30 text-on-surface hover:bg-success-container/50'
            )}
          >
            {i}
          </button>
        ))}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-on-surface-variant">
        <span>{currentMetric ? t(currentMetric.minLabelKey) : ''}</span>
        <span>{currentMetric ? t(currentMetric.maxLabelKey) : ''}</span>
      </div>

      {/* Category legend */}
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-outline-variant/30">
        {[
          { label: t('createSurvey.preview.nps.detractors', 'Detractors'), color: 'bg-error-container/50' },
          { label: t('createSurvey.preview.nps.passives', 'Passives'), color: 'bg-warning-container/50' },
          { label: t('createSurvey.preview.nps.promoters', 'Promoters'), color: 'bg-success-container/50' },
        ].map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div className={cn('w-2.5 h-2.5 rounded-full', item.color)} />
            <span className="text-xs text-on-surface-variant">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CesSurveyMockup({ t, currentMetric }: { t: TFunction; currentMetric: CxMetricOption | undefined }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5">
      <div className="text-center mb-5">
        <p className="text-sm font-medium text-on-surface">{currentMetric ? t(currentMetric.questionKey) : ''}</p>
      </div>

      {/* CES Scale */}
      <div className="flex justify-between gap-2 mb-3">
        {Array.from({ length: 7 }, (_, i) => (
          <button
            key={i}
            className={cn(
              'flex-1 py-3 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
              i === 5 ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            )}
          >
            <span>{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-on-surface-variant">
        <span>{currentMetric ? t(currentMetric.minLabelKey) : ''}</span>
        <span>{currentMetric ? t(currentMetric.maxLabelKey) : ''}</span>
      </div>
    </div>
  );
}

function CsatSurveyMockup({ t, currentMetric }: { t: TFunction; currentMetric: CxMetricOption | undefined }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5">
      <div className="text-center mb-5">
        <p className="text-sm font-medium text-on-surface">{currentMetric ? t(currentMetric.questionKey) : ''}</p>
      </div>

      {/* CSAT Stars */}
      <div className="flex justify-center gap-3 mb-3">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              i <= 3 ? 'bg-warning-container text-warning' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            <Star className={cn('w-6 h-6', i <= 3 && 'fill-current')} />
          </button>
        ))}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-on-surface-variant px-1">
        <span>{currentMetric ? t(currentMetric.minLabelKey) : ''}</span>
        <span>{currentMetric ? t(currentMetric.maxLabelKey) : ''}</span>
      </div>

      {/* Satisfaction indicator */}
      <div className="text-center mt-4 pt-4 border-t border-outline-variant/30">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-container/30">
          <Star className="w-4 h-4 text-warning fill-current" />
          <span className="text-sm font-medium text-on-surface">{t('createSurvey.preview.csat.rating', '4 out of 5')}</span>
        </div>
      </div>
    </div>
  );
}
