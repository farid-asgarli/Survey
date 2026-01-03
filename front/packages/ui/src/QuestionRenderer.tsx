// Question Renderers - Components for rendering different question types in public surveys
// Translation-agnostic: all text comes from labels prop

import { QuestionType } from '@survey/types';
import { DateRenderer } from './questions/DateRenderer.js';
import { EmailRenderer } from './questions/EmailRenderer.js';
import { FileUploadRenderer } from './questions/FileUploadRenderer.js';
import { LongTextRenderer } from './questions/LongTextRenderer.js';
import { MatrixRenderer } from './questions/MatrixRenderer.js';
import { MultipleChoiceRenderer } from './questions/MultipleChoiceRenderer.js';
import { NumberRenderer } from './questions/NumberRenderer.js';
import { PhoneRenderer } from './questions/PhoneRenderer.js';
import { RankingRenderer } from './questions/RankingRenderer.js';
import { RatingRenderer } from './questions/RatingRenderer.js';
import { ScaleRenderer } from './questions/ScaleRenderer.js';
import { SingleChoiceRenderer } from './questions/SingleChoiceRenderer.js';
import { TextRenderer } from './questions/TextRenderer.js';
import { UrlRenderer } from './questions/UrlRenderer.js';
import { YesNoRenderer } from './questions/YesNoRenderer.js';
import { defaultQuestionLabels, type QuestionRendererProps } from './types/index.js';

// Re-export types for consumers
export type { QuestionRendererProps, QuestionLabels } from './types/index.js';
export { defaultQuestionLabels } from './types/index.js';

// ============ Question Renderer Factory ============
export function QuestionRenderer(props: QuestionRendererProps) {
  const { question, labels } = props;
  // Merge with defaults to ensure all labels are available
  const mergedLabels = { ...defaultQuestionLabels, ...labels };
  const propsWithLabels = { ...props, labels: mergedLabels };

  switch (question.type) {
    case QuestionType.SingleChoice:
    case QuestionType.Dropdown: // Dropdown renders like single choice
      return <SingleChoiceRenderer {...propsWithLabels} />;
    case QuestionType.YesNo: // YesNo has its own renderer with style support
      return <YesNoRenderer {...propsWithLabels} />;
    case QuestionType.MultipleChoice:
    case QuestionType.Checkbox: // Checkbox is alias for multiple choice
      return <MultipleChoiceRenderer {...propsWithLabels} />;
    case QuestionType.Text:
    case QuestionType.ShortText: // ShortText is alias for Text
      return <TextRenderer {...propsWithLabels} />;
    case QuestionType.Email:
      return <EmailRenderer {...propsWithLabels} />;
    case QuestionType.Phone:
      return <PhoneRenderer {...propsWithLabels} />;
    case QuestionType.Url:
      return <UrlRenderer {...propsWithLabels} />;
    case QuestionType.Number:
      return <NumberRenderer {...propsWithLabels} />;
    case QuestionType.LongText:
      return <LongTextRenderer {...propsWithLabels} />;
    case QuestionType.Rating:
      return <RatingRenderer {...propsWithLabels} />;
    case QuestionType.Scale:
    case QuestionType.NPS: // NPS is a scale 0-10
      return <ScaleRenderer {...propsWithLabels} />;
    case QuestionType.Matrix:
      return <MatrixRenderer {...propsWithLabels} />;
    case QuestionType.Date:
    case QuestionType.DateTime: // DateTime uses same date input
      return <DateRenderer {...propsWithLabels} />;
    case QuestionType.FileUpload:
      return <FileUploadRenderer {...propsWithLabels} />;
    case QuestionType.Ranking:
      return <RankingRenderer {...propsWithLabels} />;
    default:
      return (
        <div className="p-4 rounded-xl bg-warning-container/50 text-on-warning-container">
          {mergedLabels.unsupportedType?.replace('{type}', String(question.type)) ?? `Unsupported question type: ${question.type}`}
        </div>
      );
  }
}
