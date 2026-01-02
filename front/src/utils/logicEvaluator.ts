/**
 * Logic Evaluator - Evaluates conditional logic rules for public surveys
 *
 * ## Architecture Decision: Hybrid Frontend + Backend Evaluation
 *
 * This module implements client-side logic evaluation that mirrors the backend
 * `LogicEvaluationService.cs`. Both implementations are intentionally maintained
 * in sync for these reasons:
 *
 * ### Why Frontend (This Module)
 * - **Real-time UX**: Show/hide questions instantly (<16ms response)
 * - **Offline Support**: Works with localStorage auto-save
 * - **No Latency**: No API calls on every keystroke/selection
 *
 * ### Why Backend (LogicEvaluationService.cs)
 * - **Security**: Final validation on survey submission
 * - **Single Source of Truth**: Analytics and reporting
 * - **Complex Conditions**: Quota checks, database lookups, external APIs
 *
 * ### When to Use Backend API (`evaluateLogicOnServer`)
 * - Admin preview mode (testing survey flow)
 * - Final submission validation
 * - Conditions requiring server data (quotas, user history)
 * - Analytics: "What questions were actually shown?"
 *
 * @see backend: SurveyApp.Infrastructure/Services/LogicEvaluationService.cs
 * @see api: POST /api/surveys/{surveyId}/evaluate-logic
 */

import type { AnswerValue } from '@/types/public-survey';
import type { EvaluateLogicRequest, EvaluateLogicResponse, AnswerForEvaluation } from '@/types';
import { LogicOperator, LogicAction } from '@/types/enums';

// Re-export types for backward compatibility
export type { EvaluateLogicRequest, EvaluateLogicResponse, AnswerForEvaluation };

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

