import { useTranslation } from 'react-i18next';
import { ChoiceChart } from './ChoiceChart';
import { RatingChart } from './RatingChart';
import { TextResponsesList } from './TextResponsesList';
import { MatrixHeatmap } from './MatrixHeatmap';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { QuestionType, getQuestionTypeLabel } from '@/types/enums';
import type { QuestionAnalytics } from '@/types';

export interface QuestionAnalyticsCardProps {
  question: QuestionAnalytics;
  isLoading?: boolean;
  className?: string;
}

// Map backend question types to analytics display types
type AnalyticsDisplayType = 'choice' | 'rating' | 'scale' | 'text' | 'matrix' | 'unknown';

/**
 * Normalize question type to QuestionType enum.
 * Backend may return numeric value or string name.
 */
function normalizeQuestionType(questionType: QuestionType | string): QuestionType {
  if (typeof questionType === 'number') {
    return questionType;
  }
  // If string, try to map common backend string values to enum
  const typeMap: Record<string, QuestionType> = {
    SingleChoice: QuestionType.SingleChoice,
    MultipleChoice: QuestionType.MultipleChoice,
    Text: QuestionType.Text,
    LongText: QuestionType.LongText,
    Rating: QuestionType.Rating,
    Scale: QuestionType.Scale,
    Matrix: QuestionType.Matrix,
    Date: QuestionType.Date,
    DateTime: QuestionType.DateTime,
    FileUpload: QuestionType.FileUpload,
    YesNo: QuestionType.YesNo,
    Dropdown: QuestionType.Dropdown,
    NPS: QuestionType.NPS,
    Checkbox: QuestionType.Checkbox,
    Number: QuestionType.Number,
    ShortText: QuestionType.ShortText,
    Email: QuestionType.Email,
    Phone: QuestionType.Phone,
    Url: QuestionType.Url,
    Ranking: QuestionType.Ranking,
  };
  return typeMap[questionType] ?? QuestionType.Text;
}

function getDisplayType(questionType: QuestionType | string): AnalyticsDisplayType {
  const normalizedType = normalizeQuestionType(questionType);

  // Choice-based questions
  const choiceTypes: QuestionType[] = [
    QuestionType.SingleChoice,
    QuestionType.MultipleChoice,
    QuestionType.Dropdown,
    QuestionType.Checkbox,
    QuestionType.YesNo,
  ];
  if (choiceTypes.includes(normalizedType)) {
    return 'choice';
  }

  // Rating/Scale questions
  const ratingTypes: QuestionType[] = [QuestionType.Rating, QuestionType.Scale, QuestionType.NPS];
  if (ratingTypes.includes(normalizedType)) {
    return 'rating';
  }

  // Text-based questions
  const textTypes: QuestionType[] = [
    QuestionType.Text,
    QuestionType.LongText,
    QuestionType.ShortText,
    QuestionType.Email,
    QuestionType.Phone,
    QuestionType.Url,
    QuestionType.Number,
  ];
  if (textTypes.includes(normalizedType)) {
    return 'text';
  }

  // Matrix questions
  if (normalizedType === QuestionType.Matrix) {
    return 'matrix';
  }

  return 'unknown';
}

export function QuestionAnalyticsCard({ question, isLoading, className }: QuestionAnalyticsCardProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card variant='outlined' className={className}>
        <CardHeader className='pb-3'>
          <Skeleton className='h-5 w-3/4' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-32 w-full' />
        </CardContent>
      </Card>
    );
  }

  const displayType = getDisplayType(question.questionType);

  switch (displayType) {
    case 'choice':
      return (
        <ChoiceChart
          questionText={question.questionText}
          data={question.answerOptions}
          totalAnswers={question.totalAnswers}
          className={className}
          variant='bar'
        />
      );

    case 'rating':
      return (
        <RatingChart
          questionText={question.questionText}
          data={question.answerOptions}
          totalAnswers={question.totalAnswers}
          averageValue={question.averageValue ?? question.averageRating}
          minValue={question.minValue}
          maxValue={question.maxValue}
          className={className}
          showStars={question.questionType === QuestionType.Rating}
        />
      );

    case 'text':
      return (
        <TextResponsesList questionText={question.questionText} responses={question.sampleAnswers} totalAnswers={question.totalAnswers} className={className} />
      );

    case 'matrix':
      // Use MatrixHeatmap if we have matrix data, fallback to simple summary
      if (question.matrixData) {
        return <MatrixHeatmap questionText={question.questionText} data={question.matrixData} totalAnswers={question.totalAnswers} className={className} />;
      }
      // Fallback: show simple breakdown if no matrix data structure
      return (
        <Card variant='outlined' className={className}>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-medium line-clamp-2'>{question.questionText}</CardTitle>
            <p className='text-xs text-on-surface-variant'>
              {question.totalAnswers} response{question.totalAnswers !== 1 ? 's' : ''} • {t('analytics.matrixQuestion')}
            </p>
          </CardHeader>
          <CardContent>
            {question.answerOptions?.length ? (
              <div className='space-y-2'>
                {question.answerOptions.map((option) => (
                  <div key={option.optionId} className='flex items-center justify-between text-sm'>
                    <span className='text-on-surface'>{option.option}</span>
                    <span className='text-on-surface-variant'>
                      {option.count} ({Math.round(option.percentage)}%)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-on-surface-variant'>{t('analytics.noData')}</p>
            )}
          </CardContent>
        </Card>
      );

    default:
      return (
        <Card variant='outlined' className={className}>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-medium line-clamp-2'>{question.questionText}</CardTitle>
            <p className='text-xs text-on-surface-variant'>
              {question.totalAnswers} response{question.totalAnswers !== 1 ? 's' : ''} • {getQuestionTypeLabel(normalizeQuestionType(question.questionType))}
            </p>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-on-surface-variant'>{t('analytics.visualizationNotAvailable')}</p>
          </CardContent>
        </Card>
      );
  }
}
