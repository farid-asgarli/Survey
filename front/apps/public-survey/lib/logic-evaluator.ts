/**
 * Logic Evaluator - Client-side conditional logic for surveys
 *
 * This mirrors the backend LogicEvaluationService for instant UI updates.
 * Final validation always happens server-side on submission.
 */

import type { AnswerValue, PublicQuestion } from '@survey/types';

// ============ Enums (matching backend) ============

export const LogicOperator = {
  Equals: 0,
  NotEquals: 1,
  Contains: 2,
  NotContains: 3,
  GreaterThan: 4,
  LessThan: 5,
  GreaterThanOrEquals: 6,
  LessThanOrEquals: 7,
  IsAnswered: 8,
  IsNotAnswered: 9,
  IsEmpty: 10,
  IsNotEmpty: 11,
} as const;
export type LogicOperator = (typeof LogicOperator)[keyof typeof LogicOperator];

export const LogicAction = {
  Show: 0,
  Hide: 1,
  Skip: 2,
  JumpTo: 3,
  EndSurvey: 4,
} as const;
export type LogicAction = (typeof LogicAction)[keyof typeof LogicAction];

// ============ Types ============

export interface LogicRule {
  id: string;
  sourceQuestionId: string;
  operator: LogicOperator;
  value?: string;
  action: LogicAction;
  targetQuestionId?: string;
  order: number;
}

export interface QuestionWithLogic extends PublicQuestion {
  logicRules?: LogicRule[];
}

export interface VisibilityResult {
  visible: boolean;
  skipTo?: string;
  jumpTo?: string;
  endSurvey?: boolean;
}

// ============ Helper Functions ============

/**
 * Checks if an answer value is considered "answered" (non-empty)
 */
function isAnswered(value: AnswerValue): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Normalizes an answer value to a string for comparison
 */
