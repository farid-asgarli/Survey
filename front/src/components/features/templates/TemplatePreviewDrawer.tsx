import { Drawer, DrawerContent, DrawerBody, DrawerFooter, Button, Chip, Skeleton, OverlayHeader } from '@/components/ui';
import {
  FileText,
  Users,
  Globe,
  Lock,
  Calendar,
  Copy,
  CheckCircle2,
  Circle,
  AlignLeft,
  Hash,
  Star,
  CalendarDays,
  Upload,
  LayoutGrid,
  ToggleLeft,
  ChevronDown,
  Gauge,
  CalendarClock,
  Grip,
  Mail,
} from 'lucide-react';
import { useTemplateDetail } from '@/hooks/queries/useTemplates';
import { getCategoryInfo } from './templateUtils';
import { formatDate } from '@/utils';
import { QuestionType } from '@/types';
import type { SurveyTemplate, TemplateCategory } from '@/types';
import { cn } from '@/lib/utils';

interface TemplatePreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
  onUseTemplate: (template: SurveyTemplate) => void;
}

// Question type icon mapping
const questionTypeIcons: Partial<Record<QuestionType, typeof Circle>> = {
  [QuestionType.SingleChoice]: Circle,
  [QuestionType.MultipleChoice]: CheckCircle2,
  [QuestionType.Text]: AlignLeft,
  [QuestionType.LongText]: AlignLeft,
  [QuestionType.Rating]: Star,
  [QuestionType.Scale]: Hash,
  [QuestionType.Matrix]: LayoutGrid,
  [QuestionType.Date]: CalendarDays,
  [QuestionType.DateTime]: CalendarClock,
  [QuestionType.FileUpload]: Upload,
  [QuestionType.Ranking]: Grip,
  [QuestionType.YesNo]: ToggleLeft,
  [QuestionType.Dropdown]: ChevronDown,
  [QuestionType.NPS]: Gauge,
  [QuestionType.Checkbox]: CheckCircle2,
  [QuestionType.Number]: Hash,
  [QuestionType.ShortText]: AlignLeft,
  [QuestionType.Email]: Mail,
};

const questionTypeLabels: Partial<Record<QuestionType, string>> = {
  [QuestionType.SingleChoice]: 'Single Choice',
  [QuestionType.MultipleChoice]: 'Multiple Choice',
  [QuestionType.Text]: 'Short Text',
  [QuestionType.LongText]: 'Long Text',
  [QuestionType.Rating]: 'Rating',
  [QuestionType.Scale]: 'Scale',
  [QuestionType.Matrix]: 'Matrix',
  [QuestionType.Date]: 'Date',
  [QuestionType.DateTime]: 'Date & Time',
  [QuestionType.FileUpload]: 'File Upload',
  [QuestionType.Ranking]: 'Ranking',
  [QuestionType.YesNo]: 'Yes/No',
  [QuestionType.Dropdown]: 'Dropdown',
  [QuestionType.NPS]: 'Net Promoter Score',
  [QuestionType.Checkbox]: 'Checkbox',
  [QuestionType.Number]: 'Number',
  [QuestionType.ShortText]: 'Short Text',
  [QuestionType.Email]: 'Email',
};

function QuestionPreviewItem({
  question,
  index,
}: {
  question: {
    type: QuestionType;
    text: string;
    isRequired: boolean;
    optionCount?: number;
  };
  index: number;
}) {
  const Icon = questionTypeIcons[question.type] || Circle;

  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm text-on-surface leading-snug">
          {question.text}
          {question.isRequired && <span className="text-error ml-0.5">*</span>}
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant/70">
          <Icon className="h-3 w-3" />
          <span>{questionTypeLabels[question.type] || question.type}</span>
          {question.optionCount && question.optionCount > 0 && (
            <>
              <span className="text-on-surface-variant/40">•</span>
              <span>{question.optionCount} options</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplatePreviewContent({ template, onUseTemplate, onClose }: { template: SurveyTemplate; onUseTemplate: () => void; onClose: () => void }) {
  const categoryInfo = getCategoryInfo((template.category || 'other') as TemplateCategory);
  const CategoryIcon = categoryInfo.icon;
  const questions = template.questions || [];

  return (
    <>
      <OverlayHeader icon={<CategoryIcon className="h-7 w-7" />} title={template.name} description={template.description} showClose onClose={onClose}>
        {/* Stats pills */}
        <div className="flex items-center gap-3 mt-4">
          <OverlayHeader.StatsPill icon={<FileText />} value={template.questionCount} label="questions" />
          <OverlayHeader.StatsPill icon={<Users />} value={template.usageCount} label="uses" />
        </div>
      </OverlayHeader>

      <DrawerBody className="pt-5">
        {/* Metadata row */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Chip size="sm" variant="assist">
            {categoryInfo.label}
          </Chip>
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              template.isPublic ? 'bg-success/10 text-success' : 'bg-surface-container-high text-on-surface-variant'
            )}
          >
            {template.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {template.isPublic ? 'Public' : 'Private'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant ml-auto">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(template.createdAt)}
          </div>
        </div>

        {/* Questions section */}
        <div>
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Questions ({questions.length})</h3>

          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionPreviewItem
                  key={q.id}
                  question={{
                    type: q.type,
                    text: q.text || 'Untitled question',
                    isRequired: q.isRequired || false,
                    optionCount: q.settings?.options?.length ?? 0,
                  }}
                  index={q.order - 1}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-high mb-3">
                <FileText className="h-6 w-6 text-on-surface-variant/50" />
              </div>
              <p className="text-sm font-medium text-on-surface">No questions yet</p>
              <p className="text-xs text-on-surface-variant mt-1">Questions will appear here once added</p>
            </div>
          )}
        </div>
      </DrawerBody>

      <DrawerFooter className="border-t border-outline-variant/30">
        <Button variant="filled" onClick={onUseTemplate} size="lg" className="w-full">
          <Copy className="h-5 w-5 mr-2" />
          Use This Template
        </Button>
      </DrawerFooter>
    </>
  );
}

function TemplatePreviewSkeleton() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="bg-primary-container/30 px-5 pt-5 pb-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
      <DrawerBody className="pt-5">
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </DrawerBody>
    </>
  );
}

export function TemplatePreviewDrawer({ open, onOpenChange, templateId, onUseTemplate }: TemplatePreviewDrawerProps) {
  const { data: template, isLoading, error } = useTemplateDetail(templateId || undefined);

  const handleUseTemplate = () => {
    if (template) {
      onUseTemplate(template);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="right">
      <DrawerContent className="w-full max-w-md" showClose={false}>
        {isLoading && <TemplatePreviewSkeleton />}
        {error && (
          <div className="p-6 text-center">
            <p className="text-error">Failed to load template</p>
          </div>
        )}
        {template && !isLoading && (
          <TemplatePreviewContent template={template} onUseTemplate={handleUseTemplate} onClose={() => onOpenChange(false)} />
        )}
      </DrawerContent>
    </Drawer>
  );
}
