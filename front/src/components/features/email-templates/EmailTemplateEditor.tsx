// EmailTemplateEditor - Full email template editor with HTML/Plain text support and preview

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Save,
  Eye,
  Code,
  Mail,
  User,
  Variable,
  Undo2,
  Redo2,
  Copy,
  Check,
  AlertCircle,
  FileText,
  ChevronLeft,
  FileCode,
  FileType,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input, Textarea, Select, Chip, Tooltip, toast, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { useUpdateEmailTemplate, useEmailTemplatePlaceholders } from '@/hooks/queries/useEmailTemplates';
import { useCopyToClipboard, useEditorShortcuts } from '@/hooks';
import { EmailTemplateType } from '@/types/enums';
import type { EmailTemplate, UpdateEmailTemplateRequest } from '@/types';

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onBack?: () => void;
  onSaved?: () => void;
}

// Default placeholders (used if API fetch fails)
const defaultPlaceholders = [
  { key: '{{firstName}}', label: 'First Name', description: "Recipient's first name" },
  { key: '{{lastName}}', label: 'Last Name', description: "Recipient's last name" },
  { key: '{{email}}', label: 'Email', description: "Recipient's email address" },
  { key: '{{surveyLink}}', label: 'Survey Link', description: 'Link to the survey' },
  { key: '{{surveyTitle}}', label: 'Survey Title', description: 'Title of the survey' },
  { key: '{{senderName}}', label: 'Sender Name', description: 'Name of the sender' },
  { key: '{{companyName}}', label: 'Company Name', description: 'Your company name' },
  { key: '{{unsubscribeLink}}', label: 'Unsubscribe Link', description: 'Unsubscribe link' },
];

const templateTypes: { value: EmailTemplateType; label: string }[] = [
  { value: EmailTemplateType.SurveyInvitation, label: 'Invitation' },
  { value: EmailTemplateType.SurveyReminder, label: 'Reminder' },
  { value: EmailTemplateType.ThankYou, label: 'Thank You' },
  { value: EmailTemplateType.Custom, label: 'Custom' },
];

// Render preview with placeholder highlighting
function renderPreview(content: string, isHtml: boolean): string {
  let preview = content;

  // Replace placeholders with highlighted spans
  defaultPlaceholders.forEach(({ key }) => {
    const escapedKey = key.replace(/[{}]/g, '\\$&');
    preview = preview.replace(
      new RegExp(escapedKey, 'g'),
      `<span style="background-color: var(--color-primary-container); color: var(--color-on-primary-container); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.875em;">${key}</span>`
    );
  });

  // For plain text, convert newlines to <br>
  if (!isHtml) {
    preview = preview.replace(/\n/g, '<br>');
  }

  return preview;
}

// Simple HTML formatter for basic formatting
function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);

  return text.substring(0, start) + before + selectedText + after + text.substring(end);
}

type EditorMode = 'html' | 'plaintext';

