// Logic Builder Dialog - Visual editor for question conditional logic
// M3 Expressive Design: No shadows, gradients, or transforms. Uses border-radius animations and border color changes.

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, Button, IconButton, Select, Input, Skeleton, Chip } from '@/components/ui';
import { Plus, Trash2, GitBranch, AlertCircle, ArrowRight, Eye, EyeOff, SkipForward, CircleStop, GripVertical, Pencil, CornerDownRight } from 'lucide-react';
import {
  useQuestionLogic,
  useCreateLogic,
  useUpdateLogic,
  useDeleteLogic,
  useReorderLogic,
  validateLogicRules,
  getOperatorsForQuestionType,
  getActionLabel,
  getOperatorLabel,
} from '@/hooks/queries/useQuestionLogic';
import { useSurveyBuilderStore } from '@/stores';
import { LogicOperator, LogicAction } from '@/types/enums';
import type { QuestionLogic, CreateLogicRequest, UpdateLogicRequest } from '@/types';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';

interface LogicBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  surveyId: string;
}

interface LogicRuleFormData {
  sourceQuestionId: string;
  operator: LogicOperator;
  conditionValue: string;
  action: LogicAction;
  targetQuestionId: string;
}

const initialFormData: LogicRuleFormData = {
  sourceQuestionId: '',
  operator: LogicOperator.Equals,
  conditionValue: '',
  action: LogicAction.Show,
  targetQuestionId: '',
};

