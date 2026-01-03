import type { PublicQuestion, AnswerValue } from '@/types/public-survey';
import { validateQuestionValue } from '@survey/validation';
import { QuestionType } from '@/types/enums';

/**
 * Validate a single question
 */
export function validateQuestion(question: PublicQuestion, value: AnswerValue): string | undefined {
  // Check required field
  if (question.isRequired) {
    if (value === null || value === undefined) {
      return 'validation.required';
    }
    if (typeof value === 'string' && value.trim() === '') {
      return 'validation.required';
    }
    if (Array.isArray(value) && value.length === 0) {
      return 'validation.selectAtLeastOne';
    }
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
      return 'validation.completeAllRows';
    }
  }

  // Validate format for specific question types (Email, Phone, Url)
  if (typeof value === 'string' && value.trim() !== '') {
    const questionType = question.type;
    if (questionType === QuestionType.Email || questionType === QuestionType.Phone || questionType === QuestionType.Url) {
      const result = validateQuestionValue(value, String(questionType), question.settings);
      if (!result.isValid) {
        return result.errorMessage || `Invalid format`;
      }
    }
  }

  return undefined;
}
