// URL Question Editor - with validation settings

import { Input, Select } from '@/components/ui';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { URL_PRESETS } from '@/utils/validationPatterns';
import { useTranslation } from 'react-i18next';

interface UrlEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function UrlEditor({ question, onUpdateQuestion }: UrlEditorProps) {
  const { t } = useTranslation();
  const selectedPreset = question.settings.validationPreset || 'url-flexible';
  const preset = URL_PRESETS.find((p) => p.id === selectedPreset);

  const urlFormatOptions = URL_PRESETS.map((p) => ({
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

      {/* URL Format Preset */}
      <Select
        label={t('editors.url.format')}
        options={urlFormatOptions}
        value={selectedPreset}
        onChange={(value) =>
          onUpdateQuestion({
            settings: {
              ...question.settings,
              validationPreset: value,
              placeholder: URL_PRESETS.find((p) => p.id === value)?.placeholder || '',
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
        placeholder={preset?.placeholder || t('questionEditor.url.placeholderDefault')}
        helperText={t('questionEditor.common.shownInsideField')}
      />

      {/* Custom Validation Pattern (Advanced) */}
      <details className='group'>
        <summary className='cursor-pointer text-sm font-medium text-on-surface-variant hover:text-on-surface'>{t('editors.url.advancedRegex')}</summary>
        <div className='mt-4 space-y-4 pl-4 border-l-2 border-outline-variant/30'>
          <Input
            label={t('editors.url.regexPattern')}
            value={question.settings.validationPattern || ''}
            onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, validationPattern: e.target.value } })}
            placeholder='^https?:\\/\\/.*'
            helperText={t('questionEditor.url.customPatternHelper')}
          />
        </div>
      </details>

      {/* Custom Error Message */}
      <Input
        label={t('editors.url.errorMessage')}
        value={question.settings.validationMessage || ''}
        onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, validationMessage: e.target.value } })}
        placeholder={t('questionEditor.url.validationPlaceholder')}
        helperText={t('questionEditor.url.validationHelper')}
      />

      {/* Max Length */}
      <Input
        type='number'
        label={t('questionEditor.common.maxCharacters')}
        value={question.settings.maxLength?.toString() || '2048'}
        onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, maxLength: parseInt(e.target.value) || 2048 } })}
        helperText={t('editors.common.maxCharactersHelper')}
      />
    </div>
  );
}