function normalizeAnswerForComparison(value: AnswerValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();

  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    if (value[0] instanceof File) return '';
    return (value as string[]).join(',');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Compares two values as numbers
 */
function compareNumeric(value1: string, value2: string): number {
  const num1 = parseFloat(value1);
  const num2 = parseFloat(value2);
  if (isNaN(num1) || isNaN(num2)) return NaN;
  return num1 - num2;
}

/**
 * Compares two values for equality, handling arrays
 */
function compareEquals(answerStr: string, conditionStr: string, originalValue: AnswerValue): boolean {
  if (Array.isArray(originalValue) && !(originalValue[0] instanceof File)) {
    return (originalValue as string[]).some((v) => v.toLowerCase() === conditionStr.toLowerCase());
  }
  return answerStr.toLowerCase() === conditionStr.toLowerCase();
}

// ============ Core Evaluation Functions ============

/**
 * Evaluates a single logic condition
 */
export function evaluateCondition(answerValue: AnswerValue, operator: LogicOperator, conditionValue?: string): boolean {
  const conditionStr = conditionValue ?? '';

  switch (operator) {
    case LogicOperator.IsAnswered:
      return isAnswered(answerValue);

    case LogicOperator.IsNotAnswered:
      return !isAnswered(answerValue);

    case LogicOperator.IsEmpty:
      return !isAnswered(answerValue);

    case LogicOperator.IsNotEmpty:
      return isAnswered(answerValue);

    case LogicOperator.Equals: {
      const answerStr = normalizeAnswerForComparison(answerValue);
      return compareEquals(answerStr, conditionStr, answerValue);
    }

    case LogicOperator.NotEquals: {
      const answerStr = normalizeAnswerForComparison(answerValue);
      return !compareEquals(answerStr, conditionStr, answerValue);
    }

    case LogicOperator.Contains: {
      const answerStr = normalizeAnswerForComparison(answerValue);
      return answerStr.toLowerCase().includes(conditionStr.toLowerCase());
    }

    case LogicOperator.NotContains: {
      const answerStr = normalizeAnswerForComparison(answerValue);
      return !answerStr.toLowerCase().includes(conditionStr.toLowerCase());
    }

    case LogicOperator.GreaterThan: {
      const comparison = compareNumeric(normalizeAnswerForComparison(answerValue), conditionStr);
      return !isNaN(comparison) && comparison > 0;
    }

    case LogicOperator.LessThan: {
      const comparison = compareNumeric(normalizeAnswerForComparison(answerValue), conditionStr);
      return !isNaN(comparison) && comparison < 0;
    }

    case LogicOperator.GreaterThanOrEquals: {
      const comparison = compareNumeric(normalizeAnswerForComparison(answerValue), conditionStr);
      return !isNaN(comparison) && comparison >= 0;
    }

    case LogicOperator.LessThanOrEquals: {
      const comparison = compareNumeric(normalizeAnswerForComparison(answerValue), conditionStr);
      return !isNaN(comparison) && comparison <= 0;
    }

    default:
      return false;
  }
}

/**
 * Evaluates visibility based on Show/Hide rules
 */
function evaluateVisibilityRules(rules: LogicRule[], answers: Record<string, AnswerValue>): boolean {
  const sortedRules = [...rules].sort((a, b) => a.order - b.order);
  const showRules = sortedRules.filter((r) => r.action === LogicAction.Show);
  const hideRules = sortedRules.filter((r) => r.action === LogicAction.Hide);

  // Check Hide rules first
  for (const rule of hideRules) {
    const sourceAnswer = answers[rule.sourceQuestionId];
    if (evaluateCondition(sourceAnswer, rule.operator, rule.value)) {
      return false;
    }
  }

  // If there are Show rules, at least one must match
  if (showRules.length > 0) {
    for (const rule of showRules) {
      const sourceAnswer = answers[rule.sourceQuestionId];
      if (evaluateCondition(sourceAnswer, rule.operator, rule.value)) {
        return true;
      }
    }
    return false;
  }

  return true;
}

/**
 * Evaluates all logic rules for a question
 */
export function evaluateQuestionVisibility(
  questionId: string,
  allQuestions: QuestionWithLogic[],
  answers: Record<string, AnswerValue>
): VisibilityResult {
  const questionMap = new Map(allQuestions.map((q) => [q.id, q]));
  const question = questionMap.get(questionId);

  if (!question) {
    return { visible: true };
  }

  // Collect all rules that target this question
  const targetingRules: LogicRule[] = [];

  for (const q of allQuestions) {
    if (q.logicRules) {
      for (const rule of q.logicRules) {
        if (rule.targetQuestionId === questionId) {
          targetingRules.push({ ...rule, sourceQuestionId: q.id });
        }
      }
    }
  }

  if (targetingRules.length === 0) {
    return { visible: true };
  }

  const sortedRules = targetingRules.sort((a, b) => a.order - b.order);
  const visible = evaluateVisibilityRules(sortedRules, answers);

  // Check for navigation actions
  let skipTo: string | undefined;
  let jumpTo: string | undefined;
  let endSurvey = false;

  for (const rule of sortedRules) {
    const sourceAnswer = answers[rule.sourceQuestionId];
    const conditionMet = evaluateCondition(sourceAnswer, rule.operator, rule.value);

    if (conditionMet) {
      switch (rule.action) {
        case LogicAction.Skip:
          if (rule.targetQuestionId) {
            skipTo = rule.targetQuestionId;
          }
          break;
        case LogicAction.JumpTo:
          if (rule.targetQuestionId) {
            jumpTo = rule.targetQuestionId;
          }
          break;
        case LogicAction.EndSurvey:
          endSurvey = true;
          break;
      }
    }
  }

  return { visible, skipTo, jumpTo, endSurvey };
}

/**
 * Gets visible questions based on current answers
 */
export function getVisibleQuestions(questions: QuestionWithLogic[], answers: Record<string, AnswerValue>): QuestionWithLogic[] {
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const visibleQuestions: QuestionWithLogic[] = [];

  for (const question of sortedQuestions) {
    const result = evaluateQuestionVisibility(question.id, questions, answers);

    if (result.visible) {
      visibleQuestions.push(question);
    }

    if (result.endSurvey) {
      break;
    }
  }

  return visibleQuestions;
}

/**
 * Checks if the survey should end based on current answers
 */
export function shouldEndSurvey(questions: QuestionWithLogic[], answers: Record<string, AnswerValue>): boolean {
  const endSurveyRules: { rule: LogicRule; questionId: string }[] = [];

  for (const question of questions) {
    if (question.logicRules) {
      for (const rule of question.logicRules) {
        if (rule.action === LogicAction.EndSurvey) {
          endSurveyRules.push({ rule, questionId: question.id });
        }
      }
    }
  }

  endSurveyRules.sort((a, b) => a.rule.order - b.rule.order);

  for (const { rule, questionId } of endSurveyRules) {
    const sourceAnswer = answers[questionId];
    if (evaluateCondition(sourceAnswer, rule.operator, rule.value)) {
      return true;
    }
  }

  return false;
}