export interface QuestionWithLogic {
  id: string;
  order: number;
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
    if (value[0] instanceof File) return ''; // Files can't be compared
    return (value as string[]).join(',');
  }

  if (typeof value === 'object') {
    // Matrix answers - return JSON
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Compares two values as numbers, returns comparison result or NaN if not numeric
 */
function compareNumeric(value1: string, value2: string): number {
  const num1 = parseFloat(value1);
  const num2 = parseFloat(value2);
  if (isNaN(num1) || isNaN(num2)) return NaN;
  return num1 - num2;
}

/**
 * Compares two values for equality, handling arrays (multiple choice)
 */
function compareEquals(answerStr: string, conditionStr: string, originalValue: AnswerValue): boolean {
  // For multiple choice (arrays), check if the condition value is in the array
  if (Array.isArray(originalValue) && !(originalValue[0] instanceof File)) {
    return (originalValue as string[]).some((v) => v.toLowerCase() === conditionStr.toLowerCase());
  }

  // Case-insensitive comparison for strings
  return answerStr.toLowerCase() === conditionStr.toLowerCase();
}

// ============ Core Evaluation Functions ============

/**
 * Evaluates a single logic condition
 * Aligned with backend LogicEvaluationService.EvaluateCondition
 */
export function evaluateCondition(answerValue: AnswerValue, operator: LogicOperator, conditionValue?: string): boolean {
  const conditionStr = conditionValue ?? '';

  switch (operator) {
    // Presence operators (no condition value needed)
    case LogicOperator.IsAnswered:
      return isAnswered(answerValue);

    case LogicOperator.IsNotAnswered:
      return !isAnswered(answerValue);

    case LogicOperator.IsEmpty:
      return !isAnswered(answerValue);

    case LogicOperator.IsNotEmpty:
      return isAnswered(answerValue);

    // Comparison operators
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

    // Numeric operators
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
 * Aligned with backend LogicEvaluationService.EvaluateQuestionVisibility
 */
function evaluateVisibilityRules(rules: LogicRule[], answers: Record<string, AnswerValue>): boolean {
  // Separate and sort rules by order (priority)
  const sortedRules = [...rules].sort((a, b) => a.order - b.order);
  const showRules = sortedRules.filter((r) => r.action === LogicAction.Show);
  const hideRules = sortedRules.filter((r) => r.action === LogicAction.Hide);

  // Check Hide rules first - if any match, hide the question
  for (const rule of hideRules) {
    const sourceAnswer = answers[rule.sourceQuestionId];
    if (evaluateCondition(sourceAnswer, rule.operator, rule.value)) {
      return false; // Hide condition met
    }
  }

  // If there are Show rules, at least one must match
  if (showRules.length > 0) {
    for (const rule of showRules) {
      const sourceAnswer = answers[rule.sourceQuestionId];
      if (evaluateCondition(sourceAnswer, rule.operator, rule.value)) {
        return true; // Show condition met
      }
    }
    return false; // No Show condition met
  }

  // No Show rules and no Hide rules triggered - visible by default
  return true;
}

/**
 * Evaluates all logic rules for a question and determines its visibility
 * Returns: visibility result with potential navigation actions
 */
export function evaluateQuestionVisibility(questionId: string, allQuestions: QuestionWithLogic[], answers: Record<string, AnswerValue>): VisibilityResult {
  // Build a lookup map for efficient question access
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

  // If no rules target this question, it's visible by default
  if (targetingRules.length === 0) {
    return { visible: true };
  }

  // Sort rules by order (priority)
  const sortedRules = targetingRules.sort((a, b) => a.order - b.order);

  // Evaluate visibility using Show/Hide rules
  const visible = evaluateVisibilityRules(sortedRules, answers);

  // Check for navigation actions (Skip, JumpTo, EndSurvey)
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
 * Filters questions based on logic rules and current answers
 * Returns only the questions that should be visible
 */
export function getVisibleQuestions(questions: QuestionWithLogic[], answers: Record<string, AnswerValue>): QuestionWithLogic[] {
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const visibleQuestions: QuestionWithLogic[] = [];

  for (const question of sortedQuestions) {
    const result = evaluateQuestionVisibility(question.id, questions, answers);

    if (result.visible) {
      visibleQuestions.push(question);
    }

    // If end survey is triggered, stop processing
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
  // Collect all EndSurvey rules and sort by priority
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

  // Sort by order (priority)
  endSurveyRules.sort((a, b) => a.rule.order - b.rule.order);

  // Check if any EndSurvey condition is met
  for (const { rule, questionId } of endSurveyRules) {
    const sourceAnswer = answers[questionId];
    if (evaluateCondition(sourceAnswer, rule.operator, rule.value)) {
      return true;
    }
  }

  return false;
}

/**
 * Computes visible questions based on current answers
 * Optimized version that builds question map once
 */
export function computeVisibleQuestions(questions: QuestionWithLogic[], answers: Record<string, AnswerValue>): QuestionWithLogic[] {
  return getVisibleQuestions(questions, answers);
}

// ============ Backend API Integration ============

/**
 * Converts frontend answers to backend evaluation format
 */
export function prepareAnswersForServer(answers: Record<string, AnswerValue>): AnswerForEvaluation[] {
  return Object.entries(answers).map(([questionId, value]) => ({
    questionId,
    value: normalizeAnswerForComparison(value),
  }));
}

/**
 * Evaluates logic on the server - use for:
 * - Final submission validation
 * - Admin preview mode
 * - Complex conditions (quotas, database lookups)
 * - Analytics and reporting
 *
 * @example
 * ```ts
 * // In survey preview or submission
 * const result = await evaluateLogicOnServer(surveyId, answers);
 * if (result.shouldEndSurvey) {
 *   // Handle early termination
 * }
 * ```
 *
 * @param surveyId - The survey ID
 * @param answers - Current answers (frontend format)
 * @param currentQuestionId - Optional current question for next-question calculation
 * @returns Server evaluation result with visible/hidden questions
 */
export async function evaluateLogicOnServer(
  surveyId: string,
  answers: Record<string, AnswerValue>,
  currentQuestionId?: string
): Promise<EvaluateLogicResponse> {
  // Dynamic import to avoid circular dependency with api module
  const { API_ENDPOINTS } = await import('@/config/api');

  const response = await fetch(API_ENDPOINTS.surveys.evaluateLogic(surveyId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentQuestionId,
      answers: prepareAnswersForServer(answers),
    } satisfies EvaluateLogicRequest),
  });

  if (!response.ok) {
    throw new Error(`Logic evaluation failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Validates that frontend and backend logic evaluation results match.
 * Use in development/testing to catch sync issues.
 *
 * @example
 * ```ts
 * if (process.env.NODE_ENV === 'development') {
 *   const mismatch = await validateLogicSync(surveyId, questions, answers);
 *   if (mismatch) console.warn('Logic sync mismatch:', mismatch);
 * }
 * ```
 */
export async function validateLogicSync(
  surveyId: string,
  questions: QuestionWithLogic[],
  answers: Record<string, AnswerValue>
): Promise<{ frontend: string[]; backend: string[] } | null> {
  const frontendVisible = getVisibleQuestions(questions, answers).map((q) => q.id);

  try {
    const backendResult = await evaluateLogicOnServer(surveyId, answers);
    const backendVisible = backendResult.visibleQuestionIds;

    // Compare results
    const frontendSet = new Set(frontendVisible);
    const backendSet = new Set(backendVisible);

    const onlyFrontend = frontendVisible.filter((id) => !backendSet.has(id));
    const onlyBackend = backendVisible.filter((id) => !frontendSet.has(id));

    if (onlyFrontend.length > 0 || onlyBackend.length > 0) {
      return {
        frontend: onlyFrontend,
        backend: onlyBackend,
      };
    }

    return null; // No mismatch
  } catch {
    // Can't validate if server is unreachable
    return null;
  }
}
