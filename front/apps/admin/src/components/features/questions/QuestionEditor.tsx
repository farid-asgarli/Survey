// Question Editor - M3 Expressive Design
// Features:
// - Separated cards layout (desktop: grid, mobile: tabs)
// - Shape morphing cards with varying corner radii for hierarchy
// - No shadows (uses border and color elevation)
// - Semantic color tokens
// - Rounded-full action buttons
// - Live preview alongside editor on desktop

import { useState } from 'react';
import { useSurveyBuilderStore } from '@/stores';
import { useDialogState, useQuestionEditorTranslation } from '@/hooks';
import { QuestionTypeIcon, getQuestionTypeLabel } from './QuestionTypeInfo';
import { QuestionPreview } from './QuestionPreview';
import { LogicBuilderDialog } from './LogicBuilderDialog';
import { LogicSummaryBadge } from './LogicVisualization';
import {
  SingleChoiceEditor,
  MultipleChoiceEditor,
  TextEditor,
  LongTextEditor,
  RatingEditor,
  ScaleEditor,
  MatrixEditor,
  DateEditor,
  FileUploadEditor,
  RankingEditor,
  EmailEditor,
  PhoneEditor,
  UrlEditor,
  NumberEditor,
  YesNoEditor,
} from './editors';
import { Switch, IconButton, Tabs, TabsList, TabsTrigger, TabsContent, Button, Tooltip, Badge } from '@/components/ui';
import { Trash2, Copy, Eye, GitBranch, Pencil, Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QuestionType } from '@/types';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks';

import type { DraftQuestion } from '@/stores/surveyBuilderStore';

interface QuestionEditorProps {
  question: DraftQuestion;
  isReadOnly?: boolean;
}

