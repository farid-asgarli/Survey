import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface MatrixCell {
  row: string;
  column: string;
  count: number;
  percentage: number;
}

export interface MatrixHeatmapData {
  rows: string[];
  columns: string[];
  cells: MatrixCell[];
  totalResponses: number;
}

export interface MatrixHeatmapProps {
  questionText: string;
  data?: MatrixHeatmapData;
  totalAnswers: number;
  isLoading?: boolean;
  className?: string;
  colorScheme?: 'primary' | 'gradient';
}

// Get cell data from the data array
function getCellData(data: MatrixHeatmapData, row: string, column: string): MatrixCell | undefined {
  return data.cells.find((cell) => cell.row === row && cell.column === column);
}

// Get color intensity based on percentage
function getColorIntensity(percentage: number, colorScheme: 'primary' | 'gradient'): string {
  if (percentage === 0) return 'bg-surface-container';

  if (colorScheme === 'gradient') {
    // Color gradient from light blue to deep purple
    if (percentage <= 20) return 'bg-info-container/40';
    if (percentage <= 40) return 'bg-info-container/70';
    if (percentage <= 60) return 'bg-info-container';
    if (percentage <= 80) return 'bg-primary-container';
    return 'bg-primary-container';
  }

  // Primary color with varying opacity
  if (percentage <= 20) return 'bg-primary/20';
  if (percentage <= 40) return 'bg-primary/40';
  if (percentage <= 60) return 'bg-primary/60';
  if (percentage <= 80) return 'bg-primary/80';
  return 'bg-primary';
}

// Get text color based on background intensity
function getTextColor(percentage: number, colorScheme: 'primary' | 'gradient'): string {
  if (percentage === 0) return 'text-on-surface-variant';

  if (colorScheme === 'gradient') {
    if (percentage <= 60) return 'text-on-info-container';
    return 'text-on-primary-container';
  }

  // For primary scheme
  if (percentage <= 40) return 'text-primary';
  return 'text-on-primary';
}

export function MatrixHeatmap({ questionText, data, totalAnswers, isLoading, className, colorScheme = 'primary' }: MatrixHeatmapProps) {
  if (isLoading) {
    return (
      <Card variant="outlined" className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.rows?.length || !data.columns?.length) {
    return (
      <Card variant="outlined" className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium line-clamp-2">{questionText}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
            <p className="text-sm">No matrix data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max percentage for normalization
  const maxPercentage = Math.max(...data.cells.map((c) => c.percentage), 1);

  return (
    <Card variant="outlined" className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium line-clamp-2">{questionText}</CardTitle>
        <p className="text-xs text-on-surface-variant">
          {totalAnswers} response{totalAnswers !== 1 ? 's' : ''} • Matrix question
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full border-collapse min-w-max">
            {/* Header row with column labels */}
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-medium text-on-surface-variant min-w-24 max-w-32">{/* Empty corner cell */}</th>
                {data.columns.map((column, colIndex) => (
                  <th key={colIndex} className="p-2 text-center text-xs font-medium text-on-surface-variant min-w-16 max-w-24">
                    <span className="line-clamp-2">{column}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Row label */}
                  <td className="p-2 text-sm text-on-surface font-medium min-w-24 max-w-32">
                    <span className="line-clamp-2">{row}</span>
                  </td>
                  {/* Data cells */}
                  {data.columns.map((column, colIndex) => {
                    const cellData = getCellData(data, row, column);
                    const percentage = cellData?.percentage ?? 0;
                    const normalizedPercentage = maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0;

                    return (
                      <td key={colIndex} className="p-1">
                        <div
                          className={cn(
                            'flex flex-col items-center justify-center rounded-lg py-2 px-1 min-h-12 transition-all',
                            getColorIntensity(normalizedPercentage, colorScheme)
                          )}
                        >
                          <span className={cn('text-sm font-semibold tabular-nums', getTextColor(normalizedPercentage, colorScheme))}>
                            {cellData?.count ?? 0}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] tabular-nums',
                              percentage > 60 && colorScheme === 'primary' ? 'text-on-primary/70' : 'text-on-surface-variant'
                            )}
                          >
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-4 mt-4 pt-3 border-t border-outline-variant/30">
          <span className="text-xs text-on-surface-variant">Response intensity:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-primary/20" />
            <div className="w-4 h-4 rounded bg-primary/40" />
            <div className="w-4 h-4 rounded bg-primary/60" />
            <div className="w-4 h-4 rounded bg-primary/80" />
            <div className="w-4 h-4 rounded bg-primary" />
          </div>
          <span className="text-[10px] text-on-surface-variant">Low → High</span>
        </div>
      </CardContent>
    </Card>
  );
}
