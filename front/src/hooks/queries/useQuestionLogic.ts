// React Query hooks for Question Logic operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logicApi } from '@/services';
import type { CreateLogicRequest, QuestionLogic, LogicMapResponse, LogicNodeDto, LogicEdgeDto } from '@/types';
import { QuestionType, LogicOperator, LogicAction } from '@/types/enums';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

/** Translation function type */
export type TranslationFn = (key: string) => string;

// Query keys - logic uses surveyId+questionId scoped list and surveyId scoped logicMap
export const logicKeys = createExtendedQueryKeys('logic', (base) => ({
  list: (surveyId: string, questionId: string) => [...base.lists(), surveyId, questionId] as const,
  logicMap: (surveyId: string) => [...base.all, 'map', surveyId] as const,
}));

/**
 * Transformed logic map structure for component consumption.
 * Converts backend graph structure (nodes/edges) to component-friendly format.
 */
export interface TransformedLogicMap {
  surveyId: string;
  /** Graph structure from backend - use for advanced visualizations */
  nodes: LogicNodeDto[];
  edges: LogicEdgeDto[];
  /** Questions with embedded logic rules - for backward compatibility with components */
  questions: {
    id: string;
    text: string;
    order: number;
    type: string;
    hasLogic: boolean;
    isConditional: boolean;
    logicRules: QuestionLogic[];
  }[];
}

/**
 * Transform backend LogicMapResponse (nodes/edges) to component-friendly format.
 */
function transformLogicMapResponse(response: LogicMapResponse): TransformedLogicMap {
  // Build rules from edges - group edges by source question
  const edgesBySource = new Map<string, LogicEdgeDto[]>();
  for (const edge of response.edges) {
    const existing = edgesBySource.get(edge.sourceId) || [];
    existing.push(edge);
    edgesBySource.set(edge.sourceId, existing);
  }

  // Transform nodes to questions with embedded rules
  const questions = response.nodes.map((node) => {
    const nodeEdges = edgesBySource.get(node.id) || [];
    const logicRules: QuestionLogic[] = nodeEdges.map((edge, index) => ({
      id: edge.id,
      questionId: edge.sourceId, // The question this rule belongs to
      sourceQuestionId: edge.sourceId,
      targetQuestionId: edge.targetId,
      operator: edge.operator,
      conditionValue: edge.conditionValue,
      action: edge.action,
      priority: index,
    }));

    return {
      id: node.id,
      text: node.text,
      order: node.order,
      type: node.type,
      hasLogic: node.hasLogic,
      isConditional: node.isConditional,
      logicRules,
    };
  });

  return {
    surveyId: response.surveyId,
    nodes: response.nodes,
    edges: response.edges,
    questions,
  };
}

/**
 * Hook to fetch logic rules for a specific question
 */
export function useQuestionLogic(surveyId: string | undefined, questionId: string | undefined) {
  return useQuery({
    queryKey: logicKeys.list(surveyId!, questionId!),
    queryFn: () => logicApi.list(surveyId!, questionId!),
    enabled: !!surveyId && !!questionId,
    staleTime: STALE_TIMES.MEDIUM,
  });
}

/**
 * Hook to fetch the full logic map for a survey.
 * Returns both the raw graph structure (nodes/edges) and transformed questions array.
 */
export function useLogicMap(surveyId: string | undefined) {
  return useQuery({
    queryKey: logicKeys.logicMap(surveyId!),
    queryFn: async () => {
      const response = await logicApi.getLogicMap(surveyId!);
      return transformLogicMapResponse(response);
    },
    enabled: !!surveyId,
    staleTime: STALE_TIMES.MEDIUM,
  });
}

/**
 * Hook to create a new logic rule
 */
export function useCreateLogic(surveyId: string, questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLogicRequest) => logicApi.create(surveyId, questionId, data),
    onSuccess: () => {
      // Invalidate logic list for this question
      queryClient.invalidateQueries({
        queryKey: logicKeys.list(surveyId, questionId),
      });
      // Invalidate logic map
      queryClient.invalidateQueries({
        queryKey: logicKeys.logicMap(surveyId),
      });
    },
  });
}

/**
 * Hook to update a logic rule
 */