export function QuestionEditor({ question, isReadOnly = false }: QuestionEditorProps) {
  const { t } = useTranslation();
  const logicDialog = useDialogState();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isLogicExpanded, setIsLogicExpanded] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const { survey, updateQuestion, deleteQuestion, duplicateQuestion, addOption, updateOption, deleteOption, reorderOptions } =
    useSurveyBuilderStore();

  // Get translation-aware data and handlers
  const translationData = useQuestionEditorTranslation(question);
  const { translated, handlers } = translationData ?? { translated: null, handlers: null };

  // Translatable settings fields that should be routed through translation API
  const translatableSettingFields = [
    'minLabel',
    'maxLabel',
    'placeholder',
    'validationMessage',
    'otherLabel',
    'matrixRows',
    'matrixColumns',
  ] as const;

  const handleUpdateQuestion = (updates: Partial<DraftQuestion>) => {
    // For text/description, use translation-aware handlers
    if ('text' in updates && updates.text !== undefined && handlers) {
      handlers.updateText(updates.text);
      // Remove text from updates to avoid double-update
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { text: _, ...rest } = updates;
      if (Object.keys(rest).length > 0) {
        handlers.updateSettings(rest);
      }
      return;
    }
    if ('description' in updates && updates.description !== undefined && handlers) {
      handlers.updateDescription(updates.description);
      // Remove description from updates to avoid double-update
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description: __, ...rest } = updates;
      if (Object.keys(rest).length > 0) {
        handlers.updateSettings(rest);
      }
      return;
    }

    // Check if settings contain translatable fields
    // Only route through translation handler when actually editing a translation (non-default language)
    if ('settings' in updates && updates.settings && handlers && translated?.isEditingTranslation) {
      const settingsUpdate = updates.settings;

      // Separate translatable and non-translatable settings
      const translatableUpdates: Record<string, unknown> = {};
      const nonTranslatableSettings: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(settingsUpdate)) {
        if (translatableSettingFields.includes(key as (typeof translatableSettingFields)[number])) {
          translatableUpdates[key] = value;
        } else {
          nonTranslatableSettings[key] = value;
        }
      }

      // Route translatable settings through translation handler
      for (const [field, value] of Object.entries(translatableUpdates)) {
        handlers.updateTranslatableSetting(field as (typeof translatableSettingFields)[number], value as string | string[]);
      }

      // Update non-translatable settings directly
      if (Object.keys(nonTranslatableSettings).length > 0) {
        updateQuestion(question.id, { settings: { ...question.settings, ...nonTranslatableSettings } });
      }
      return;
    }

    // When editing default language or no translation context, update store directly
    if ('settings' in updates && updates.settings) {
      updateQuestion(question.id, { settings: { ...question.settings, ...updates.settings } });
      return;
    }

    // For other updates (settings), use direct store update
    if (handlers) {
      handlers.updateSettings(updates);
    } else {
      updateQuestion(question.id, updates);
    }
  };

  const handleAddOption = () => {
    addOption(question.id);
  };

  const handleUpdateOption = (optionId: string, updates: { text?: string; value?: string }) => {
    // For text updates, use translation-aware handler
    if ('text' in updates && updates.text !== undefined && handlers) {
      handlers.updateOptionText(optionId, updates.text);
      // Handle value separately if present
      if ('value' in updates && updates.value !== undefined) {
        updateOption(question.id, optionId, { value: updates.value });
      }
      return;
    }
    // For other updates, use direct store update
    updateOption(question.id, optionId, updates);
  };

  const handleDeleteOption = (optionId: string) => {
    deleteOption(question.id, optionId);
  };

  const handleReorderOptions = (startIndex: number, endIndex: number) => {
    reorderOptions(question.id, startIndex, endIndex);
  };

  // Build question with display values for editors
  const displayQuestion: DraftQuestion = translated
    ? {
        ...question,
        text: translated.displayText,
        description: translated.displayDescription,
        options: translated.displayOptions.map((opt) => ({
          ...question.options.find((o) => o.id === opt.id)!,
          text: opt.displayText,
        })),
        settings: {
          ...question.settings,
          // Override with translated settings if available
          minLabel: translated.displaySettings.minLabel ?? question.settings?.minLabel,
          maxLabel: translated.displaySettings.maxLabel ?? question.settings?.maxLabel,
          placeholder: translated.displaySettings.placeholder ?? question.settings?.placeholder,
          validationMessage: translated.displaySettings.validationMessage ?? question.settings?.validationMessage,
          otherLabel: translated.displaySettings.otherLabel ?? question.settings?.otherLabel,
          matrixRows: translated.displaySettings.matrixRows ?? question.settings?.matrixRows,
          matrixColumns: translated.displaySettings.matrixColumns ?? question.settings?.matrixColumns,
        },
      }
    : question;

  // Editor props for option-based questions
  const optionEditorProps = {
    question: displayQuestion,
    isReadOnly,
    onUpdateQuestion: handleUpdateQuestion,
    onAddOption: handleAddOption,
    onUpdateOption: handleUpdateOption,
    onDeleteOption: handleDeleteOption,
    onReorderOptions: handleReorderOptions,
  };

  // Simple editor props
  const simpleEditorProps = {
    question: displayQuestion,
    isReadOnly,
    onUpdateQuestion: handleUpdateQuestion,
  };

  const renderEditor = () => {
    switch (question.type) {
      case QuestionType.SingleChoice:
      case QuestionType.Dropdown: // Dropdown uses same editor as SingleChoice
        return <SingleChoiceEditor {...optionEditorProps} />;
      case QuestionType.YesNo: // YesNo has its own editor with style options
        return <YesNoEditor {...simpleEditorProps} />;
      case QuestionType.MultipleChoice:
      case QuestionType.Checkbox: // Checkbox is alias for MultipleChoice
        return <MultipleChoiceEditor {...optionEditorProps} />;
      case QuestionType.Text:
      case QuestionType.ShortText: // ShortText is alias for Text
        return <TextEditor {...simpleEditorProps} />;
      case QuestionType.Email:
        return <EmailEditor {...simpleEditorProps} />;
      case QuestionType.Phone:
        return <PhoneEditor {...simpleEditorProps} />;
      case QuestionType.Url:
        return <UrlEditor {...simpleEditorProps} />;
      case QuestionType.Number:
        return <NumberEditor {...simpleEditorProps} />;
      case QuestionType.LongText:
        return <LongTextEditor {...simpleEditorProps} />;
      case QuestionType.Rating:
        return <RatingEditor {...simpleEditorProps} />;
      case QuestionType.Scale:
      case QuestionType.NPS: // NPS is a specific scale (0-10)
        return <ScaleEditor {...simpleEditorProps} />;
      case QuestionType.Matrix:
        return <MatrixEditor {...simpleEditorProps} />;
      case QuestionType.Date:
      case QuestionType.DateTime: // DateTime uses same editor as Date
        return <DateEditor {...simpleEditorProps} />;
      case QuestionType.FileUpload:
        return <FileUploadEditor {...simpleEditorProps} />;
      case QuestionType.Ranking:
        return <RankingEditor {...optionEditorProps} />;
      default:
        return <div className="text-on-surface-variant">{t('questionEditor.unknownType', { type: question.type })}</div>;
    }
  };

  // Shared values for rendering
  const canConfigureLogic = survey?.id && !question.id.startsWith('temp_');

  // ============================================================================
  // RENDER FUNCTIONS (not components - avoids re-creation on render)
  // ============================================================================

  const renderQuestionHeader = (showLogicInline = false) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-2xl flex items-center justify-center transition-colors',
            isReadOnly ? 'bg-surface-container text-on-surface-variant' : 'bg-primary-container text-on-primary-container'
          )}
        >
          <QuestionTypeIcon type={question.type} className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-on-surface">{getQuestionTypeLabel(question.type)}</h3>
            {translated?.isEditingTranslation && (
              <Badge variant={translated.isUsingFallback ? 'warning' : 'info'} size="sm" className="gap-1">
                <Languages className="w-3 h-3" />
                {translated.isUsingFallback
                  ? t('localization.editingFallback', 'Editing (fallback)')
                  : t('localization.editingTranslation', 'Editing {{lang}}', { lang: translated.editingLanguage.toUpperCase() })}
              </Badge>
            )}
          </div>
          <p className="text-xs text-on-surface-variant">
            {t('questionEditor.questionNumber', 'Question {{number}}', { number: question.order + 1 })}
            {question.isRequired && <span className="text-error ml-1">*</span>}
          </p>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex items-center gap-2">
          {/* Inline Preview Toggle - Desktop only */}
          {showLogicInline && (
            <Tooltip content={isPreviewVisible ? t('questionEditor.hidePreview', 'Hide Preview') : t('questionEditor.showPreview', 'Show Preview')}>
              <Button
                variant="tonal"
                size="sm"
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                className={cn(
                  'transition-colors',
                  isPreviewVisible
                    ? 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                <Eye className="w-4 h-4 mr-1.5" />
                {t('questionEditor.preview')}
              </Button>
            </Tooltip>
          )}

          {/* Inline Logic Button - Desktop only */}
          {showLogicInline && canConfigureLogic && (
            <div className="flex items-center gap-2">
              <LogicSummaryBadge questionId={question.id} surveyId={survey!.id} />
              <Tooltip content={t('questionEditor.conditionalLogic')}>
                <Button
                  variant="tonal"
                  size="sm"
                  onClick={() => logicDialog.open()}
                  className="bg-tertiary-container/50 text-on-tertiary-container hover:bg-tertiary-container"
                >
                  <GitBranch className="w-4 h-4 mr-1.5" />
                  {t('questionEditor.logic', 'Logic')}
                </Button>
              </Tooltip>
            </div>
          )}
          {showLogicInline && !canConfigureLogic && (
            <Tooltip content={t('questionEditor.saveFirst')}>
              <Button variant="tonal" size="sm" disabled className="opacity-50">
                <GitBranch className="w-4 h-4 mr-1.5" />
                {t('questionEditor.logic', 'Logic')}
              </Button>
            </Tooltip>
          )}

          {/* Duplicate/Delete Actions */}
          <div className="flex items-center gap-1 p-1.5 bg-surface-container rounded-full">
            <Tooltip content={t('common.duplicate', 'Duplicate')}>
              <IconButton
                variant="standard"
                size="sm"
                aria-label={t('questionEditor.duplicateQuestion')}
                onClick={() => duplicateQuestion(question.id)}
              >
                <Copy className="w-4 h-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content={t('common.delete', 'Delete')}>
              <IconButton
                variant="standard"
                size="sm"
                aria-label={t('questionEditor.deleteQuestion')}
                onClick={() => deleteQuestion(question.id)}
                className="hover:text-error hover:bg-error/8"
              >
                <Trash2 className="w-4 h-4" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );

  const renderEditorCard = () => (
    <div className="bg-surface rounded-3xl border-2 border-outline-variant/40 overflow-hidden transition-all">
      <div className="p-5">{renderEditor()}</div>
      <div className="border-t border-outline-variant/20 bg-surface-container/30 p-4">
        <Switch
          label={t('questionEditor.requiredQuestion')}
          description={t('questionEditor.requiredDescription')}
          checked={question.isRequired}
          onChange={(e) => handleUpdateQuestion({ isRequired: e.target.checked })}
        />
      </div>
    </div>
  );

  const renderPreviewCard = (compact = false) => (
    <div className={cn('bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden transition-all', compact ? '' : 'h-full')}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/50">
        <div className="w-8 h-8 rounded-xl bg-secondary-container flex items-center justify-center">
          <Eye className="w-4 h-4 text-on-secondary-container" />
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{t('questionEditor.livePreview', 'Live Preview')}</p>
          <p className="text-xs text-on-surface-variant">{t('questionEditor.previewDescription', 'How respondents will see this')}</p>
        </div>
      </div>
      <div className={cn('bg-surface p-4', compact ? '' : 'overflow-auto')}>
        <QuestionPreview question={displayQuestion} />
      </div>
    </div>
  );

  const renderLogicCard = (compact = false) => {
    if (!canConfigureLogic) {
      return (
        <div className="bg-surface-container-high/50 rounded-2xl border border-outline-variant/30 p-4 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-on-surface-variant/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">{t('questionEditor.conditionalLogic')}</p>
              <p className="text-xs text-on-surface-variant/70">{t('questionEditor.saveFirst')}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'bg-tertiary-container/30 rounded-2xl border border-tertiary/20 overflow-hidden transition-all',
          isLogicExpanded && !compact ? 'ring-2 ring-tertiary/30' : ''
        )}
      >
        <button
          onClick={() => !compact && setIsLogicExpanded(!isLogicExpanded)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
            !compact && 'hover:bg-tertiary-container/50'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-tertiary-container flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-on-tertiary-container" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">{t('questionEditor.conditionalLogic')}</p>
              <p className="text-xs text-on-surface-variant">{t('questionEditor.controlWhenAppears')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LogicSummaryBadge questionId={question.id} surveyId={survey!.id} />
            {!compact &&
              (isLogicExpanded ? (
                <ChevronUp className="w-4 h-4 text-on-surface-variant" />
              ) : (
                <ChevronDown className="w-4 h-4 text-on-surface-variant" />
              ))}
          </div>
        </button>

        {(isLogicExpanded || compact) && (
          <div className="px-4 pb-4 pt-2 border-t border-tertiary/10">
            <Button variant="tonal" size="sm" onClick={() => logicDialog.open()} className="w-full justify-center">
              <GitBranch className="w-4 h-4 mr-1.5" />
              {t('questionEditor.configure')}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // DESKTOP LAYOUT - Separated cards in grid
  // ============================================================================
  if (isDesktop && !isReadOnly) {
    return (
      <div className="h-full flex flex-col bg-surface-container-lowest">
        {/* Header with inline Logic button */}
        <div className="shrink-0 bg-surface border-b border-outline-variant/30 p-4">{renderQuestionHeader(true)}</div>

        {/* Content Area - Editor scrolls, Preview stays sticky */}
        <div className={cn('flex-1 overflow-hidden', isPreviewVisible ? 'grid grid-cols-5 gap-4' : '')}>
          {/* Left Column - Editor (Hero) - scrollable */}
          <div className={cn('overflow-auto p-4', isPreviewVisible ? 'col-span-3' : 'max-w-4xl mx-auto')}>{renderEditorCard()}</div>

          {/* Right Column - Preview - sticky, doesn't scroll with editor */}
          {isPreviewVisible && (
            <div className="col-span-2 overflow-auto border-l border-outline-variant/20 bg-surface-container-lowest/50">
              <div className="sticky top-0 p-4">{renderPreviewCard()}</div>
            </div>
          )}
        </div>

        {/* Logic Builder Dialog */}
        {canConfigureLogic && (
          <LogicBuilderDialog open={logicDialog.isOpen} onOpenChange={logicDialog.setOpen} questionId={question.id} surveyId={survey!.id} />
        )}
      </div>
    );
  }

  // ============================================================================
  // MOBILE/TABLET LAYOUT - Tabbed interface (original behavior)
  // ============================================================================
  return (
    <Tabs defaultValue={isReadOnly ? 'preview' : 'edit'} className="h-full flex flex-col bg-surface-container-lowest">
      {/* Header - Clean card-style header */}
      <div className="shrink-0 bg-surface border-b border-outline-variant/30">
        <div className="p-4">{renderQuestionHeader()}</div>

        {/* Tabs - M3 Expressive Pill style */}
        <div className="px-4 pb-3">
          <TabsList className="flex items-center gap-1 p-1.5 bg-surface-container rounded-full w-fit">
            {!isReadOnly && (
              <TabsTrigger
                value="edit"
                className="gap-2 px-4 py-2 rounded-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-on-primary"
              >
                <Pencil className="w-4 h-4" />
                {t('questionEditor.edit')}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="preview"
              className="gap-2 px-4 py-2 rounded-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-on-primary"
            >
              <Eye className="w-4 h-4" />
              {t('questionEditor.preview')}
            </TabsTrigger>
            {!isReadOnly && (
              <TabsTrigger
                value="logic"
                className="gap-2 px-4 py-2 rounded-full text-sm font-semibold data-[state=active]:bg-tertiary data-[state=active]:text-on-tertiary"
              >
                <GitBranch className="w-4 h-4" />
                {t('questionEditor.logic', 'Logic')}
              </TabsTrigger>
            )}
          </TabsList>
        </div>
      </div>

      {/* Content Area - Edit tab only in edit mode */}
      {!isReadOnly && (
        <TabsContent value="edit" className="flex-1 overflow-auto p-4">
          {renderEditorCard()}
        </TabsContent>
      )}

      <TabsContent value="preview" className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">{renderPreviewCard(true)}</div>
      </TabsContent>

      {!isReadOnly && (
        <TabsContent value="logic" className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl mx-auto">{renderLogicCard(true)}</div>
        </TabsContent>
      )}

      {/* Logic Builder Dialog - only in edit mode */}
      {!isReadOnly && canConfigureLogic && (
        <LogicBuilderDialog open={logicDialog.isOpen} onOpenChange={logicDialog.setOpen} questionId={question.id} surveyId={survey!.id} />
      )}
    </Tabs>
  );
}
