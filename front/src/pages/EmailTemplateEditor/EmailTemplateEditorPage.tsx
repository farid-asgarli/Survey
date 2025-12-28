// Email Template Editor Page - Full-screen visual email editor
// Similar to SurveyBuilder, this provides a dedicated editing experience for email templates

import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle, Mail, Wand2, Code } from 'lucide-react';
import { Button, EmptyState, Tooltip, toast } from '@/components/ui';
import { useEmailTemplate } from '@/hooks/queries/useEmailTemplates';
import { useViewTransitionNavigate } from '@/hooks';
import { VisualEmailEditor, EmailTemplateEditor } from '@/components/features/email-templates';

export function EmailTemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useViewTransitionNavigate();
  const { t } = useTranslation();

  // Editor mode: 'visual' for drag-drop, 'code' for raw HTML
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');

  // Fetch template data
  const { data: template, isLoading, error, refetch } = useEmailTemplate(id);

  // Handle back navigation
  const handleBack = () => {
    navigate('/email-templates');
  };

  // Handle save completion - refetch to sync both editors
  const handleSaved = useCallback(() => {
    refetch();
    toast.success(t('emailEditor.saved', 'Template saved successfully'));
  }, [refetch, t]);

  // Handle editor mode switch with refetch to ensure data is synced
  const handleEditorModeSwitch = useCallback(
    (mode: 'visual' | 'code') => {
      if (mode !== editorMode) {
        // Refetch template to ensure latest saved data is loaded
        refetch().then(() => {
          setEditorMode(mode);
        });
        toast.info(
          t('emailEditor.modeSwitched', 'Switched to {{mode}} editor. Unsaved changes may be lost.', {
            mode: mode === 'visual' ? t('emailTemplates.editor.visual', 'Visual') : t('emailTemplates.editor.code', 'Code'),
          })
        );
      }
    },
    [editorMode, refetch, t]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-container-lowest">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-on-surface-variant">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !template) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-container-lowest">
        <EmptyState
          icon={<AlertTriangle className="h-7 w-7" />}
          title={t('emailEditor.errors.loadFailed', 'Failed to load template')}
          description={t('emailEditor.errors.loadFailedDescription', 'The email template could not be loaded. Please try again.')}
          iconVariant="muted"
          action={{
            label: t('common.back'),
            onClick: handleBack,
            variant: 'outline',
          }}
        />
      </div>
    );
  }

  // No template ID
  if (!id) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-container-lowest">
        <EmptyState
          icon={<Mail className="h-7 w-7" />}
          title={t('emailEditor.errors.noTemplate', 'No template selected')}
          description={t('emailEditor.errors.noTemplateDescription', 'Please select an email template to edit.')}
          iconVariant="muted"
          action={{
            label: t('emailTemplates.backToTemplates', 'Back to Templates'),
            onClick: handleBack,
            variant: 'outline',
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Editor mode toggle - floating button */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-surface rounded-full p-1 shadow-lg border border-outline-variant/30">
        <Tooltip content={t('emailTemplates.editor.visualMode', 'Visual Editor (Drag & Drop)')}>
          <Button
            variant={editorMode === 'visual' ? 'tonal' : 'text'}
            size="icon-sm"
            className="rounded-full"
            onClick={() => handleEditorModeSwitch('visual')}
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        </Tooltip>
        <Tooltip content={t('emailTemplates.editor.codeMode', 'Code Editor (Raw HTML)')}>
          <Button
            variant={editorMode === 'code' ? 'tonal' : 'text'}
            size="icon-sm"
            className="rounded-full"
            onClick={() => handleEditorModeSwitch('code')}
          >
            <Code className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>

      {editorMode === 'visual' ? (
        <VisualEmailEditor template={template} onBack={handleBack} onSaved={handleSaved} />
      ) : (
        <EmailTemplateEditor template={template} onBack={handleBack} onSaved={handleSaved} />
      )}
    </div>
  );
}
