import { useState } from 'react';
import { Copy, FileStack, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { useTemplateSchema, type UseTemplateFormData } from '@/lib/validations';
import { getCategoryInfo } from './templateUtils';
import type { SurveyTemplate, TemplateCategory } from '@/types';

interface UseTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: SurveyTemplate | null;
  onSubmit: (data: { title: string; description?: string }) => void | Promise<void>;
  isLoading?: boolean;
}

function UseTemplateForm({
  template,
  onSubmit,
  onCancel,
  isLoading,
}: {
  template: SurveyTemplate;
  onSubmit: (data: { title: string; description?: string }) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [showDescription, setShowDescription] = useState(!!template.description);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UseTemplateFormData>({
    resolver: zodResolver(useTemplateSchema),
    defaultValues: {
      title: `${template.name} - Copy`,
      description: template.description || '',
    },
    mode: 'onChange',
  });

  const onFormSubmit: SubmitHandler<UseTemplateFormData> = async (data) => {
    await onSubmit({
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
    });
  };

  const categoryInfo = getCategoryInfo((template.category || 'other') as TemplateCategory);
  const CategoryIcon = categoryInfo.icon;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <DialogBody className="space-y-4">
        {/* Template info card */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high ${categoryInfo.color}`}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-on-surface truncate">{template.name}</p>
              <p className="text-xs text-on-surface-variant">
                {template.questionCount} questions • {categoryInfo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Title input */}
        <Input
          label="Survey Title"
          placeholder="Enter a title for your new survey"
          {...register('title')}
          error={errors.title?.message}
          autoFocus
          disabled={isLoading}
        />

        {/* Description */}
        {showDescription ? (
          <Textarea
            label="Description (optional)"
            placeholder="Add a description for your survey..."
            {...register('description')}
            rows={3}
            disabled={isLoading}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowDescription(true)}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            disabled={isLoading}
          >
            <Sparkles className="h-4 w-4" />
            Add description
          </button>
        )}

        <p className="text-xs text-on-surface-variant text-center">
          A new survey will be created with all questions from this template. You can customize it after creation.
        </p>
      </DialogBody>

      <DialogFooter className="pt-4">
        <Button type="button" variant="text" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="filled" disabled={!isValid || isLoading} loading={isLoading}>
          <Copy className="h-4 w-4 mr-2" />
          Create Survey
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UseTemplateDialog({ open, onOpenChange, template, onSubmit, isLoading = false }: UseTemplateDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="default" showClose={false}>
        <DialogHeader
          hero
          icon={<FileStack className="h-7 w-7" />}
          title="Use Template"
          description="Create a new survey from this template"
          showClose
        />

        {open && template && (
          <UseTemplateForm key={template.id} template={template} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} isLoading={isLoading} />
        )}
      </DialogContent>
    </Dialog>
  );
}
