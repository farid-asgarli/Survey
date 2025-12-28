// Date Question Editor

import { Input } from '@/components/ui';
import { DatePicker } from '@/components/ui/DatePicker';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';

interface DateEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function DateEditor({ question, onUpdateQuestion }: DateEditorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <Input
        label={t('questionEditor.question')}
        value={question.text}
        onChange={(e) => onUpdateQuestion({ text: e.target.value })}
        placeholder={t('questionEditor.common.enterQuestion')}
      />

      {/* Description */}
      <Input
        label={t('questionEditor.common.descriptionOptional')}
        value={question.description || ''}
        onChange={(e) => onUpdateQuestion({ description: e.target.value })}
        placeholder={t('questionEditor.common.addHelpText')}
        helperText={t('questionEditor.common.textBelowQuestion')}
      />

      {/* Preview */}
      <div className="p-4 rounded-2xl bg-surface-container/50">
        <p className="text-sm text-on-surface-variant mb-3">{t('questionEditor.preview')}</p>
        <DatePicker value={undefined} onChange={() => {}} disabled placeholder="Select date" />
      </div>
    </div>
  );
}