export function EmailTemplateEditor({ template, onBack, onSaved }: EmailTemplateEditorProps) {
  const { t } = useTranslation();

  // Form state
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [htmlBody, setHtmlBody] = useState(template.htmlBody || '');
  const [plainTextBody, setPlainTextBody] = useState(template.plainTextBody || '');
  const [type, setType] = useState<EmailTemplateType>(template.type || EmailTemplateType.Custom);

  // Editor state
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [editorMode, setEditorMode] = useState<EditorMode>('html');
  const [history, setHistory] = useState<{ html: string; plain: string }[]>([{ html: template.htmlBody || '', plain: template.plainTextBody || '' }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);
  const { copy } = useCopyToClipboard();

  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const plainTextareaRef = useRef<HTMLTextAreaElement>(null);

  const updateTemplate = useUpdateEmailTemplate();

  // Fetch placeholders from API (with fallback)
  const { data: apiPlaceholders } = useEmailTemplatePlaceholders();
  const placeholders = useMemo(() => {
    if (apiPlaceholders && apiPlaceholders.length > 0) {
      return apiPlaceholders.map((key) => {
        const defaultMatch = defaultPlaceholders.find((p) => p.key === key);
        return {
          key,
          label: defaultMatch?.label || key.replace(/[{}]/g, ''),
          description: defaultMatch?.description || `Placeholder: ${key}`,
        };
      });
    }
    // Use template's available placeholders if provided
    if (template.availablePlaceholders && template.availablePlaceholders.length > 0) {
      return template.availablePlaceholders.map((key) => {
        const defaultMatch = defaultPlaceholders.find((p) => p.key === key);
        return {
          key,
          label: defaultMatch?.label || key.replace(/[{}]/g, ''),
          description: defaultMatch?.description || `Placeholder: ${key}`,
        };
      });
    }
    return defaultPlaceholders;
  }, [apiPlaceholders, template.availablePlaceholders]);

  // Track if there are unsaved changes
  const hasChanges = useMemo(() => {
    return (
      name !== template.name ||
      subject !== template.subject ||
      htmlBody !== (template.htmlBody || '') ||
      plainTextBody !== (template.plainTextBody || '') ||
      type !== (template.type || 'Custom')
    );
  }, [name, subject, htmlBody, plainTextBody, type, template]);

  // Update history when content changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentState = history[historyIndex];
      if (htmlBody !== currentState.html || plainTextBody !== currentState.plain) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ html: htmlBody, plain: plainTextBody });
        // Limit history to 50 entries
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [htmlBody, plainTextBody, history, historyIndex]);

  // Undo/Redo handlers
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHtmlBody(history[newIndex].html);
      setPlainTextBody(history[newIndex].plain);
    }
  }, [canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setHtmlBody(history[newIndex].html);
      setPlainTextBody(history[newIndex].plain);
    }
  }, [canRedo, history, historyIndex]);

  // Insert placeholder
  const insertPlaceholder = useCallback(
    (placeholder: string) => {
      const textarea = editorMode === 'html' ? htmlTextareaRef.current : plainTextareaRef.current;

      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newValue = text.substring(0, start) + placeholder + text.substring(end);

        if (editorMode === 'html') {
          setHtmlBody(newValue);
        } else {
          setPlainTextBody(newValue);
        }

        // Restore focus and cursor position
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
        }, 0);

        toast.success(`Inserted ${placeholder}`);
      } else {
        // Fallback: copy to clipboard
        copy(placeholder, { showToast: false });
        setCopiedPlaceholder(placeholder);
        setTimeout(() => setCopiedPlaceholder(null), 2000);
        toast.info(`Copied "${placeholder}" to clipboard`);
      }
    },
    [editorMode, copy]
  );

  // HTML formatting helpers
  const insertFormatting = useCallback((before: string, after: string) => {
    const textarea = htmlTextareaRef.current;
    if (!textarea) return;

    const newValue = wrapSelection(textarea, before, after);
    setHtmlBody(newValue);

    // Restore focus
    setTimeout(() => textarea.focus(), 0);
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error(t('emailTemplates.editor.validation.nameRequired'));
      return;
    }
    if (!subject.trim()) {
      toast.error(t('emailTemplates.editor.validation.subjectRequired'));
      return;
    }
    if (!htmlBody.trim()) {
      toast.error(t('emailTemplates.editor.validation.bodyRequired'));
      return;
    }

    try {
      const data: UpdateEmailTemplateRequest = {
        name: name.trim(),
        subject: subject.trim(),
        htmlBody: htmlBody.trim(),
        plainTextBody: plainTextBody.trim() || undefined,
        type,
        languageCode: template.defaultLanguage,
      };

      await updateTemplate.mutateAsync({ id: template.id, data });
      toast.success(t('emailTemplates.editor.saveSuccess'));
      onSaved?.();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error(t('emailTemplates.editor.saveError'));
    }
  }, [name, subject, htmlBody, plainTextBody, type, template.id, template.defaultLanguage, updateTemplate, onSaved, t]);

  // Keyboard shortcuts (save, undo, redo)
  useEditorShortcuts({
    onSave: handleSave,
    onUndo: handleUndo,
    onRedo: handleRedo,
    canUndo,
    canRedo,
  });

  // Determine which content to preview
  const previewContent = editorMode === 'html' ? htmlBody : plainTextBody;
  const previewHtml = useMemo(() => renderPreview(previewContent, editorMode === 'html'), [previewContent, editorMode]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="text" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('emailTemplates.editor.back')}
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-on-surface">{t('emailTemplates.editor.title')}</h1>
            <p className="text-sm text-on-surface-variant">{hasChanges ? t('emailTemplates.editor.unsavedChanges') : t('common.saved')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-surface-container rounded-full p-1">
            <Button variant={viewMode === 'edit' ? 'tonal' : 'text'} size="sm" className="rounded-full px-3" onClick={() => setViewMode('edit')}>
              <Code className="h-4 w-4 mr-1" />
              {t('emailTemplates.editor.viewModes.edit')}
            </Button>
            <Button variant={viewMode === 'split' ? 'tonal' : 'text'} size="sm" className="rounded-full px-3" onClick={() => setViewMode('split')}>
              {t('emailTemplates.editor.viewModes.split')}
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'tonal' : 'text'}
              size="sm"
              className="rounded-full px-3"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4 mr-1" />
              {t('emailTemplates.editor.viewModes.preview')}
            </Button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 ml-2">
            <Tooltip content={`${t('emailTemplates.editor.toolbar.undo')} (Ctrl+Z)`}>
              <Button variant="text" size="icon-sm" onClick={handleUndo} disabled={!canUndo}>
                <Undo2 className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content={`${t('emailTemplates.editor.toolbar.redo')} (Ctrl+Shift+Z)`}>
              <Button variant="text" size="icon-sm" onClick={handleRedo} disabled={!canRedo}>
                <Redo2 className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>

          {/* Save button */}
          <Button onClick={handleSave} loading={updateTemplate.isPending} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {t('common.save')}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor panel */}
        <div
          className={cn(
            'flex flex-col border-r border-outline-variant/30 bg-surface transition-all duration-200',
            viewMode === 'preview' ? 'w-0 opacity-0' : viewMode === 'split' ? 'w-1/2' : 'w-full'
          )}
        >
          {/* Template settings */}
          <div className="p-4 space-y-4 border-b border-outline-variant/30 bg-surface-container/30">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">{t('emailTemplates.editor.templateName')}</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('emailTemplates.editor.templateNamePlaceholder')}
                  startIcon={<FileText className="h-4 w-4" />}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">{t('emailTemplates.form.type')}</label>
                <Select
                  value={String(type)}
                  onChange={(value) => setType(parseInt(value) as EmailTemplateType)}
                  options={templateTypes.map((opt) => ({ value: String(opt.value), label: opt.label }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">{t('emailTemplates.editor.subject')}</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('emailTemplates.editor.subjectPlaceholder')}
                startIcon={<Mail className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Editor mode tabs and Placeholders */}
          <div className="p-4 border-b border-outline-variant/30 space-y-3">
            {/* Editor mode selector */}
            <div className="flex items-center justify-between">
              <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as EditorMode)} variant="segmented">
                <TabsList>
                  <TabsTrigger value="html" className="gap-1.5">
                    <FileCode className="h-3.5 w-3.5" />
                    {t('emailTemplates.editor.contentModes.html')}
                  </TabsTrigger>
                  <TabsTrigger value="plaintext" className="gap-1.5">
                    <FileType className="h-3.5 w-3.5" />
                    {t('emailTemplates.editor.contentModes.plainText')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* HTML formatting buttons */}
              {editorMode === 'html' && (
                <div className="flex items-center gap-1">
                  <Tooltip content={t('emailTemplates.editor.toolbar.bold')}>
                    <Button variant="text" size="icon-sm" onClick={() => insertFormatting('<strong>', '</strong>')}>
                      <Bold className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t('emailTemplates.editor.toolbar.italic')}>
                    <Button variant="text" size="icon-sm" onClick={() => insertFormatting('<em>', '</em>')}>
                      <Italic className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t('emailTemplates.editor.toolbar.link')}>
                    <Button variant="text" size="icon-sm" onClick={() => insertFormatting('<a href="">', '</a>')}>
                      <Link className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t('emailTemplates.editor.toolbar.bulletList')}>
                    <Button variant="text" size="icon-sm" onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}>
                      <List className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t('emailTemplates.editor.toolbar.numberedList')}>
                    <Button variant="text" size="icon-sm" onClick={() => insertFormatting('<ol>\n  <li>', '</li>\n</ol>')}>
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Placeholders */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Variable className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-on-surface">{t('emailTemplates.editor.availablePlaceholders')}</span>
                <span className="text-xs text-on-surface-variant">({t('common.clickToInsert')})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {placeholders.map(({ key, label }) => (
                  <Tooltip key={key} content={`${t('common.insert')}: ${key}`}>
                    <Chip
                      size="sm"
                      variant="assist"
                      className={cn(
                        'cursor-pointer hover:bg-primary-container/50 transition-colors',
                        copiedPlaceholder === key && 'bg-success-container text-on-success-container'
                      )}
                      onClick={() => insertPlaceholder(key)}
                    >
                      {copiedPlaceholder === key ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      {label}
                    </Chip>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Body editor */}
          <div className="flex-1 p-4 overflow-auto">
            <label className="text-sm font-medium text-on-surface block mb-2">
              {editorMode === 'html' ? t('emailTemplates.editor.contentModes.html') : t('emailTemplates.editor.contentModes.plainText')}
              {editorMode === 'plaintext' && (
                <span className="text-xs text-on-surface-variant ml-2">({t('emailTemplates.editor.plainTextFallback')})</span>
              )}
            </label>
            {editorMode === 'html' ? (
              <Textarea
                ref={htmlTextareaRef}
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                placeholder={t('emailTemplates.editor.htmlPlaceholder')}
                className="w-full h-[calc(100%-2rem)] min-h-75 font-mono text-sm resize-none"
              />
            ) : (
              <Textarea
                ref={plainTextareaRef}
                value={plainTextBody}
                onChange={(e) => setPlainTextBody(e.target.value)}
                placeholder={t('emailTemplates.editor.plainTextPlaceholder')}
                className="w-full h-[calc(100%-2rem)] min-h-75 font-mono text-sm resize-none"
              />
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div
          className={cn(
            'flex flex-col bg-surface-container/30 transition-all duration-200 overflow-hidden',
            viewMode === 'edit' ? 'w-0 opacity-0' : viewMode === 'split' ? 'w-1/2' : 'w-full'
          )}
        >
          <div className="p-4 border-b border-outline-variant/30 bg-surface">
            <h3 className="text-sm font-medium text-on-surface flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t('emailTemplates.editor.preview')}
              <Chip size="sm" variant="assist" className="ml-2">
                {editorMode === 'html' ? t('emailTemplates.editor.contentModes.html') : t('emailTemplates.editor.contentModes.plainText')}
              </Chip>
            </h3>
          </div>

          {/* Email preview */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-2xl mx-auto bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden">
              {/* Email header */}
              <div className="p-4 border-b border-outline-variant/20 bg-surface-container/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center">
                    <User className="h-5 w-5 text-on-primary-container" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">
                      {t('emailTemplates.preview.from')}: {t('emailTemplates.preview.yourCompany')}
                    </p>
                    <p className="text-xs text-on-surface-variant">noreply@yourcompany.com</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-on-surface-variant">{t('emailTemplates.preview.to')}:</span>
                    <span className="text-on-surface">recipient@example.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-on-surface-variant">{t('emailTemplates.editor.subject')}:</span>
                    <span className="text-sm font-medium text-on-surface" dangerouslySetInnerHTML={{ __html: renderPreview(subject, false) }} />
                  </div>
                </div>
              </div>

              {/* Email body */}
              <div className="p-6 text-sm text-on-surface leading-relaxed" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>

            {/* Placeholder legend */}
            <div className="mt-6 p-4 bg-surface rounded-xl border border-outline-variant/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-on-surface">{t('emailTemplates.preview.placeholderReference')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {placeholders.map(({ key, description }) => (
                  <div key={key} className="flex items-center gap-2">
                    <code className="px-1.5 py-0.5 rounded bg-primary-container/50 text-on-primary-container font-mono">{key}</code>
                    <span className="text-on-surface-variant">{description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
