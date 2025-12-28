import type { Survey, Question } from '@/types';
import type { PublicSurvey, PublicQuestion } from '@/types/public-survey';
import type { LogicMapResponse } from '@/types/api';
import type { LogicRule } from '@/utils/logicEvaluator';

// Extended PublicQuestion type with logic rules for preview
export type PublicQuestionWithLogic = PublicQuestion & {
  logicRules?: LogicRule[];
};

/**
 * Convert Survey model to PublicSurvey format for preview
 */
export function surveyToPublicSurvey(survey: Survey): PublicSurvey {
  return {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    welcomeMessage: survey.welcomeMessage,
    thankYouMessage: survey.thankYouMessage,
    isAnonymous: survey.allowAnonymousResponses ?? false,
    allowAnonymousResponses: survey.allowAnonymousResponses ?? false,
    questions: (survey.questions ?? []).map(questionToPublicQuestion),
    theme: undefined, // Theme loaded separately
  };
}

/**
 * Convert Question model to PublicQuestion format
 */
export function questionToPublicQuestion(question: Question): PublicQuestion {
  return {
    id: question.id,
    text: question.text,
    type: question.type,
    order: question.order,
    isRequired: question.isRequired,
    description: question.description,
    settings: {
      minValue: question.settings?.minValue,
      maxValue: question.settings?.maxValue,
      minLabel: question.settings?.minLabel,
      maxLabel: question.settings?.maxLabel,
      placeholder: question.settings?.placeholder,
      maxLength: question.settings?.maxLength,
      options: question.settings?.options ?? [],
      matrixRows: question.settings?.matrixRows,
      matrixColumns: question.settings?.matrixColumns,
      allowedFileTypes: question.settings?.allowedFileTypes,
      maxFileSize: question.settings?.maxFileSize,
      allowOther: question.settings?.allowOther,
      validationPattern: question.settings?.validationPattern,
      validationMessage: question.settings?.validationMessage,
      validationPreset: question.settings?.validationPreset,
      ratingStyle: question.settings?.ratingStyle,
      yesNoStyle: question.settings?.yesNoStyle,
    },
  };
}

/**
 * Merge logic map data into public questions
 * This adds the logicRules to each question for conditional logic evaluation
 */
export function mergeLogicMapWithQuestions(questions: PublicQuestion[], logicMap: LogicMapResponse | null | undefined): PublicQuestionWithLogic[] {
  if (!logicMap?.questions) {
    return questions as PublicQuestionWithLogic[];
  }

  const logicByQuestionId = new Map(
    logicMap.questions.map((q) => [
      q.id,
      q.logicRules?.map((rule) => ({
        id: rule.id,
        sourceQuestionId: rule.sourceQuestionId,
        operator: rule.operator,
        value: rule.conditionValue,
        action: rule.action,
        targetQuestionId: rule.targetQuestionId,
        order: rule.priority,
      })) ?? [],
    ])
  );

  return questions.map((question) => ({
    ...question,
    logicRules: logicByQuestionId.get(question.id) ?? [],
  }));
}
