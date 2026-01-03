// ExportDialog - Dialog for exporting survey responses

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, FileText, Calendar, CheckSquare, Loader2, AlertCircle, Filter, FileOutput, ClipboardList } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Checkbox,
  Chip,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  DateRangePicker,
} from '@/components/ui';
import { useExportResponses, useExportPreview } from '@/hooks/queries/useResponses';
import { toast } from '@/components/ui';
import { cn } from '@/lib/utils';
import { generateDateFilename } from '@/utils';
import { ExportFormat, ExportFormatLabels } from '@/types';
import type { ExportResponsesRequest, ExportColumn } from '@/types';

interface ExportDialogProps {
  surveyId: string;
  surveyTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: ExportFormat.Csv,
    label: 'CSV',
    icon: <FileText className='h-5 w-5' />,
    description: 'Comma-separated values, opens in any spreadsheet',
  },
  {
    value: ExportFormat.Excel,
    label: 'Excel',
    icon: <FileSpreadsheet className='h-5 w-5' />,
    description: 'Microsoft Excel format with formatting',
  },
];

export function ExportDialog({ surveyId, surveyTitle, open, onOpenChange }: ExportDialogProps) {
  const { t } = useTranslation();
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.Csv);
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [includeIncomplete, setIncludeIncomplete] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState<Set<string> | null>(null);

  const { data: preview, isLoading: previewLoading, error: previewError } = useExportPreview(surveyId);
  const exportMutation = useExportResponses(surveyId);

  // Group columns by type
  const groupedColumns = useMemo(() => {
    const columns = preview?.columns;
    if (!columns) return { questions: [], metadata: [], system: [] };

    const groups: Record<string, ExportColumn[]> = {
      questions: [],
      metadata: [],
      system: [],
    };

    columns.forEach((col) => {
      // Map backend type to frontend group
      const type = col.type.toLowerCase();
      const group = type === 'question' ? groups.questions : type === 'metadata' ? groups.metadata : groups.system;
      group.push(col);
    });

    return groups;
  }, [preview]);

  // Use selected columns if set, otherwise default to all columns from preview
  const activeColumns = useMemo(() => {
    if (selectedColumns !== null) return selectedColumns;
    if (preview?.columns) {
      return new Set(preview.columns.map((c) => c.id));
    }
    return new Set<string>();
  }, [selectedColumns, preview]);

  const toggleColumn = (columnId: string) => {
    const current = activeColumns;
    const next = new Set(current);
    if (next.has(columnId)) {
      next.delete(columnId);
    } else {
      next.add(columnId);
    }
    setSelectedColumns(next);
  };

  const selectAllInGroup = (columns: ExportColumn[]) => {
    const current = activeColumns;
    const next = new Set(current);
    columns.forEach((col) => next.add(col.id));
    setSelectedColumns(next);
  };

  const deselectAllInGroup = (columns: ExportColumn[]) => {
    const current = activeColumns;
    const next = new Set(current);
    columns.forEach((col) => next.delete(col.id));
    setSelectedColumns(next);
  };

  const isGroupAllSelected = (columns: ExportColumn[]) => {
    return columns.every((col) => activeColumns.has(col.id));
  };

  const isGroupPartiallySelected = (columns: ExportColumn[]) => {
    const selectedCount = columns.filter((col) => activeColumns.has(col.id)).length;
    return selectedCount > 0 && selectedCount < columns.length;
  };

  const handleExport = async () => {
    if (activeColumns.size === 0) {
      toast.error(t('responses.exportDialog.selectColumns'));
      return;
    }

    const options: ExportResponsesRequest = {
      format,
      columns: Array.from(activeColumns),
      includeIncomplete,
      includeMetadata,
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
    };

    try {
      const blob = await exportMutation.mutateAsync(options);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const fileName = generateDateFilename(surveyTitle || 'responses', String(format));
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('responses.exportDialog.exportSuccess', { fileName }));
      onOpenChange(false);
    } catch {
      toast.error(t('responses.exportDialog.exportError'));
    }
  };

  const responseCount = includeIncomplete ? preview?.totalResponses || 0 : preview?.completedResponses || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl' showClose={false}>
        <DialogHeader
          hero
          icon={<Download className='h-7 w-7' />}
          title={t('responses.exportDialog.title')}
          description={surveyTitle ? t('responses.exportDialog.descriptionWithTitle', { title: surveyTitle }) : t('responses.exportDialog.description')}
          showClose
        />

        <DialogBody className='space-y-6 max-h-[60vh] overflow-y-auto'>
          {/* Format Selection */}
          <div>
            <h4 className='text-sm font-semibold text-on-surface mb-3 flex items-center gap-2'>
              <FileOutput className='h-4 w-4' />
              {t('responses.exportDialog.format')}
            </h4>
            <Tabs value={String(format)} onValueChange={(v) => setFormat(Number(v) as ExportFormat)} variant='segmented'>
              <TabsList className='grid grid-cols-3'>
                {FORMAT_OPTIONS.map((opt) => (
                  <TabsTrigger key={opt.value} value={String(opt.value)} className='flex items-center gap-2'>
                    {opt.icon}
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <p className='text-xs text-on-surface-variant mt-2'>{FORMAT_OPTIONS.find((o) => o.value === format)?.description}</p>
          </div>

          {/* Date Range Filter */}
          <div>
            <h4 className='text-sm font-semibold text-on-surface mb-3 flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              {t('responses.exportDialog.dateRange')}
            </h4>
            <DateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              onChange={(from, to) => {
                setFromDate(from);
                setToDate(to);
              }}
            />
          </div>

          {/* Filter Options */}
          <div>
            <h4 className='text-sm font-semibold text-on-surface mb-3 flex items-center gap-2'>
              <Filter className='h-4 w-4' />
              {t('responses.exportDialog.filters')}
            </h4>
            <div className='space-y-3'>
              <Checkbox
                checked={includeIncomplete}
                onChange={(e) => setIncludeIncomplete(e.target.checked)}
                label={t('responses.exportDialog.includeIncomplete')}
                description={t('responses.exportDialog.includeIncompleteDesc')}
              />
              <Checkbox
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                label={t('responses.exportDialog.includeMetadata')}
                description={t('responses.exportDialog.includeMetadataDesc')}
              />
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <div className='flex items-center justify-between mb-3'>
              <h4 className='text-sm font-semibold text-on-surface flex items-center gap-2'>
                <CheckSquare className='h-4 w-4' />
                {t('responses.exportDialog.columnsToExport')}
              </h4>
              <span className='text-xs text-on-surface-variant'>{t('responses.exportDialog.selectedCount', { count: activeColumns.size })}</span>
            </div>

            {previewLoading ? (
              <div className='space-y-2'>
                <Skeleton className='h-10 rounded-xl' />
                <Skeleton className='h-10 rounded-xl' />
                <Skeleton className='h-10 rounded-xl' />
              </div>
            ) : previewError ? (
              <div className='flex items-center gap-2 p-4 bg-error-container rounded-2xl text-on-error-container'>
                <AlertCircle className='h-5 w-5' />
                <span>{t('responses.exportDialog.loadColumnsError')}</span>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Questions */}
                {groupedColumns.questions.length > 0 && (
                  <ColumnGroup
                    title={t('responses.exportDialog.questions')}
                    columns={groupedColumns.questions}
                    selectedColumns={activeColumns}
                    onToggle={toggleColumn}
                    onSelectAll={() => selectAllInGroup(groupedColumns.questions)}
                    onDeselectAll={() => deselectAllInGroup(groupedColumns.questions)}
                    isAllSelected={isGroupAllSelected(groupedColumns.questions)}
                    isPartiallySelected={isGroupPartiallySelected(groupedColumns.questions)}
                  />
                )}

                {/* System fields */}
                {groupedColumns.system.length > 0 && (
                  <ColumnGroup
                    title={t('responses.exportDialog.systemFields')}
                    columns={groupedColumns.system}
                    selectedColumns={activeColumns}
                    onToggle={toggleColumn}
                    onSelectAll={() => selectAllInGroup(groupedColumns.system)}
                    onDeselectAll={() => deselectAllInGroup(groupedColumns.system)}
                    isAllSelected={isGroupAllSelected(groupedColumns.system)}
                    isPartiallySelected={isGroupPartiallySelected(groupedColumns.system)}
                  />
                )}

                {/* Metadata fields */}
                {groupedColumns.metadata.length > 0 && includeMetadata && (
                  <ColumnGroup
                    title={t('responses.exportDialog.metadata')}
                    columns={groupedColumns.metadata}
                    selectedColumns={activeColumns}
                    onToggle={toggleColumn}
                    onSelectAll={() => selectAllInGroup(groupedColumns.metadata)}
                    onDeselectAll={() => deselectAllInGroup(groupedColumns.metadata)}
                    isAllSelected={isGroupAllSelected(groupedColumns.metadata)}
                    isPartiallySelected={isGroupPartiallySelected(groupedColumns.metadata)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Export Summary */}
          <div className='bg-surface-container rounded-2xl p-4'>
            <h4 className='text-sm font-semibold text-on-surface mb-3 flex items-center gap-2'>
              <ClipboardList className='h-4 w-4' />
              {t('responses.exportDialog.exportSummary')}
            </h4>
            <div className='flex flex-wrap gap-2'>
              <Chip variant='filter-selected' size='sm'>
                {t('responses.exportDialog.responsesCount', { count: responseCount })}
              </Chip>
              <Chip variant='assist' size='sm'>
                {t('responses.exportDialog.columnsCount', { count: activeColumns.size })}
              </Chip>
              <Chip variant='assist' size='sm'>
                {t('responses.exportDialog.formatLabel', { format: ExportFormatLabels[format] })}
              </Chip>
              {(fromDate || toDate) && (
                <Chip variant='assist' size='sm'>
                  {fromDate && toDate ? `${fromDate} - ${toDate}` : fromDate || toDate}
                </Chip>
              )}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={exportMutation.isPending || activeColumns.size === 0}>
            {exportMutation.isPending ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                {t('responses.exportDialog.exporting')}
              </>
            ) : (
              <>
                <Download className='h-4 w-4 mr-2' />
                {t('responses.exportDialog.exportButton', { count: responseCount })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Column Group Component
function ColumnGroup({
  title,
  columns,
  selectedColumns,
  onToggle,
  onSelectAll,
  onDeselectAll,
  isAllSelected,
  isPartiallySelected,
}: {
  title: string;
  columns: ExportColumn[];
  selectedColumns: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
}) {
  const handleGroupToggle = () => {
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <div className='bg-surface-container-low rounded-2xl overflow-hidden'>
      {/* Group Header */}
      <button type='button' onClick={handleGroupToggle} className='w-full flex items-center gap-3 p-3 hover:bg-surface-container transition-colors'>
        <div className='relative flex items-center justify-center'>
          <div
            className={cn(
              'h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
              isAllSelected ? 'bg-primary border-primary' : isPartiallySelected ? 'bg-primary/30 border-primary' : 'border-outline'
            )}
          >
            {(isAllSelected || isPartiallySelected) && <CheckSquare className={cn('h-3 w-3', isAllSelected ? 'text-on-primary' : 'text-primary')} />}
          </div>
        </div>
        <span className='font-medium text-on-surface flex-1 text-left'>{title}</span>
        <span className='text-xs text-on-surface-variant'>
          {columns.filter((c) => selectedColumns.has(c.id)).length} / {columns.length}
        </span>
      </button>

      {/* Column List */}
      <div className='border-t border-outline-variant/30 divide-y divide-outline-variant/20'>
        {columns.map((column) => (
          <label key={column.id} className='flex items-center gap-3 px-3 py-2 hover:bg-surface-container/50 cursor-pointer transition-colors'>
            <Checkbox checked={selectedColumns.has(column.id)} onChange={() => onToggle(column.id)} />
            <span className='text-sm text-on-surface'>{column.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
