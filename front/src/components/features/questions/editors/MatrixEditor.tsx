// Matrix Question Editor

import { Plus, X, GripVertical } from 'lucide-react';
import { Input, IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import { useTranslation } from 'react-i18next';

interface MatrixEditorProps {
  question: DraftQuestion;
  onUpdateQuestion: (updates: Partial<DraftQuestion>) => void;
}

export function MatrixEditor({ question, onUpdateQuestion }: MatrixEditorProps) {
  const { t } = useTranslation();
  const defaultRow = t('editors.matrix.rowPlaceholder', { number: 1 });
  const defaultColumns = [
    t('editors.matrix.columnPlaceholder', { number: 1 }),
    t('editors.matrix.columnPlaceholder', { number: 2 }),
    t('editors.matrix.columnPlaceholder', { number: 3 }),
  ];
  const rows = question.settings.matrixRows || [defaultRow];
  const columns = question.settings.matrixColumns || defaultColumns;

  const updateRows = (newRows: string[]) => {
    onUpdateQuestion({ settings: { ...question.settings, matrixRows: newRows } });
  };

  const updateColumns = (newColumns: string[]) => {
    onUpdateQuestion({ settings: { ...question.settings, matrixColumns: newColumns } });
  };

  const addRow = () => {
    updateRows([...rows, `${t('editors.matrix.rowPlaceholder', { number: rows.length + 1 })}`]);
  };

  const updateRow = (index: number, value: string) => {
    const newRows = [...rows];
    newRows[index] = value;
    updateRows(newRows);
  };

  const deleteRow = (index: number) => {
    if (rows.length > 1) {
      updateRows(rows.filter((_, i) => i !== index));
    }
  };

  const addColumn = () => {
    updateColumns([...columns, `${t('editors.matrix.columnPlaceholder', { number: columns.length + 1 })}`]);
  };

  const updateColumn = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = value;
    updateColumns(newColumns);
  };

  const deleteColumn = (index: number) => {
    if (columns.length > 2) {
      updateColumns(columns.filter((_, i) => i !== index));
    }
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

      {/* Rows */}
      <div className='space-y-3'>
        <label className='block text-sm font-medium text-on-surface-variant'>{t('editors.matrix.rows')}</label>
        <div className='space-y-2'>
          {rows.map((row, index) => (
            <div key={index} className='flex items-center gap-2 p-2 rounded-xl bg-surface-container/50'>
              <GripVertical className='w-5 h-5 text-on-surface-variant/50 cursor-grab' />
              <input
                type='text'
                value={row}
                onChange={(e) => updateRow(index, e.target.value)}
                className='flex-1 px-3 py-2 rounded-lg bg-transparent text-on-surface focus:outline-none focus:bg-surface-container-high'
                placeholder={t('editors.matrix.rowPlaceholder', { number: index + 1 })}
              />
              <IconButton
                variant='standard'
                size='sm'
                aria-label={t('editors.matrix.removeRow')}
                onClick={() => deleteRow(index)}
                disabled={rows.length <= 1}
                className={cn(rows.length <= 1 && 'opacity-30')}
              >
                <X className='w-4 h-4' />
              </IconButton>
            </div>
          ))}
        </div>
        <button
          onClick={addRow}
          className='flex items-center gap-2 w-full p-3 rounded-xl text-primary hover:bg-primary/5 border border-dashed border-primary/30'
        >
          <Plus className='w-5 h-5' />
          <span className='font-medium'>{t('editors.matrix.addRow')}</span>
        </button>
      </div>

      {/* Columns */}
      <div className='space-y-3'>
        <label className='block text-sm font-medium text-on-surface-variant'>{t('editors.matrix.columns')}</label>
        <div className='space-y-2'>
          {columns.map((col, index) => (
            <div key={index} className='flex items-center gap-2 p-2 rounded-xl bg-surface-container/50'>
              <GripVertical className='w-5 h-5 text-on-surface-variant/50 cursor-grab' />
              <input
                type='text'
                value={col}
                onChange={(e) => updateColumn(index, e.target.value)}
                className='flex-1 px-3 py-2 rounded-lg bg-transparent text-on-surface focus:outline-none focus:bg-surface-container-high'
                placeholder={t('editors.matrix.columnPlaceholder', { number: index + 1 })}
              />
              <IconButton
                variant='standard'
                size='sm'
                aria-label={t('editors.matrix.removeColumn')}
                onClick={() => deleteColumn(index)}
                disabled={columns.length <= 2}
                className={cn(columns.length <= 2 && 'opacity-30')}
              >
                <X className='w-4 h-4' />
              </IconButton>
            </div>
          ))}
        </div>
        <button
          onClick={addColumn}
          className='flex items-center gap-2 w-full p-3 rounded-xl text-primary hover:bg-primary/5 border border-dashed border-primary/30'
        >
          <Plus className='w-5 h-5' />
          <span className='font-medium'>{t('editors.matrix.addColumn')}</span>
        </button>
      </div>

      {/* Preview */}
      <div className='p-4 rounded-2xl bg-surface-container/50 overflow-x-auto'>
        <p className='text-sm text-on-surface-variant mb-3'>{t('questionEditor.preview')}</p>
        <table className='w-full min-w-[400px]'>
          <thead>
            <tr>
              <th className='p-2 text-left w-1/3' />
              {columns.map((col, i) => (
                <th key={i} className='p-2 text-center text-sm font-medium text-on-surface-variant'>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className='border-t border-outline-variant/30'>
                <td className='p-2 text-sm text-on-surface'>{row}</td>
                {columns.map((_, j) => (
                  <td key={j} className='p-2 text-center'>
                    <div className='w-5 h-5 mx-auto rounded-full border-2 border-outline-variant' />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
