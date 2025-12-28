// Logic Evaluator - Evaluates conditional logic rules for public surveys

import type { AnswerValue } from '@/types/public-survey';
import { LogicOperator, LogicAction } from '@/types/enums';

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

/**
 * Evaluates a single logic condition
 */
export function evaluateCondition(answerValue: AnswerValue, operator: LogicOperator, conditionValue?: string): boolean {
  // Handle IsAnswered/IsNotAnswered first
  if (operator === LogicOperator.IsAnswered) {
    if (answerValue === null || answerValue === undefined) return false;
    if (typeof answerValue === 'string' && answerValue.trim() === '') return false;
    if (Array.isArray(answerValue) && answerValue.length === 0) return false;
    return true;
  }

  if (operator === LogicOperator.IsNotAnswered) {
    if (answerValue === null || answerValue === undefined) return true;
    if (typeof answerValue === 'string' && answerValue.trim() === '') return true;
    if (Array.isArray(answerValue) && answerValue.length === 0) return true;
    return false;
  }

  // Convert answer to string for comparison
  const answerStr = normalizeAnswerForComparison(answerValue);
  const conditionStr = conditionValue || '';

  switch (operator) {
    case LogicOperator.Equals:
      return compareEquals(answerStr, conditionStr, answerValue);

    case LogicOperator.NotEquals:
      return !compareEquals(answerStr, conditionStr, answerValue);

    case LogicOperator.Contains:
      return answerStr.toLowerCase().includes(conditionStr.toLowerCase());

    case LogicOperator.GreaterThan: {
      const numAnswer = parseFloat(answerStr);
      const numCondition = parseFloat(conditionStr);
      if (isNaN(numAnswer) || isNaN(numCondition)) return false;
      return numAnswer > numCondition;
    }

    case LogicOperator.LessThan: {
      const numAnswer = parseFloat(answerStr);
      const numCondition = parseFloat(conditionStr);
      if (isNaN(numAnswer) || isNaN(numCondition)) return false;
      return numAnswer < numCondition;
    }

    default:
      return false;
  }
}

/**
 * Normalizes an answer value to a string for comparison
 */
function normalizeAnswerForComparison(value: AnswerValue): string {
  if (value === null || value === undefined) return '';

  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();

  if (Array.isArray(value)) {
    // For multiple choice, join values
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
 * Compares two values for equality, handling arrays (multiple choice)
 */
function compareEquals(answerStr: string, conditionStr: string, originalValue: AnswerValue): boolean {
  // For multiple choice (arrays), check if the condition value is in the array
  if (Array.isArray(originalValue) && !(originalValue[0] instanceof File)) {
    return (originalValue as string[]).includes(conditionStr);
  }

  // Case-insensitive comparison for strings
  return answerStr.toLowerCase() === conditionStr.toLowerCase();
}

/**
 * Evaluates all logic rules for a question and determines its visibility
 * Returns: true if the question should be visible, false if hidden
 */
export function evaluateQuestionVisibility(
  questionId: string,
  allQuestions: QuestionWithLogic[],
  answers: Record<string, AnswerValue>
): { visible: boolean; skipTo?: string; endSurvey?: boolean } {
  const question = allQuestions.find((q) => q.id === questionId);

  if (!question) {
    return { visible: true };
  }

  // Find all logic rules that target this question
  const targetingRules: { rule: LogicRule; sourceQuestion: QuestionWithLogic }[] = [];

  for (const q of allQuestions) {
    if (q.logicRules) {
      for (const rule of q.logicRules) {
        if (rule.targetQuestionId === questionId) {
          targetingRules.push({ rule, sourceQuestion: q });
        }
      }
    }
  }

  // If no rules target this question, it's visible
  if (targetingRules.length === 0) {
    return { visible: true };
  }

  // Evaluate each rule
  let visible = true; // Default to visible unless a Hide rule matches
  let skipTo: string | undefined;
  let endSurvey = false;

  for (const { rule, sourceQuestion } of targetingRules) {
    const sourceAnswer = answers[sourceQuestion.id];
    const conditionMet = evaluateCondition(sourceAnswer, rule.operator, rule.value);

    if (conditionMet) {
      switch (rule.action) {
        case LogicAction.Show:
          visible = true;
          break;
        case LogicAction.Hide:
          visible = false;
          break;
        case LogicAction.Skip:
          if (rule.targetQuestionId) {
            skipTo = rule.targetQuestionId;
          }
          break;
        case LogicAction.EndSurvey:
          endSurvey = true;
          break;
      }
    }
  }

  return { visible, skipTo, endSurvey };
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
  for (const question of questions) {
    if (question.logicRules) {
      for (const rule of question.logicRules) {
        if (rule.action === LogicAction.EndSurvey) {
          const sourceAnswer = answers[question.id];
          if (evaluateCondition(sourceAnswer, rule.operator, rule.value)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