export function useUpdateLogic(surveyId: string, questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logicId, data }: { logicId: string; data: Partial<CreateLogicRequest> }) => logicApi.update(surveyId, questionId, logicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: logicKeys.list(surveyId, questionId),
      });
      queryClient.invalidateQueries({
        queryKey: logicKeys.logicMap(surveyId),
      });
    },
  });
}

/**
 * Hook to delete a logic rule
 */
export function useDeleteLogic(surveyId: string, questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logicId: string) => logicApi.delete(surveyId, questionId, logicId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: logicKeys.list(surveyId, questionId),
      });
      queryClient.invalidateQueries({
        queryKey: logicKeys.logicMap(surveyId),
      });
    },
  });
}

/**
 * Hook to reorder logic rules
 */
export function useReorderLogic(surveyId: string, questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logicIds: string[]) => logicApi.reorder(surveyId, questionId, logicIds),
    onMutate: async (logicIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: logicKeys.list(surveyId, questionId),
      });

      // Snapshot the previous value
      const previousRules = queryClient.getQueryData<QuestionLogic[]>(logicKeys.list(surveyId, questionId));

      // Optimistically update to the new order
      if (previousRules) {
        const reorderedRules = logicIds
          .map((id, index) => {
            const rule = previousRules.find((r) => r.id === id);
            return rule ? { ...rule, priority: index } : null;
          })
          .filter((r): r is QuestionLogic => r !== null);

        queryClient.setQueryData(logicKeys.list(surveyId, questionId), reorderedRules);
      }

      return { previousRules };
    },
    onError: (_err, _logicIds, context) => {
      // If the mutation fails, roll back
      if (context?.previousRules) {
        queryClient.setQueryData(logicKeys.list(surveyId, questionId), context.previousRules);
      }
    },
    onSettled: () => {
      // Invalidate to refetch the actual data
      queryClient.invalidateQueries({
        queryKey: logicKeys.list(surveyId, questionId),
      });
      queryClient.invalidateQueries({
        queryKey: logicKeys.logicMap(surveyId),
      });
    },
  });
}

/**
 * Hook to evaluate logic on the server
 * Use for: validation, preview mode, analytics, or complex conditions
 *
 * @example
 * ```tsx
 * const { mutateAsync: evaluateLogic } = useEvaluateLogic(surveyId);
 *
 * // On survey submission
 * const result = await evaluateLogic({ answers: preparedAnswers });
 * if (result.shouldEndSurvey) {
 *   // Handle early termination
 * }
 * ```
 */
export function useEvaluateLogic(surveyId: string) {
  return useMutation({
    mutationFn: ({ answers, currentQuestionId }: { answers: { questionId: string; value: string }[]; currentQuestionId?: string }) =>
      logicApi.evaluateLogic(surveyId, answers, currentQuestionId),
  });
}

/**
 * Validate logic rules for circular references and consistency.
 * @param rules - Array of logic rules to validate
 * @param questions - Array of questions with id and order
 * @returns Validation result with isValid flag and error messages
 */
