// Phone Question Editor - with validation pattern presets

import { Input, Select } from '@/components/ui';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { PHONE_PRESETS } from '@/utils/validationPatterns';
import { useTranslation } from 'react-i18next';

interface PhoneEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function PhoneEditor({ question, onUpdateQuestion }: PhoneEditorProps) {
  const { t } = useTranslation();
  const selectedPreset = question.settings.validationPreset || 'phone-flexible';
  const preset = PHONE_PRESETS.find((p) => p.id === selectedPreset);

  const phoneFormatOptions = PHONE_PRESETS.map((p) => ({
    value: p.id,
    label: `${t(p.nameKey)} - ${t(p.descriptionKey)}`,
  }));

  return (
    <div className='space-y-6'>
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

      {/* Phone Format Preset */}
      <Select
        label={t('questionEditor.phone.formatLabel')}
        options={phoneFormatOptions}
        value={selectedPreset}
        onChange={(value) =>
          onUpdateQuestion({
            settings: {
              ...question.settings,
              validationPreset: value,
              placeholder: PHONE_PRESETS.find((p) => p.id === value)?.placeholder || '',
            },
          })
        }
        helperText={preset ? `${t('common.example')}: ${preset.placeholder}` : undefined}
      />

      {/* Placeholder */}
      <Input
        label={t('questionEditor.common.placeholderLabel')}
        value={question.settings.placeholder || preset?.placeholder || ''}
        onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, placeholder: e.target.value } })}
        placeholder={preset?.placeholder || t('editors.phone.placeholderDefault')}
        helperText={t('questionEditor.common.shownInsideField')}
      />

      {/* Custom Validation Pattern (Advanced) */}
      <details className='group'>
        <summary className='cursor-pointer text-sm font-medium text-on-surface-variant hover:text-on-surface'>{t('editors.phone.advancedRegex')}</summary>
        <div className='mt-4 space-y-4 pl-4 border-l-2 border-outline-variant/30'>
          <Input
            label={t('editors.phone.regexPattern')}
            value={question.settings.validationPattern || ''}
            onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, validationPattern: e.target.value } })}
            placeholder='^\\+?[0-9\\s-]{8,20}$'
            helperText={t('editors.phone.regexHelper')}
          />
        </div>
      </details>

      {/* Custom Error Message */}
      <Input
        label={t('editors.phone.errorMessage')}
        value={question.settings.validationMessage || ''}
        onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, validationMessage: e.target.value } })}
        placeholder={t('editors.phone.errorPlaceholder')}
        helperText={t('editors.phone.errorHelper')}
      />

      {/* Max Length */}
      <Input
        type='number'
        label={t('questionEditor.common.maxCharacters')}
        value={question.settings.maxLength?.toString() || '50'}
        onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, maxLength: parseInt(e.target.value) || 50 } })}
        helperText={t('editors.common.maxCharactersHelper')}
      />
    </div>
  );
}
