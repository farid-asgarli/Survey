// Question Renderers - Components for rendering different question types in public surveys

import { useTranslation } from "react-i18next";
import { QuestionType, type AnswerValue, type PublicQuestion } from "@survey/types";
import { DateRenderer } from "./questions/DateRenderer";
import { EmailRenderer } from "./questions/EmailRenderer";
import { FileUploadRenderer } from "./questions/FileUploadRenderer";
import { LongTextRenderer } from "./questions/LongTextRenderer";
import { MatrixRenderer } from "./questions/MatrixRenderer";
import { MultipleChoiceRenderer } from "./questions/MultipleChoiceRenderer";
import { NumberRenderer } from "./questions/NumberRenderer";
import { PhoneRenderer } from "./questions/PhoneRenderer";
import { RankingRenderer } from "./questions/RankingRenderer";
import { RatingRenderer } from "./questions/RatingRenderer";
import { ScaleRenderer } from "./questions/ScaleRenderer";
import { SingleChoiceRenderer } from "./questions/SingleChoiceRenderer";
import { TextRenderer } from "./questions/TextRenderer";
import { UrlRenderer } from "./questions/UrlRenderer";
import { YesNoRenderer } from "./questions/YesNoRenderer";

// ============ Base Props ============
export interface QuestionRendererProps {
  question: PublicQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  error?: string;
  disabled?: boolean;
}

// ============ Question Renderer Factory ============
export function QuestionRenderer(props: QuestionRendererProps) {
  const { t } = useTranslation();
  const { question } = props;

  switch (question.type) {
    case QuestionType.SingleChoice:
    case QuestionType.Dropdown: // Dropdown renders like single choice
      return <SingleChoiceRenderer {...props} />;
    case QuestionType.YesNo: // YesNo has its own renderer with style support
      return <YesNoRenderer {...props} />;
    case QuestionType.MultipleChoice:
    case QuestionType.Checkbox: // Checkbox is alias for multiple choice
      return <MultipleChoiceRenderer {...props} />;
    case QuestionType.Text:
    case QuestionType.ShortText: // ShortText is alias for Text
      return <TextRenderer {...props} />;
    case QuestionType.Email:
      return <EmailRenderer {...props} />;
    case QuestionType.Phone:
      return <PhoneRenderer {...props} />;
    case QuestionType.Url:
      return <UrlRenderer {...props} />;
    case QuestionType.Number:
      return <NumberRenderer {...props} />;
    case QuestionType.LongText:
      return <LongTextRenderer {...props} />;
    case QuestionType.Rating:
      return <RatingRenderer {...props} />;
    case QuestionType.Scale:
    case QuestionType.NPS: // NPS is a scale 0-10
      return <ScaleRenderer {...props} />;
    case QuestionType.Matrix:
      return <MatrixRenderer {...props} />;
    case QuestionType.Date:
    case QuestionType.DateTime: // DateTime uses same date input
      return <DateRenderer {...props} />;
    case QuestionType.FileUpload:
      return <FileUploadRenderer {...props} />;
    case QuestionType.Ranking:
      return <RankingRenderer {...props} />;
    default:
      return (
        <div className="p-4 rounded-xl bg-warning-container/50 text-on-warning-container">
          {t("errors.unsupportedQuestionType", { type: question.type })}
        </div>
      );
  }
}