export function validateLogicRules(
  rules: QuestionLogic[] | null | undefined,
  questions: { id: string; order: number }[] | null | undefined
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Handle null/undefined inputs
  if (!rules || !questions) {
    return { isValid: true, errors: [] };
  }

  if (rules.length === 0) {
    return { isValid: true, errors: [] };
  }

  // Build a map for quick question lookup
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  // Create local reference for use in nested function (TypeScript narrowing)
  const validRules = rules;

  // Check for circular references using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCircularReference(questionId: string, path: string[] = []): boolean {
    if (recursionStack.has(questionId)) {
      errors.push(`Circular reference detected: ${[...path, questionId].join(' → ')}`);
      return true;
    }

    if (visited.has(questionId)) {
      return false;
    }

    visited.add(questionId);
    recursionStack.add(questionId);

    // Find all rules that target this question
    const outgoingRules = validRules.filter((r) => r.sourceQuestionId === questionId && r.targetQuestionId);

    for (const rule of outgoingRules) {
      if (rule.targetQuestionId && hasCircularReference(rule.targetQuestionId, [...path, questionId])) {
        return true;
      }
    }

    recursionStack.delete(questionId);
    return false;
  }

  // Check each question
  for (const question of questions) {
    if (!visited.has(question.id)) {
      hasCircularReference(question.id);
    }
  }

  // Check for self-referencing rules
  for (const rule of rules) {
    if (rule.sourceQuestionId === rule.targetQuestionId) {
      errors.push(`Question cannot reference itself`);
    }

    // Check if source question exists
    if (!questionMap.has(rule.sourceQuestionId)) {
      errors.push(`Source question not found for rule`);
    }

    // Check if target question exists (if applicable)
    if (rule.targetQuestionId && !questionMap.has(rule.targetQuestionId)) {
      errors.push(`Target question not found for rule`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: [...new Set(errors)], // Remove duplicates
  };
}

/** Operator option for Select component - value is stringified for UI compatibility */
export interface OperatorOption {
  value: string;
  label: string;
}

/** Maps LogicOperator enum to translation key */
const operatorTranslationKeys: Record<LogicOperator, string> = {
  [LogicOperator.Equals]: 'conditionalLogic.operators.equals',
  [LogicOperator.NotEquals]: 'conditionalLogic.operators.notEquals',
  [LogicOperator.Contains]: 'conditionalLogic.operators.contains',
  [LogicOperator.NotContains]: 'conditionalLogic.operators.notContains',
  [LogicOperator.GreaterThan]: 'conditionalLogic.operators.greaterThan',
  [LogicOperator.GreaterThanOrEquals]: 'conditionalLogic.operators.greaterThanOrEquals',
  [LogicOperator.LessThan]: 'conditionalLogic.operators.lessThan',
  [LogicOperator.LessThanOrEquals]: 'conditionalLogic.operators.lessThanOrEquals',
  [LogicOperator.IsEmpty]: 'conditionalLogic.operators.isEmpty',
  [LogicOperator.IsNotEmpty]: 'conditionalLogic.operators.isNotEmpty',
  [LogicOperator.IsAnswered]: 'conditionalLogic.operators.isAnswered',
  [LogicOperator.IsNotAnswered]: 'conditionalLogic.operators.isNotAnswered',
};

/** Maps LogicOperator enum to translation key for inline labels (lowercase) */
const operatorLabelTranslationKeys: Record<LogicOperator, string> = {
  [LogicOperator.Equals]: 'conditionalLogic.operatorLabels.equals',
  [LogicOperator.NotEquals]: 'conditionalLogic.operatorLabels.notEquals',
  [LogicOperator.Contains]: 'conditionalLogic.operatorLabels.contains',
  [LogicOperator.NotContains]: 'conditionalLogic.operatorLabels.notContains',
  [LogicOperator.GreaterThan]: 'conditionalLogic.operatorLabels.greaterThan',
  [LogicOperator.GreaterThanOrEquals]: 'conditionalLogic.operatorLabels.greaterThanOrEquals',
  [LogicOperator.LessThan]: 'conditionalLogic.operatorLabels.lessThan',
  [LogicOperator.LessThanOrEquals]: 'conditionalLogic.operatorLabels.lessThanOrEquals',
  [LogicOperator.IsEmpty]: 'conditionalLogic.operatorLabels.isEmpty',
  [LogicOperator.IsNotEmpty]: 'conditionalLogic.operatorLabels.isNotEmpty',
  [LogicOperator.IsAnswered]: 'conditionalLogic.operatorLabels.isAnswered',
  [LogicOperator.IsNotAnswered]: 'conditionalLogic.operatorLabels.isNotAnswered',
};

/** Maps LogicAction enum to translation key */
const actionLabelTranslationKeys: Record<LogicAction, string> = {
  [LogicAction.Show]: 'conditionalLogic.actionLabels.show',
  [LogicAction.Hide]: 'conditionalLogic.actionLabels.hide',
  [LogicAction.Skip]: 'conditionalLogic.actionLabels.skip',
  [LogicAction.JumpTo]: 'conditionalLogic.actionLabels.jumpTo',
  [LogicAction.EndSurvey]: 'conditionalLogic.actionLabels.endSurvey',
};

/**
 * Get available operators for a question type.
 * Returns operators with string values for UI Select component compatibility.
 * Use parseInt(value) to convert back to LogicOperator enum.
 * @param questionType - The question type to get operators for
 * @param t - Translation function from useTranslation()
 */
export function getOperatorsForQuestionType(questionType: QuestionType, t: TranslationFn): OperatorOption[] {
  const baseOperators: OperatorOption[] = [
    { value: String(LogicOperator.IsAnswered), label: t(operatorTranslationKeys[LogicOperator.IsAnswered]) },
    { value: String(LogicOperator.IsNotAnswered), label: t(operatorTranslationKeys[LogicOperator.IsNotAnswered]) },
    { value: String(LogicOperator.IsEmpty), label: t(operatorTranslationKeys[LogicOperator.IsEmpty]) },
    { value: String(LogicOperator.IsNotEmpty), label: t(operatorTranslationKeys[LogicOperator.IsNotEmpty]) },
  ];

  switch (questionType) {
    case QuestionType.SingleChoice:
    case QuestionType.MultipleChoice:
    case QuestionType.Dropdown:
    case QuestionType.Checkbox:
    case QuestionType.YesNo:
      return [
        { value: String(LogicOperator.Equals), label: t(operatorTranslationKeys[LogicOperator.Equals]) },
        { value: String(LogicOperator.NotEquals), label: t(operatorTranslationKeys[LogicOperator.NotEquals]) },
        { value: String(LogicOperator.Contains), label: t(operatorTranslationKeys[LogicOperator.Contains]) },
        { value: String(LogicOperator.NotContains), label: t(operatorTranslationKeys[LogicOperator.NotContains]) },
        ...baseOperators,
      ];
    case QuestionType.Text:
    case QuestionType.LongText:
    case QuestionType.ShortText:
    case QuestionType.Email:
      return [
        { value: String(LogicOperator.Equals), label: t(operatorTranslationKeys[LogicOperator.Equals]) },
        { value: String(LogicOperator.NotEquals), label: t(operatorTranslationKeys[LogicOperator.NotEquals]) },
        { value: String(LogicOperator.Contains), label: t(operatorTranslationKeys[LogicOperator.Contains]) },
        { value: String(LogicOperator.NotContains), label: t(operatorTranslationKeys[LogicOperator.NotContains]) },
        ...baseOperators,
      ];
    case QuestionType.Rating:
    case QuestionType.Scale:
    case QuestionType.NPS:
    case QuestionType.Number:
      return [
        { value: String(LogicOperator.Equals), label: t(operatorTranslationKeys[LogicOperator.Equals]) },
        { value: String(LogicOperator.NotEquals), label: t(operatorTranslationKeys[LogicOperator.NotEquals]) },
        { value: String(LogicOperator.GreaterThan), label: t(operatorTranslationKeys[LogicOperator.GreaterThan]) },
        { value: String(LogicOperator.GreaterThanOrEquals), label: t(operatorTranslationKeys[LogicOperator.GreaterThanOrEquals]) },
        { value: String(LogicOperator.LessThan), label: t(operatorTranslationKeys[LogicOperator.LessThan]) },
        { value: String(LogicOperator.LessThanOrEquals), label: t(operatorTranslationKeys[LogicOperator.LessThanOrEquals]) },
        ...baseOperators,
      ];
    case QuestionType.Date:
    case QuestionType.DateTime:
      return [
        { value: String(LogicOperator.Equals), label: t(operatorTranslationKeys[LogicOperator.Equals]) },
        { value: String(LogicOperator.GreaterThan), label: t('conditionalLogic.operators.after') },
        { value: String(LogicOperator.GreaterThanOrEquals), label: t('conditionalLogic.operators.onOrAfter') },
        { value: String(LogicOperator.LessThan), label: t('conditionalLogic.operators.before') },
        { value: String(LogicOperator.LessThanOrEquals), label: t('conditionalLogic.operators.onOrBefore') },
        ...baseOperators,
      ];
    default:
      return baseOperators;
  }
}

/**
 * Get label for a logic action.
 * Maps numeric LogicAction enum values to human-readable labels.
 * @param action - The logic action enum value
 * @param t - Translation function from useTranslation()
 */
export function getActionLabel(action: LogicAction, t: TranslationFn): string {
  const key = actionLabelTranslationKeys[action];
  return key ? t(key) : `Unknown action (${action})`;
}

/**
 * Get label for a logic operator.
 * Maps numeric LogicOperator enum values to human-readable labels.
 * @param operator - The logic operator enum value
 * @param t - Translation function from useTranslation()
 */
export function getOperatorLabel(operator: LogicOperator, t: TranslationFn): string {
  const key = operatorLabelTranslationKeys[operator];
  return key ? t(key) : `Unknown operator (${operator})`;
}
