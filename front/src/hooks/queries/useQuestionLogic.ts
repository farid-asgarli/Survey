// React Query hooks for Question Logic operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logicApi } from '@/services';
import type { CreateLogicRequest, QuestionLogic, QuestionType, LogicOperator, LogicAction } from '@/types';
import { QuestionType as QT, LogicOperator as LO, LogicAction as LA } from '@/types/enums';

// Query keys
export const logicKeys = {
  all: ['logic'] as const,
  lists: () => [...logicKeys.all, 'list'] as const,
  list: (surveyId: string, questionId: string) => [...logicKeys.lists(), surveyId, questionId] as const,
  logicMap: (surveyId: string) => [...logicKeys.all, 'map', surveyId] as const,
};

/**
 * Hook to fetch logic rules for a specific question
 */
export function useQuestionLogic(surveyId: string | undefined, questionId: string | undefined) {
  return useQuery({
    queryKey: logicKeys.list(surveyId!, questionId!),
    queryFn: () => logicApi.list(surveyId!, questionId!),
    enabled: !!surveyId && !!questionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch the full logic map for a survey
 */
export function useLogicMap(surveyId: string | undefined) {
  return useQuery({
    queryKey: logicKeys.logicMap(surveyId!),
    queryFn: () => logicApi.getLogicMap(surveyId!),
    enabled: !!surveyId,
    staleTime: 2 * 60 * 1000,
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
 * Validate logic rules for circular references
 */
export function validateLogicRules(rules: QuestionLogic[], questions: { id: string; order: number }[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Build a map for quick question lookup
  const questionMap = new Map(questions.map((q) => [q.id, q]));

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
    const outgoingRules = rules.filter((r) => r.sourceQuestionId === questionId && r.targetQuestionId);

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

/**
 * Get available operators for a question type
 */
export function getOperatorsForQuestionType(questionType: QuestionType): { value: string; label: string }[] {
  const baseOperators = [
    { value: String(LO.IsAnswered), label: 'Is answered' },
    { value: String(LO.IsNotAnswered), label: 'Is not answered' },
  ];

  switch (questionType) {
    case QT.SingleChoice:
    case QT.MultipleChoice:
    case QT.Dropdown:
    case QT.Checkbox:
    case QT.YesNo:
      return [
        { value: String(LO.Equals), label: 'Equals' },
        { value: String(LO.NotEquals), label: 'Does not equal' },
        { value: String(LO.Contains), label: 'Contains' },
        ...baseOperators,
      ];
    case QT.Text:
    case QT.LongText:
    case QT.ShortText:
    case QT.Email:
      return [
        { value: String(LO.Equals), label: 'Equals' },
        { value: String(LO.NotEquals), label: 'Does not equal' },
        { value: String(LO.Contains), label: 'Contains' },
        ...baseOperators,
      ];
    case QT.Rating:
    case QT.Scale:
    case QT.NPS:
    case QT.Number:
      return [
        { value: String(LO.Equals), label: 'Equals' },
        { value: String(LO.NotEquals), label: 'Does not equal' },
        { value: String(LO.GreaterThan), label: 'Greater than' },
        { value: String(LO.LessThan), label: 'Less than' },
        ...baseOperators,
      ];
    case QT.Date:
    case QT.DateTime:
      return [
        { value: String(LO.Equals), label: 'Equals' },
        { value: String(LO.GreaterThan), label: 'After' },
        { value: String(LO.LessThan), label: 'Before' },
        ...baseOperators,
      ];
    default:
      return baseOperators;
  }
}

/**
 * Get label for a logic action
 */
export function getActionLabel(action: LogicAction): string {
  const labels: Record<number, string> = {
    [LA.Show]: 'Show question',
    [LA.Hide]: 'Hide question',
    [LA.Skip]: 'Skip to question',
    [LA.EndSurvey]: 'End survey',
  };
  return labels[action] || String(action);
}

/**
 * Get label for a logic operator
 */
export function getOperatorLabel(operator: LogicOperator): string {
  const labels: Record<number, string> = {
    [LO.Equals]: 'equals',
    [LO.NotEquals]: 'does not equal',
    [LO.Contains]: 'contains',
    [LO.GreaterThan]: 'is greater than',
    [LO.LessThan]: 'is less than',
    [LO.IsAnswered]: 'is answered',
    [LO.IsNotAnswered]: 'is not answered',
  };
  return labels[operator] || String(operator);
}
