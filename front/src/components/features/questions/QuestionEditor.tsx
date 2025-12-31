// Question Editor - Main editor component that renders the appropriate editor for each question type
// Design: Clean, Email Editor-inspired styling with card-based layout and smooth transitions

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
import { Trash2, Copy, Eye, GitBranch, Pencil, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QuestionType } from '@/types';
import { cn } from '@/lib/utils';

import type { DraftQuestion } from '@/stores/surveyBuilderStore';

interface QuestionEditorProps {
  question: DraftQuestion;
  isReadOnly?: boolean;
}

export function QuestionEditor({ question, isReadOnly = false }: QuestionEditorProps) {
  const { t } = useTranslation();
  const logicDialog = useDialogState();
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
      const { text, ...rest } = updates;
      if (Object.keys(rest).length > 0) {
        handlers.updateSettings(rest);
      }
      return;
    }
    if ('description' in updates && updates.description !== undefined && handlers) {
      handlers.updateDescription(updates.description);
      // Remove description from updates to avoid double-update
      const { description, ...rest } = updates;
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

  return (
    <Tabs defaultValue={isReadOnly ? 'preview' : 'edit'} className="h-full flex flex-col bg-surface-container-lowest">
      {/* Header - Clean card-style header */}
      <div className="shrink-0 bg-surface border-b border-outline-variant/30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                isReadOnly ? 'bg-surface-container text-on-surface-variant' : 'bg-primary/10 text-primary'
              )}
            >
              <QuestionTypeIcon type={question.type} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-on-surface">{getQuestionTypeLabel(question.type)}</h3>
                {/* Translation indicator */}
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

          {/* Actions toolbar - hidden in read-only mode */}
          {!isReadOnly && (
            <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg">
              <Tooltip content={t('common.duplicate', 'Duplicate')}>
                <IconButton
                  variant="standard"
                  size="sm"
                  aria-label={t('questionEditor.duplicateQuestion')}
                  onClick={() => duplicateQuestion(question.id)}
                  className="rounded-md"
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
                  className="hover:text-error hover:bg-error/8 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Tabs - Pill style like Email Editor */}
        <div className="px-4 pb-3">
          <TabsList className="flex items-center gap-1 p-1 bg-surface-container rounded-lg w-fit">
            {!isReadOnly && (
              <TabsTrigger
                value="edit"
                className="gap-2 px-4 py-1.5 rounded-md text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:ring-2 data-[state=active]:ring-primary/30"
              >
                <Pencil className="w-4 h-4" />
                {t('questionEditor.edit')}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="preview"
              className="gap-2 px-4 py-1.5 rounded-md text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:ring-2 data-[state=active]:ring-primary/30"
            >
              <Eye className="w-4 h-4" />
              {t('questionEditor.preview')}
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Content Area - Edit tab only in edit mode */}
      {!isReadOnly && (
        <TabsContent value="edit" className="flex-1 overflow-auto">
          {/* Editor Card */}
          <div className="p-4">
            <div className="bg-surface rounded-xl border-2 border-outline-variant/40 overflow-hidden">
              <div className="p-5">{renderEditor()}</div>

              {/* Settings Section */}
              <div className="border-t border-outline-variant/20 bg-surface-container/30 p-4 space-y-4">
                {/* Required Toggle */}
                <Switch
                  label={t('questionEditor.requiredQuestion')}
                  description={t('questionEditor.requiredDescription')}
                  checked={question.isRequired}
                  onChange={(e) => handleUpdateQuestion({ isRequired: e.target.checked })}
                />

                {/* Conditional Logic Button */}
                {survey?.id && !question.id.startsWith('temp_') && (
                  <div className="pt-3 border-t border-outline-variant/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
                          <GitBranch className="w-4 h-4 text-tertiary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-on-surface">{t('questionEditor.conditionalLogic')}</p>
                          <p className="text-xs text-on-surface-variant">{t('questionEditor.controlWhenAppears')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <LogicSummaryBadge questionId={question.id} surveyId={survey.id} />
                        <Button variant="tonal" size="sm" onClick={() => logicDialog.open()}>
                          <GitBranch className="w-4 h-4 mr-1.5" />
                          {t('questionEditor.configure')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info for unsaved questions */}
                {question.id.startsWith('temp_') && (
                  <div className="p-3 bg-surface-container-high/50 rounded-lg text-sm text-on-surface-variant flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
                    <span>{t('questionEditor.saveFirst')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      )}

      <TabsContent value="preview" className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-xl border-2 border-outline-variant/40 p-6">
            <QuestionPreview question={displayQuestion} />
          </div>
        </div>
      </TabsContent>

      {/* Logic Builder Dialog - only in edit mode */}
      {!isReadOnly && survey?.id && !question.id.startsWith('temp_') && (
        <LogicBuilderDialog open={logicDialog.isOpen} onOpenChange={logicDialog.setOpen} questionId={question.id} surveyId={survey.id} />
      )}
    </Tabs>
  );
}
