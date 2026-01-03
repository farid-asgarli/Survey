import { cn } from '@survey/ui-primitives';
import type { QuestionRendererProps } from '../types/index.js';

// ============ Matrix ============
export function MatrixRenderer({ question, value, onChange, error, disabled }: QuestionRendererProps) {
  const rows = question.settings?.matrixRows || [];
  const columns = question.settings?.matrixColumns || [];
  const matrixValue = (value as Record<string, string>) || {};

  const handleSelect = (row: string, column: string) => {
    if (disabled) return;
    onChange({ ...matrixValue, [row]: column });
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-125">
          <thead>
            <tr>
              <th className="p-3 text-left text-on-surface-variant font-medium" />
              {columns.map((col, i) => (
                <th key={i} className="p-3 text-center text-on-surface-variant font-medium text-sm">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={cn('border-t border-outline-variant/30', error && !matrixValue[row] && 'bg-error-container/10')}>
                <td className="p-3 text-on-surface font-medium">{row}</td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3 text-center">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelect(row, col)}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-200',
                        matrixValue[row] === col ? 'border-primary bg-primary' : 'border-outline-variant hover:border-primary/50',
                        disabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {matrixValue[row] === col && <div className="w-2.5 h-2.5 rounded-full bg-on-primary" />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}