export function LogicBuilderDialog({ open, onOpenChange, questionId, surveyId }: LogicBuilderDialogProps) {
  const { t } = useTranslation();
  const [editingRule, setEditingRule] = useState<QuestionLogic | null>(null);
  const [formData, setFormData] = useState<LogicRuleFormData>(initialFormData);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [draggedRuleIndex, setDraggedRuleIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { questions } = useSurveyBuilderStore();

  // Get the current question
  const currentQuestion = useMemo(() => questions.find((q) => q.id === questionId), [questions, questionId]);

  // Get other questions that can be used as source or target
  const otherQuestions = useMemo(() => questions.filter((q) => q.id !== questionId), [questions, questionId]);

  // Query hooks
  const { data: rules = [], isLoading } = useQuestionLogic(surveyId, questionId);
  const createLogic = useCreateLogic(surveyId, questionId);
  const updateLogic = useUpdateLogic(surveyId, questionId);
  const deleteLogic = useDeleteLogic(surveyId, questionId);
  const reorderLogic = useReorderLogic(surveyId, questionId);

  // Get operators for the selected source question
  const availableOperators = useMemo(() => {
    const sourceQuestion = questions.find((q) => q.id === formData.sourceQuestionId);
    return sourceQuestion ? getOperatorsForQuestionType(sourceQuestion.type, t) : [];
  }, [formData.sourceQuestionId, questions, t]);

  // Get options for the selected source question (for value selection)
  const sourceQuestionOptions = useMemo(() => {
    const sourceQuestion = questions.find((q) => q.id === formData.sourceQuestionId);
    if (!sourceQuestion) return [];
    // Options are in DraftQuestion.options (DraftOption[])
    return sourceQuestion.options.map((o) => ({
      value: o.text,
      label: o.text,
    }));
  }, [formData.sourceQuestionId, questions]);

  // Check if value input is needed for the selected operator
  const needsValueInput = useMemo(() => {
    const noValueOperators: LogicOperator[] = [LogicOperator.IsAnswered, LogicOperator.IsNotAnswered, LogicOperator.IsEmpty, LogicOperator.IsNotEmpty];
    return !noValueOperators.includes(formData.operator);
  }, [formData.operator]);

  // Check if target question is needed for the selected action
  const needsTargetQuestion = useMemo(() => {
    const targetActions: LogicAction[] = [LogicAction.Show, LogicAction.Hide, LogicAction.Skip, LogicAction.JumpTo];
    return targetActions.includes(formData.action);
  }, [formData.action]);

  // Track dialog open state to reset form
  const prevOpenRef = useRef(open);

  // Reset form when dialog opens (not closes)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting form state on dialog open, guarded by ref to run only once
      setFormData(initialFormData);
      setEditingRule(null);
      setIsAddingNew(false);
    }
    prevOpenRef.current = open;
  }, [open]);

  // Derive validation errors from rules (computed, not stored)
  const validationErrors = useMemo(() => {
    if (rules.length > 0) {
      const validation = validateLogicRules(
        rules,
        questions.map((q) => ({ id: q.id, order: q.order }))
      );
      return validation.errors;
    }
    return [];
  }, [rules, questions]);

  const handleStartAddNew = () => {
    setFormData(initialFormData);
    setEditingRule(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (rule: QuestionLogic) => {
    setFormData({
      sourceQuestionId: rule.sourceQuestionId,
      operator: rule.operator,
      conditionValue: rule.conditionValue || '',
      action: rule.action,
      targetQuestionId: rule.targetQuestionId || '',
    });
    setEditingRule(rule);
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setFormData(initialFormData);
    setEditingRule(null);
    setIsAddingNew(false);
  };

  const handleSaveRule = async () => {
    // Validate form
    if (!formData.sourceQuestionId) {
      return;
    }
    if (needsValueInput && !formData.conditionValue) {
      return;
    }
    if (needsTargetQuestion && !formData.targetQuestionId) {
      return;
    }

    try {
      if (editingRule) {
        // When updating, priority is required - use the existing rule's priority
        const updateData: UpdateLogicRequest = {
          sourceQuestionId: formData.sourceQuestionId,
          operator: formData.operator,
          conditionValue: needsValueInput ? formData.conditionValue : undefined,
          action: formData.action,
          targetQuestionId: needsTargetQuestion ? formData.targetQuestionId : undefined,
          priority: editingRule.priority,
        };
        await updateLogic.mutateAsync({ logicId: editingRule.id, data: updateData });
      } else {
        // When creating, priority is optional (backend will auto-assign)
        const createData: CreateLogicRequest = {
          sourceQuestionId: formData.sourceQuestionId,
          operator: formData.operator,
          conditionValue: needsValueInput ? formData.conditionValue : undefined,
          action: formData.action,
          targetQuestionId: needsTargetQuestion ? formData.targetQuestionId : undefined,
        };
        await createLogic.mutateAsync(createData);
      }
      handleCancelEdit();
    } catch (error) {
      console.error('Failed to save logic rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteLogic.mutateAsync(ruleId);
    } catch (error) {
      console.error('Failed to delete logic rule:', error);
    }
  };

  // Drag and drop handlers for reordering rules
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedRuleIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedRuleIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

      if (dragIndex !== dropIndex && rules.length > 1) {
        // Create new order of logic IDs
        const newRules = [...rules];
        const [draggedRule] = newRules.splice(dragIndex, 1);
        newRules.splice(dropIndex, 0, draggedRule);
        const newLogicIds = newRules.map((r) => r.id);

        try {
          await reorderLogic.mutateAsync(newLogicIds);
        } catch (error) {
          console.error('Failed to reorder logic rules:', error);
        }
      }

      setDraggedRuleIndex(null);
      setDragOverIndex(null);
    },
    [rules, reorderLogic]
  );

  const getQuestionLabel = (qId: string) => {
    const q = questions.find((q) => q.id === qId);
    if (!q) return t('conditionalLogic.unknownQuestion');
    return `Q${q.order + 1}: ${q.text.length > 40 ? q.text.substring(0, 40) + '...' : q.text}`;
  };

  const getActionIcon = (action: LogicAction) => {
    switch (action) {
      case LogicAction.Show:
        return <Eye className='w-4 h-4' />;
      case LogicAction.Hide:
        return <EyeOff className='w-4 h-4' />;
      case LogicAction.Skip:
        return <SkipForward className='w-4 h-4' />;
      case LogicAction.JumpTo:
        return <CornerDownRight className='w-4 h-4' />;
      case LogicAction.EndSurvey:
        return <CircleStop className='w-4 h-4' />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size='lg' className='max-h-[85vh]' showClose={false}>
        <DialogHeader
          hero
          icon={<GitBranch className='h-7 w-7' />}
          title={t('conditionalLogic.title')}
          description={t('conditionalLogic.description')}
          showClose
        />

        <DialogBody className='space-y-4'>
          {/* Current Question Info */}
          <div className='p-4 bg-surface-container rounded-3xl'>
            <p className='text-xs text-on-surface-variant mb-1'>{t('conditionalLogic.currentQuestion')}</p>
            <p className='font-medium text-on-surface'>
              Q{currentQuestion?.order ? currentQuestion.order + 1 : '?'}: {currentQuestion?.text || t('common.unknown')}
            </p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className='p-4 bg-error-container rounded-3xl'>
              <div className='flex items-start gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-error/15 text-error shrink-0'>
                  <AlertCircle className='w-4 h-4' />
                </div>
                <div className='min-w-0'>
                  <p className='font-medium text-on-error-container'>{t('conditionalLogic.validationIssues')}</p>
                  <ul className='mt-1 text-sm text-on-error-container/80 list-disc list-inside'>
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Existing Rules */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-medium text-on-surface'>{t('conditionalLogic.logicRules')}</h4>
              {!isAddingNew && !editingRule && (
                <Button variant='tonal' size='sm' onClick={handleStartAddNew}>
                  <Plus className='w-4 h-4 mr-1' />
                  {t('conditionalLogic.addRule')}
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className='space-y-2'>
                <Skeleton className='h-20 w-full rounded-3xl' />
                <Skeleton className='h-20 w-full rounded-3xl' />
              </div>
            ) : rules.length === 0 && !isAddingNew ? (
              <div className='py-8 text-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant mx-auto mb-3'>
                  <GitBranch className='w-6 h-6' />
                </div>
                <p className='text-on-surface-variant'>{t('conditionalLogic.noRules')}</p>
                <p className='text-sm text-on-surface-variant/70 mt-1'>{t('conditionalLogic.addRuleToStart')}</p>
                <Button variant='tonal' size='sm' className='mt-4' onClick={handleStartAddNew}>
                  <Plus className='w-4 h-4 mr-1' />
                  {t('conditionalLogic.addFirstRule')}
                </Button>
              </div>
            ) : (
              <div className='space-y-2'>
                {rules.length > 1 && <p className='text-xs text-on-surface-variant mb-2'>{t('conditionalLogic.dragToReorder')}</p>}
                {rules.map((rule, index) => (
                  <div
                    key={rule.id}
                    draggable={!editingRule && rules.length > 1}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    className={cn(
                      'p-4 border-2 bg-surface-container-low',
                      'transition-[border-radius,border-color,background-color] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
                      // Base state - M3 idle radius (24px)
                      'rounded-3xl',
                      // Editing state - M3 hover radius (28px)
                      editingRule?.id === rule.id
                        ? 'border-primary bg-primary/5 !rounded-[28px]'
                        : 'border-outline-variant/30 hover:border-outline-variant/60 hover:!rounded-[28px]',
                      // Drag states - using border changes, no opacity or scale - M3 focus radius (36px)
                      draggedRuleIndex === index && 'border-primary/50 bg-surface-container',
                      dragOverIndex === index && draggedRuleIndex !== index && 'border-primary border-dashed bg-primary/5 !rounded-[36px]',
                      // Cursor
                      !editingRule && rules.length > 1 && 'cursor-grab active:cursor-grabbing'
                    )}
                  >
                    {editingRule?.id === rule.id ? (
                      <RuleForm
                        formData={formData}
                        setFormData={setFormData}
                        otherQuestions={otherQuestions}
                        availableOperators={availableOperators}
                        sourceQuestionOptions={sourceQuestionOptions}
                        needsValueInput={needsValueInput}
                        needsTargetQuestion={needsTargetQuestion}
                        onSave={handleSaveRule}
                        onCancel={handleCancelEdit}
                        isSaving={updateLogic.isPending}
                        getQuestionLabel={getQuestionLabel}
                        t={t}
                      />
                    ) : (
                      <div className='flex items-start gap-3'>
                        {/* Drag Handle */}
                        {rules.length > 1 && (
                          <div className='shrink-0 pt-1 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors cursor-grab'>
                            <GripVertical className='w-4 h-4' />
                          </div>
                        )}
                        {/* Rule Order Badge */}
                        <div className='shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container'>
                          <span className='text-sm font-medium'>{index + 1}</span>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <RuleSummary rule={rule} getQuestionLabel={getQuestionLabel} getActionIcon={getActionIcon} t={t} />
                        </div>
                        <div className='flex items-center gap-1 shrink-0'>
                          <IconButton variant='standard' size='sm' aria-label={t('common.edit')} onClick={() => handleStartEdit(rule)}>
                            <Pencil className='w-4 h-4' />
                          </IconButton>
                          <IconButton
                            variant='standard'
                            size='sm'
                            aria-label={t('common.delete')}
                            onClick={() => handleDeleteRule(rule.id)}
                            className='text-on-surface-variant hover:text-error transition-colors'
                          >
                            <Trash2 className='w-4 h-4' />
                          </IconButton>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Rule Form */}
            {isAddingNew && (
              <div className='p-4 rounded-3xl border-2 border-primary bg-primary/5'>
                <RuleForm
                  formData={formData}
                  setFormData={setFormData}
                  otherQuestions={otherQuestions}
                  availableOperators={availableOperators}
                  sourceQuestionOptions={sourceQuestionOptions}
                  needsValueInput={needsValueInput}
                  needsTargetQuestion={needsTargetQuestion}
                  onSave={handleSaveRule}
                  onCancel={handleCancelEdit}
                  isSaving={createLogic.isPending}
                  getQuestionLabel={getQuestionLabel}
                  t={t}
                />
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant='text' onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Rule Form Component - M3 Expressive with proper spacing and icon containers
interface RuleFormProps {
  formData: LogicRuleFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogicRuleFormData>>;
  otherQuestions: DraftQuestion[];
  availableOperators: { value: string; label: string }[];
  sourceQuestionOptions: { value: string; label: string }[];
  needsValueInput: boolean;
  needsTargetQuestion: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  getQuestionLabel: (qId: string) => string;
  t: (key: string) => string;
}

function RuleForm({
  formData,
  setFormData,
  otherQuestions,
  availableOperators,
  sourceQuestionOptions,
  needsValueInput,
  needsTargetQuestion,
  onSave,
  onCancel,
  isSaving,
  getQuestionLabel,
  t,
}: RuleFormProps) {
  const questionOptions = otherQuestions.map((q) => ({
    value: q.id,
    label: getQuestionLabel(q.id),
  }));

  const actionOptions = [
    { value: String(LogicAction.Show), label: t('conditionalLogic.actions.show') },
    { value: String(LogicAction.Hide), label: t('conditionalLogic.actions.hide') },
    { value: String(LogicAction.Skip), label: t('conditionalLogic.actions.skip') },
    { value: String(LogicAction.JumpTo), label: t('conditionalLogic.actions.jumpTo') },
    { value: String(LogicAction.EndSurvey), label: t('conditionalLogic.actions.endSurvey') },
  ];

  return (
    <div className='space-y-4'>
      {/* Condition Section */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant shrink-0'>
            <span className='text-xs font-medium'>IF</span>
          </div>
          <span className='text-sm text-on-surface-variant'>{t('conditionalLogic.form.conditionSection')}</span>
        </div>

        <div className='grid gap-3 md:grid-cols-2'>
          {/* Source Question */}
          <Select
            label={t('conditionalLogic.form.ifAnswerTo')}
            placeholder={t('conditionalLogic.form.selectQuestion')}
            options={questionOptions}
            value={formData.sourceQuestionId}
            onChange={(value) => setFormData((prev) => ({ ...prev, sourceQuestionId: value, conditionValue: '', operator: LogicOperator.Equals }))}
          />

          {/* Operator */}
          <Select
            label={t('conditionalLogic.form.condition')}
            placeholder={t('conditionalLogic.form.selectCondition')}
            options={availableOperators}
            value={String(formData.operator)}
            onChange={(value) => setFormData((prev) => ({ ...prev, operator: parseInt(value) as LogicOperator }))}
            disabled={!formData.sourceQuestionId}
          />
        </div>

        {/* Value Input */}
        {needsValueInput && formData.sourceQuestionId && (
          <div>
            {sourceQuestionOptions.length > 0 ? (
              <Select
                label={t('conditionalLogic.form.value')}
                placeholder={t('conditionalLogic.form.selectValue')}
                options={sourceQuestionOptions}
                value={formData.conditionValue}
                onChange={(conditionValue) => setFormData((prev) => ({ ...prev, conditionValue }))}
              />
            ) : (
              <Input
                label={t('conditionalLogic.form.value')}
                placeholder={t('conditionalLogic.form.enterValue')}
                value={formData.conditionValue}
                onChange={(e) => setFormData((prev) => ({ ...prev, conditionValue: e.target.value }))}
              />
            )}
          </div>
        )}
      </div>

      {/* Visual Separator */}
      <div className='flex items-center gap-3 py-1'>
        <div className='h-px flex-1 bg-outline-variant/30' />
        <div className='flex items-center gap-2 text-on-surface-variant'>
          <ArrowRight className='w-4 h-4' />
          <span className='text-xs font-medium uppercase tracking-wide'>{t('conditionalLogic.then')}</span>
        </div>
        <div className='h-px flex-1 bg-outline-variant/30' />
      </div>

      {/* Action Section */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-on-primary-container shrink-0'>
            <span className='text-xs font-medium'>DO</span>
          </div>
          <span className='text-sm text-on-surface-variant'>{t('conditionalLogic.form.actionSection')}</span>
        </div>

        <div className='grid gap-3 md:grid-cols-2'>
          {/* Action */}
          <Select
            label={t('conditionalLogic.form.action')}
            placeholder={t('conditionalLogic.form.selectAction')}
            options={actionOptions}
            value={String(formData.action)}
            onChange={(value) => setFormData((prev) => ({ ...prev, action: parseInt(value) as LogicAction, targetQuestionId: '' }))}
          />

          {/* Target Question */}
          {needsTargetQuestion && (
            <Select
              label={formData.action === LogicAction.Skip ? t('conditionalLogic.form.skipTo') : t('conditionalLogic.form.targetQuestion')}
              placeholder={t('conditionalLogic.form.selectTargetQuestion')}
              options={questionOptions}
              value={formData.targetQuestionId}
              onChange={(value) => setFormData((prev) => ({ ...prev, targetQuestionId: value }))}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30'>
        <Button variant='text' onClick={onCancel} disabled={isSaving}>
          {t('common.cancel')}
        </Button>
        <Button variant='filled' onClick={onSave} disabled={isSaving}>
          {isSaving ? t('common.saving') : t('conditionalLogic.saveRule')}
        </Button>
      </div>
    </div>
  );
}

// Rule Summary Component - M3 Expressive with Chip components
interface RuleSummaryProps {
  rule: QuestionLogic;
  getQuestionLabel: (qId: string) => string;
  getActionIcon: (action: LogicAction) => React.ReactNode;
  t: (key: string) => string;
}

function RuleSummary({ rule, getQuestionLabel, getActionIcon, t }: RuleSummaryProps) {
  return (
    <div className='space-y-2'>
      {/* Condition Row */}
      <div className='flex flex-wrap items-center gap-2 text-sm'>
        <span className='text-on-surface-variant'>{t('conditionalLogic.if')}</span>
        <Chip size='sm' variant='assist'>
          {getQuestionLabel(rule.sourceQuestionId)}
        </Chip>
        <span className='text-on-surface-variant'>{getOperatorLabel(rule.operator, t)}</span>
        {rule.conditionValue && (
          <Chip size='sm' variant='input'>
            {rule.conditionValue}
          </Chip>
        )}
      </div>
      {/* Action Row */}
      <div className='flex flex-wrap items-center gap-2 text-sm'>
        <ArrowRight className='w-4 h-4 text-on-surface-variant shrink-0' />
        <Chip size='sm' variant='suggestion'>
          <span className='flex items-center gap-1.5'>
            {getActionIcon(rule.action)}
            {getActionLabel(rule.action, t)}
          </span>
        </Chip>
        {rule.targetQuestionId && (
          <>
            <span className='text-on-surface-variant'>→</span>
            <Chip size='sm' variant='assist'>
              {getQuestionLabel(rule.targetQuestionId)}
            </Chip>
          </>
        )}
      </div>
    </div>
  );
}
