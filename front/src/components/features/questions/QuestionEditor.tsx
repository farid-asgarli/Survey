// Question Editor - Main editor component that renders the appropriate editor for each question type
// Design: Clean, Email Editor-inspired styling with card-based layout and smooth transitions

import { useState } from 'react';
import { useSurveyBuilderStore } from '@/stores';
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
import { Switch, IconButton, Tabs, TabsList, TabsTrigger, TabsContent, Button, Tooltip } from '@/components/ui';
import { Trash2, Copy, Eye, GitBranch, Pencil } from 'lucide-react';
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
  const [isLogicDialogOpen, setIsLogicDialogOpen] = useState(false);
  const { survey, updateQuestion, deleteQuestion, duplicateQuestion, addOption, updateOption, deleteOption, reorderOptions } =
    useSurveyBuilderStore();

  const handleUpdateQuestion = (updates: Partial<DraftQuestion>) => {
    updateQuestion(question.id, updates);
  };

  const handleAddOption = () => {
    addOption(question.id);
  };

  const handleUpdateOption = (optionId: string, updates: { text?: string; value?: string }) => {
    updateOption(question.id, optionId, updates);
  };

  const handleDeleteOption = (optionId: string) => {
    deleteOption(question.id, optionId);
  };

  const handleReorderOptions = (startIndex: number, endIndex: number) => {
    reorderOptions(question.id, startIndex, endIndex);
  };

  // Editor props for option-based questions
  const optionEditorProps = {
    question,
    isReadOnly,
    onUpdateQuestion: handleUpdateQuestion,
    onAddOption: handleAddOption,
    onUpdateOption: handleUpdateOption,
    onDeleteOption: handleDeleteOption,
    onReorderOptions: handleReorderOptions,
  };

  // Simple editor props
  const simpleEditorProps = {
    question,
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
              <h3 className="font-semibold text-on-surface">{getQuestionTypeLabel(question.type)}</h3>
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
                className="gap-2 px-4 py-1.5 rounded-md text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:shadow-sm"
              >
                <Pencil className="w-4 h-4" />
                {t('questionEditor.edit')}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="preview"
              className="gap-2 px-4 py-1.5 rounded-md text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:shadow-sm"
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
            <div className="bg-surface rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
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
                        <Button variant="tonal" size="sm" onClick={() => setIsLogicDialogOpen(true)} className="rounded-lg">
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
          <div className="bg-surface rounded-xl border border-outline-variant/30 shadow-sm p-6">
            <QuestionPreview question={question} />
          </div>
        </div>
      </TabsContent>

      {/* Logic Builder Dialog - only in edit mode */}
      {!isReadOnly && survey?.id && !question.id.startsWith('temp_') && (
        <LogicBuilderDialog open={isLogicDialogOpen} onOpenChange={setIsLogicDialogOpen} questionId={question.id} surveyId={survey.id} />
      )}
    </Tabs>
  );
}
