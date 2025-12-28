// File Upload Question Editor

import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';

interface FileUploadEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function FileUploadEditor({ question, onUpdateQuestion }: FileUploadEditorProps) {
  const { t } = useTranslation();

  const commonFileTypes = [
    { key: 'images', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    { key: 'documents', extensions: ['.pdf', '.doc', '.docx', '.txt'] },
    { key: 'spreadsheets', extensions: ['.xls', '.xlsx', '.csv'] },
    { key: 'all', extensions: ['*'] },
  ];

  const allowedFileTypes = question.settings.allowedFileTypes || ['.pdf', '.doc', '.docx', '.jpg', '.png'];
  const maxFileSize = question.settings.maxFileSize || 5;
  const maxFiles = question.settings.maxFiles || 1;

  const toggleFileType = (ext: string) => {
    const newTypes = allowedFileTypes.includes(ext) ? allowedFileTypes.filter((t) => t !== ext) : [...allowedFileTypes, ext];
    onUpdateQuestion({ settings: { ...question.settings, allowedFileTypes: newTypes } });
  };

  const applyPreset = (extensions: string[]) => {
    onUpdateQuestion({ settings: { ...question.settings, allowedFileTypes: extensions } });
  };

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
      />

      {/* File Type Presets */}
      <div className='space-y-3'>
        <label className='block text-sm font-medium text-on-surface-variant'>{t('editors.file.allowedTypes')}</label>
        <div className='flex flex-wrap gap-2'>
          {commonFileTypes.map((preset) => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset.extensions)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm border transition-all',
                JSON.stringify(allowedFileTypes.sort()) === JSON.stringify(preset.extensions.sort())
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
              )}
            >
              {t(`editors.file.fileTypes.${preset.key}`)}
            </button>
          ))}
        </div>

        {/* Selected Types */}
        {allowedFileTypes.length > 0 && allowedFileTypes[0] !== '*' && (
          <div className='flex flex-wrap gap-1.5 p-3 rounded-xl bg-surface-container/50'>
            {allowedFileTypes.map((ext) => (
              <span key={ext} className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary'>
                {ext}
                <button onClick={() => toggleFileType(ext)} className='ml-0.5 hover:bg-primary/20 rounded-full p-0.5'>
                  <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* File Limits */}
      <div className='grid grid-cols-2 gap-4'>
        <Input
          type='number'
          label={t('editors.file.maxFiles')}
          value={maxFiles.toString()}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, maxFiles: parseInt(e.target.value) || 1 } })}
          helperText={t('editors.file.maxFilesHelper')}
        />
        <Input
          type='number'
          label={t('editors.file.maxSize')}
          value={maxFileSize.toString()}
          onChange={(e) => onUpdateQuestion({ settings: { ...question.settings, maxFileSize: parseInt(e.target.value) || 5 } })}
          helperText={t('editors.file.maxSizeHelper')}
        />
      </div>

      {/* Preview */}
      <div className='p-4 rounded-2xl bg-surface-container/50'>
        <p className='text-sm text-on-surface-variant mb-3'>{t('questionEditor.preview')}</p>
        <div className='flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant rounded-xl bg-surface'>
          <div className='text-on-surface-variant/50 mb-2'>
            <svg className='w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>
          </div>
          <p className='text-sm text-on-surface-variant'>{t('editors.file.dropZone')}</p>
          <p className='text-xs text-on-surface-variant/70 mt-1'>{t('editors.file.maxSizeLabel', { size: maxFileSize, count: maxFiles })}</p>
        </div>
      </div>
    </div>
  );
}
