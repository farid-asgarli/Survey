// Visual Email Editor - Main component with drag-drop blocks and live preview
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Save,
  Eye,
  Code,
  Undo2,
  Redo2,
  ChevronLeft,
  Smartphone,
  Monitor,
  Download,
  Copy,
  Check,
  Mail,
  Palette,
  Layout,
  Variable,
  Info,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Button,
  Input,
  Tooltip,
  toast,
  Chip,
  Select,
  Switch,
  ColorPicker,
  NumberStepper,
  SegmentedButton,
  SegmentedButtonGroup,
  Card,
  IconButton,
} from '@/components/ui';
import { useUpdateEmailTemplate } from '@/hooks/queries/useEmailTemplates';
import { useCopyToClipboard } from '@/hooks';
import { EmailTemplateType } from '@/types/enums';
import type { EmailTemplate, UpdateEmailTemplateRequest } from '@/types';
import { BlockPalette } from './BlockPalette';
import { BlockEditor } from './BlockEditor';
import { BlockSettingsPanel } from './BlockSettingsPanel';
import { generateEmailHtml, generatePlainText } from './emailHtmlGenerator';
import type { EmailBlock, EmailGlobalStyles, EmailBlockType } from './types';
import { defaultGlobalStyles, emailPlaceholders } from './types';

// Sample data for preview
const samplePlaceholderData: Record<string, string> = {
  '{{firstName}}': 'John',
  '{{lastName}}': 'Doe',
  '{{email}}': 'john.doe@example.com',
  '{{surveyLink}}': 'https://example.com/survey/abc123',
  '{{surveyTitle}}': 'Customer Satisfaction Survey',
  '{{senderName}}': 'Survey Team',
  '{{companyName}}': 'Acme Corporation',
  '{{unsubscribeLink}}': 'https://example.com/unsubscribe/xyz789',
};

// Replace placeholders with sample data
function replacePlaceholders(html: string, useSampleData: boolean): string {
  if (!useSampleData) return html;
  let result = html;
  for (const [placeholder, value] of Object.entries(samplePlaceholderData)) {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  return result;
}

// Generate unique ID
function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create new block with defaults
function createBlock(type: EmailBlockType): EmailBlock {
  const id = generateId();
  const defaults = {
    header: {
      title: 'Your Company',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      alignment: 'center' as const,
      padding: 20,
    },
    text: {
      html: '<p>Enter your text here. Use placeholders like {{firstName}} to personalize your emails.</p>',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontSize: 16,
      lineHeight: 1.5,
      padding: 20,
      alignment: 'left' as const,
    },
    image: {
      src: '',
      alt: 'Image description',
      alignment: 'center' as const,
      padding: 10,
      borderRadius: 0,
    },
    button: {
      text: 'Take Survey',
      url: '{{surveyLink}}',
      backgroundColor: '#0066cc',
      textColor: '#ffffff',
      borderRadius: 4,
      padding: { vertical: 12, horizontal: 24 },
      alignment: 'center' as const,
      fullWidth: false,
      fontSize: 16,
    },
    divider: {
      color: '#dddddd',
      thickness: 1,
      style: 'solid' as const,
      width: '100%',
      padding: 20,
    },
    spacer: {
      height: 20,
    },
    columns: {
      columns: [
        { id: generateId(), blocks: [], width: 50 },
        { id: generateId(), blocks: [], width: 50 },
      ],
      gap: 20,
      backgroundColor: '#ffffff',
      padding: 20,
      stackOnMobile: true,
    },
    social: {
      links: [],
      iconSize: 32,
      iconStyle: 'color' as const,
      alignment: 'center' as const,
      gap: 10,
      padding: 20,
    },
    footer: {
      companyName: '{{companyName}}',
      unsubscribeText: 'Unsubscribe',
      unsubscribeUrl: '{{unsubscribeLink}}',
      backgroundColor: '#f4f4f4',
      textColor: '#666666',
      fontSize: 12,
      padding: 20,
    },
  };

  return { id, type, content: defaults[type] } as EmailBlock;
}

// Design state interface for saving/loading
interface DesignState {
  blocks: EmailBlock[];
  globalStyles: EmailGlobalStyles;
  preheader?: string;
}

// Parse existing HTML into blocks (basic implementation)
function parseHtmlToBlocks(html: string): EmailBlock[] {
  // This is a simplified parser - for production, use a proper HTML parser
  const blocks: EmailBlock[] = [];

  // If no HTML or empty, return default blocks
  if (!html || html.trim() === '') {
    return [createBlock('header'), createBlock('text'), createBlock('button'), createBlock('footer')];
  }

  // For now, wrap existing HTML in a single text block
  blocks.push({
    id: generateId(),
    type: 'text',
    content: {
      html: html,
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontSize: 16,
      lineHeight: 1.5,
      padding: 20,
      alignment: 'left',
    },
  });

  return blocks;
}

interface VisualEmailEditorProps {
  template: EmailTemplate;
  onBack?: () => void;
  onSaved?: () => void;
}

type ViewMode = 'edit' | 'preview' | 'code';
type DevicePreview = 'desktop' | 'mobile';

// Load design state from template's designJson or fallback to parsing HTML
function loadDesignState(template: EmailTemplate): { blocks: EmailBlock[]; globalStyles: EmailGlobalStyles; preheader: string } {
  if (template.designJson) {
    try {
      const designState: DesignState = JSON.parse(template.designJson);
      return {
        blocks: designState.blocks || parseHtmlToBlocks(template.htmlBody || ''),
        globalStyles: designState.globalStyles || defaultGlobalStyles,
        preheader: designState.preheader || '',
      };
    } catch (e) {
      console.warn('Failed to parse designJson, falling back to HTML parsing:', e);
    }
  }
  return {
    blocks: parseHtmlToBlocks(template.htmlBody || ''),
    globalStyles: defaultGlobalStyles,
    preheader: '',
  };
}

export function VisualEmailEditor({ template, onBack, onSaved }: VisualEmailEditorProps) {
  const { t } = useTranslation();
  const { copied: copiedCode, copy: copyToClipboard } = useCopyToClipboard();

  // Load initial design state
  const initialDesignState = useMemo(() => loadDesignState(template), [template]);

  // Template metadata
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [preheader, setPreheader] = useState(initialDesignState.preheader);
  const [preheaderEnabled, setPreheaderEnabled] = useState(initialDesignState.preheader.length > 0);
  const [type, setType] = useState<EmailTemplateType>(template.type || EmailTemplateType.Custom);

  // Email blocks - load from designJson if available
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialDesignState.blocks);
  const [globalStyles, setGlobalStyles] = useState<EmailGlobalStyles>(initialDesignState.globalStyles);

  // Editor state
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [devicePreview, setDevicePreview] = useState<DevicePreview>('desktop');
  const [activePanel, setActivePanel] = useState<'blocks' | 'styles' | 'placeholders'>('blocks');
  const [previewWithSampleData, setPreviewWithSampleData] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // History for undo/redo
  const [history, setHistory] = useState<EmailBlock[][]>([blocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateTemplate = useUpdateEmailTemplate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup history timer on unmount
  useEffect(() => {
    return () => {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }
    };
  }, []);

  // Generate current design state JSON
  const currentDesignJson = useMemo(() => {
    const designState: DesignState = { blocks, globalStyles, preheader };
    return JSON.stringify(designState);
  }, [blocks, globalStyles, preheader]);

  // Track changes
  const hasChanges = useMemo(() => {
    const currentHtml = generateEmailHtml(blocks, globalStyles, subject, preheader);
    return (
      name !== template.name ||
      subject !== template.subject ||
      currentHtml !== template.htmlBody ||
      currentDesignJson !== template.designJson ||
      type !== (template.type || EmailTemplateType.Custom)
    );
  }, [name, subject, blocks, globalStyles, preheader, type, template, currentDesignJson]);

  // Generate HTML output
  const generatedHtml = useMemo(() => generateEmailHtml(blocks, globalStyles, subject, preheader), [blocks, globalStyles, subject, preheader]);

  const generatedPlainText = useMemo(() => generatePlainText(blocks), [blocks]);

  // Add block to history
  const pushHistory = useCallback(
    (newBlocks: EmailBlock[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newBlocks);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Undo/Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
    }
  }, [canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
    }
  }, [canRedo, history, historyIndex]);

  // Block operations
  const addBlock = useCallback(
    (type: EmailBlockType, index?: number) => {
      const newBlock = createBlock(type);
      const newBlocks = [...blocks];
      if (index !== undefined) {
        newBlocks.splice(index, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }
      setBlocks(newBlocks);
      pushHistory(newBlocks);
      setSelectedBlockId(newBlock.id);
      toast.success(t('emailEditor.blockAdded', 'Block added'));
    },
    [blocks, pushHistory, t]
  );

  const updateBlock = useCallback(
    (id: string, updatedBlock: EmailBlock) => {
      const newBlocks = blocks.map((b) => (b.id === id ? updatedBlock : b));
      setBlocks(newBlocks);
      // Debounce history updates for performance
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }
      historyTimerRef.current = setTimeout(() => {
        pushHistory(newBlocks);
        historyTimerRef.current = null;
      }, 500);
    },
    [blocks, pushHistory]
  );

  const deleteBlock = useCallback(
    (id: string) => {
      const newBlocks = blocks.filter((b) => b.id !== id);
      setBlocks(newBlocks);
      pushHistory(newBlocks);
      setSelectedBlockId(null);
      toast.success(t('emailEditor.blockDeleted', 'Block deleted'));
    },
    [blocks, pushHistory, t]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;

      const original = blocks[index];
      // Deep clone to handle nested objects like padding
      const duplicate: EmailBlock = JSON.parse(JSON.stringify(original));
      duplicate.id = generateId();
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, duplicate);
      setBlocks(newBlocks);
      pushHistory(newBlocks);
      setSelectedBlockId(duplicate.id);
      toast.success(t('emailEditor.blockDuplicated', 'Block duplicated'));
    },
    [blocks, pushHistory, t]
  );

  const moveBlock = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      setBlocks(newBlocks);
      pushHistory(newBlocks);
    },
    [blocks, pushHistory]
  );

  // Reorder blocks via drag-drop
  const reorderBlock = useCallback(
    (fromId: string, toId: string) => {
      const fromIndex = blocks.findIndex((b) => b.id === fromId);
      const toIndex = blocks.findIndex((b) => b.id === toId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

      const newBlocks = [...blocks];
      const [removed] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, removed);
      setBlocks(newBlocks);
      pushHistory(newBlocks);
    },
    [blocks, pushHistory]
  );

  // Handle drop on canvas
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const blockType = e.dataTransfer.getData('blockType') as EmailBlockType;
      const draggedBlockId = e.dataTransfer.getData('blockId');

      if (blockType && !draggedBlockId) {
        // New block from palette
        addBlock(blockType);
      }
    },
    [addBlock]
  );

  // Save handler
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error(t('emailEditor.errors.nameRequired', 'Template name is required'));
      return;
    }
    if (!subject.trim()) {
      toast.error(t('emailEditor.errors.subjectRequired', 'Subject is required'));
      return;
    }

    try {
      const data: UpdateEmailTemplateRequest = {
        name: name.trim(),
        subject: subject.trim(),
        htmlBody: generatedHtml,
        plainTextBody: generatedPlainText,
        designJson: currentDesignJson, // Save the design state for resume editing
        type,
        languageCode: template.defaultLanguage,
      };

      await updateTemplate.mutateAsync({ id: template.id, data });
      toast.success(t('emailEditor.saved', 'Template saved successfully'));
      onSaved?.();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error(t('emailEditor.errors.saveFailed', 'Failed to save template'));
    }
  }, [name, subject, generatedHtml, generatedPlainText, currentDesignJson, type, template.id, template.defaultLanguage, updateTemplate, onSaved, t]);

  // Copy HTML to clipboard
  const copyHtmlToClipboard = useCallback(() => {
    copyToClipboard(generatedHtml, {
      successMessage: t('emailEditor.htmlCopied', 'HTML copied to clipboard'),
    });
  }, [generatedHtml, copyToClipboard, t]);

  // Download HTML file
  const downloadHtml = useCallback(() => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('emailEditor.htmlDownloaded', 'HTML file downloaded'));
  }, [generatedHtml, name, t]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if (e.key === 'Delete' && selectedBlockId) {
        deleteBlock(selectedBlockId);
      }
      // Arrow keys for navigating blocks
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && selectedBlockId && !e.metaKey && !e.ctrlKey) {
        const currentIndex = blocks.findIndex((b) => b.id === selectedBlockId);
        if (currentIndex !== -1) {
          if (e.key === 'ArrowUp' && currentIndex > 0) {
            setSelectedBlockId(blocks[currentIndex - 1].id);
          } else if (e.key === 'ArrowDown' && currentIndex < blocks.length - 1) {
            setSelectedBlockId(blocks[currentIndex + 1].id);
          }
        }
      }
      // Escape to deselect
      if (e.key === 'Escape' && selectedBlockId) {
        setSelectedBlockId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo, deleteBlock, selectedBlockId, blocks]);

  const templateTypes = [
    { value: String(EmailTemplateType.SurveyInvitation), label: t('emailTemplates.types.invitation', 'Invitation') },
    { value: String(EmailTemplateType.SurveyReminder), label: t('emailTemplates.types.reminder', 'Reminder') },
    { value: String(EmailTemplateType.ThankYou), label: t('emailTemplates.types.thankYou', 'Thank You') },
    { value: String(EmailTemplateType.Custom), label: t('emailTemplates.types.custom', 'Custom') },
  ];

  // Get selected block
  const selectedBlock = useMemo(() => {
    return blocks.find((b) => b.id === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);

  // Handle block settings change from right sidebar
  const handleBlockSettingsChange = useCallback(
    (updatedBlock: EmailBlock) => {
      if (selectedBlockId) {
        updateBlock(selectedBlockId, updatedBlock);
      }
    },
    [selectedBlockId, updateBlock]
  );

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest" role="application" aria-label={t('emailEditor.title', 'Visual Email Editor')}>
      {/* Header - M3 border styling */}
      <header className="flex items-center justify-between px-4 py-3 border-b-2 border-outline-variant/30 bg-surface shrink-0" role="banner">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="text" size="sm" onClick={onBack} aria-label={t('common.back', 'Back')}>
              <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              {t('common.back', 'Back')}
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-on-surface">{t('emailEditor.title', 'Visual Email Editor')}</h1>
            <p className="text-xs text-on-surface-variant" role="status" aria-live="polite">
              {hasChanges ? t('emailEditor.unsavedChanges', 'Unsaved changes') : t('common.saved', 'Saved')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3" role="toolbar" aria-label={t('emailEditor.toolbar', 'Editor toolbar')}>
          {/* View mode - M3 SegmentedButton */}
          <SegmentedButtonGroup value={viewMode} onChange={(v) => setViewMode(v as ViewMode)}>
            <SegmentedButton value="edit" aria-label={t('emailEditor.views.edit', 'Edit')}>
              <Layout className="h-4 w-4" />
            </SegmentedButton>
            <SegmentedButton value="preview" aria-label={t('emailEditor.views.preview', 'Preview')}>
              <Eye className="h-4 w-4" />
            </SegmentedButton>
            <SegmentedButton value="code" aria-label={t('emailEditor.views.code', 'HTML Code')}>
              <Code className="h-4 w-4" />
            </SegmentedButton>
          </SegmentedButtonGroup>

          {/* Device preview (visible in preview mode) */}
          {viewMode === 'preview' && (
            <SegmentedButtonGroup value={devicePreview} onChange={(v) => setDevicePreview(v as DevicePreview)}>
              <SegmentedButton value="desktop" aria-label={t('emailEditor.device.desktop', 'Desktop')}>
                <Monitor className="h-4 w-4" />
              </SegmentedButton>
              <SegmentedButton value="mobile" aria-label={t('emailEditor.device.mobile', 'Mobile')}>
                <Smartphone className="h-4 w-4" />
              </SegmentedButton>
            </SegmentedButtonGroup>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-outline-variant/30" aria-hidden="true" />

          {/* Undo/Redo - M3 IconButton */}
          <div className="flex items-center gap-1">
            <Tooltip content={`${t('common.undo', 'Undo')} (Ctrl+Z)`}>
              <IconButton variant="standard" size="sm" onClick={handleUndo} disabled={!canUndo} aria-label={t('common.undo', 'Undo')}>
                <Undo2 className="h-4 w-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content={`${t('common.redo', 'Redo')} (Ctrl+Shift+Z)`}>
              <IconButton variant="standard" size="sm" onClick={handleRedo} disabled={!canRedo} aria-label={t('common.redo', 'Redo')}>
                <Redo2 className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </div>

          {/* Export buttons */}
          {viewMode === 'code' && (
            <>
              <div className="w-px h-6 bg-outline-variant/30" aria-hidden="true" />
              <div className="flex items-center gap-1">
                <Tooltip content={t('emailEditor.copyHtml', 'Copy HTML')}>
                  <IconButton variant="standard" size="sm" onClick={copyHtmlToClipboard} aria-label={t('emailEditor.copyHtml', 'Copy HTML')}>
                    {copiedCode ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </IconButton>
                </Tooltip>
                <Tooltip content={t('emailEditor.downloadHtml', 'Download HTML')}>
                  <IconButton variant="standard" size="sm" onClick={downloadHtml} aria-label={t('emailEditor.downloadHtml', 'Download HTML')}>
                    <Download className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              </div>
            </>
          )}

          {/* Save button */}
          <Button onClick={handleSave} loading={updateTemplate.isPending} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {t('common.save', 'Save')}
          </Button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Block palette & Settings */}
        {viewMode === 'edit' && (
          <aside className="w-72 border-r-2 border-outline-variant/30 bg-surface flex flex-col overflow-hidden">
            {/* Sidebar tabs - M3 SegmentedButton */}
            <div className="p-3 border-b-2 border-outline-variant/30">
              <SegmentedButtonGroup
                value={activePanel}
                onChange={(v) => setActivePanel(v as 'blocks' | 'styles' | 'placeholders')}
                className="w-full"
              >
                <SegmentedButton value="blocks">
                  <Layout className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:ml-1.5">{t('emailEditor.panels.blocks', 'Blocks')}</span>
                </SegmentedButton>
                <SegmentedButton value="styles">
                  <Palette className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:ml-1.5">{t('emailEditor.panels.styles', 'Styles')}</span>
                </SegmentedButton>
                <SegmentedButton value="placeholders">
                  <Variable className="h-4 w-4" />
                </SegmentedButton>
              </SegmentedButtonGroup>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activePanel === 'blocks' && <BlockPalette onAddBlock={addBlock} />}

              {activePanel === 'styles' && <GlobalStylesPanel styles={globalStyles} onChange={setGlobalStyles} />}

              {activePanel === 'placeholders' && <PlaceholdersPanel />}
            </div>
          </aside>
        )}

        {/* Center - Canvas / Preview / Code */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Template metadata bar - M3 border */}
          <div className="px-5 py-3 border-b-2 border-outline-variant/30 bg-surface shrink-0">
            <div className="flex items-end gap-4">
              {/* Template name */}
              <div className="w-64 shrink-0">
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">
                  {t('emailEditor.templateNameLabel', 'Template Name')}
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('emailEditor.templateName', 'Enter template name...')}
                  size="sm"
                />
              </div>

              {/* Template type */}
              <div className="w-40 shrink-0">
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">{t('emailEditor.typeLabel', 'Type')}</label>
                <Select value={String(type)} onChange={(value) => setType(parseInt(value) as EmailTemplateType)} options={templateTypes} size="sm" />
              </div>

              {/* Subject line */}
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {t('emailEditor.subjectLabel', 'Subject Line')}
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('emailEditor.subjectPlaceholder', 'e.g., {{survey.title}} - We need your feedback')}
                  size="sm"
                />
              </div>

              {/* Preheader toggle */}
              <div className="shrink-0 pb-1">
                <Tooltip content={t('emailEditor.preheaderTooltip', 'Preview text shown in inbox before opening the email')}>
                  <button
                    onClick={() => {
                      const newValue = !preheaderEnabled;
                      setPreheaderEnabled(newValue);
                      if (!newValue) setPreheader('');
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      preheaderEnabled ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    <Info className="h-3.5 w-3.5" />
                    {t('emailEditor.preheaderLabel', 'Preheader')}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Preheader input - shows when enabled */}
            {preheaderEnabled && (
              <div className="mt-3">
                <Input
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder={t('emailEditor.preheaderPlaceholder', 'Preview text shown in inbox before opening the email...')}
                  size="sm"
                  startIcon={<span className="text-xs text-on-surface-variant">✉️</span>}
                />
              </div>
            )}
          </div>

          {/* Canvas area */}
          <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: globalStyles.backgroundColor }}>
            {viewMode === 'edit' && (
              <div ref={canvasRef} className="max-w-2xl mx-auto min-h-full" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                {/* M3 Card wrapper for email canvas */}
                <Card
                  variant="outlined"
                  padding="none"
                  className="overflow-hidden"
                  style={{
                    backgroundColor: globalStyles.contentBackgroundColor,
                    maxWidth: globalStyles.contentWidth,
                    margin: '0 auto',
                    borderRadius: globalStyles.borderRadius,
                  }}
                >
                  {blocks.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-on-surface-variant">{t('emailEditor.emptyCanvas', 'Drag blocks here or click to add')}</p>
                      <Button variant="tonal" size="sm" className="mt-4" onClick={() => addBlock('text')}>
                        {t('emailEditor.addFirstBlock', 'Add your first block')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {blocks.map((block, index) => (
                        <BlockEditor
                          key={block.id}
                          block={block}
                          globalStyles={globalStyles}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => {
                            setSelectedBlockId(block.id);
                            if (!showRightSidebar) setShowRightSidebar(true);
                          }}
                          onChange={(updated) => updateBlock(block.id, updated)}
                          onDelete={() => deleteBlock(block.id)}
                          onDuplicate={() => duplicateBlock(block.id)}
                          onMoveUp={() => moveBlock(block.id, 'up')}
                          onMoveDown={() => moveBlock(block.id, 'down')}
                          onReorder={reorderBlock}
                          canMoveUp={index > 0}
                          canMoveDown={index < blocks.length - 1}
                          onOpenSettings={() => setShowRightSidebar(true)}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {viewMode === 'preview' && (
              <div className="flex flex-col items-center gap-4">
                {/* Preview options bar - M3 Card */}
                <Card variant="filled" padding="sm" className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={previewWithSampleData} onChange={(e) => setPreviewWithSampleData(e.target.checked)} size="sm" />
                    <span className="text-sm text-on-surface-variant">{t('emailEditor.previewWithSampleData', 'Preview with sample data')}</span>
                  </div>
                  <Tooltip content={t('emailEditor.sampleDataInfo', 'Replaces placeholders like {{firstName}} with sample values')}>
                    <Info className="h-4 w-4 text-on-surface-variant cursor-help" />
                  </Tooltip>
                </Card>

                {/* Email preview - M3 Card */}
                <Card
                  variant="outlined"
                  padding="none"
                  className={cn('transition-all duration-300 overflow-hidden bg-white', devicePreview === 'mobile' ? 'w-96' : 'w-full max-w-2xl')}
                >
                  <iframe
                    srcDoc={replacePlaceholders(generatedHtml, previewWithSampleData)}
                    title={t('emailEditor.previewTitle')}
                    className="w-full border-0"
                    style={{ height: devicePreview === 'mobile' ? '667px' : '800px' }}
                  />
                </Card>
              </div>
            )}

            {viewMode === 'code' && (
              <div className="max-w-4xl mx-auto">
                <Card variant="outlined" padding="none" className="overflow-hidden">
                  <div className="p-3 bg-surface-container/50 border-b-2 border-outline-variant/30 flex items-center justify-between">
                    <span className="text-sm font-medium text-on-surface">
                      {t('emailEditor.generatedHtml', 'Generated HTML (Outlook Compatible)')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" variant="assist">
                        {Math.round(generatedHtml.length / 1024)} KB
                      </Chip>
                    </div>
                  </div>
                  <pre className="p-4 overflow-auto max-h-150 text-xs font-mono text-on-surface-variant whitespace-pre-wrap bg-surface-container-lowest">
                    {generatedHtml}
                  </pre>
                </Card>
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar - Block Settings */}
        {viewMode === 'edit' && (
          <aside
            className={cn(
              'border-l-2 border-outline-variant/30 bg-surface flex flex-col overflow-hidden transition-all duration-300',
              showRightSidebar ? 'w-80' : 'w-0'
            )}
          >
            {showRightSidebar && (
              <BlockSettingsPanel block={selectedBlock} onChange={handleBlockSettingsChange} onClose={() => setSelectedBlockId(null)} />
            )}
          </aside>
        )}

        {/* Right sidebar toggle button (floating) - M3 IconButton */}
        {viewMode === 'edit' && (
          <Tooltip
            content={showRightSidebar ? t('emailEditor.hideSettings', 'Hide settings panel') : t('emailEditor.showSettings', 'Show settings panel')}
          >
            <IconButton
              variant="filled-tonal"
              size="default"
              className="absolute top-1/2 -translate-y-1/2 z-20 ring-2 ring-primary/20"
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              style={{ right: showRightSidebar ? '336px' : '16px' }}
              aria-label={
                showRightSidebar ? t('emailEditor.hideSettings', 'Hide settings panel') : t('emailEditor.showSettings', 'Show settings panel')
              }
            >
              {showRightSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// Global styles panel component - M3 Expressive design
function GlobalStylesPanel({ styles, onChange }: { styles: EmailGlobalStyles; onChange: (styles: EmailGlobalStyles) => void }) {
  const { t } = useTranslation();

  const updateStyle = (key: keyof EmailGlobalStyles, value: string | number) => {
    onChange({ ...styles, [key]: value });
  };

  const fontOptions = [
    { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, Times, serif', label: 'Times New Roman' },
    { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
    { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma' },
    { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  ];

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-on-surface">{t('emailEditor.globalStyles', 'Global Styles')}</h3>

      {/* Colors Section */}
      <Card variant="outlined" padding="default" className="space-y-4">
        <h4 className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{t('emailEditor.styles.colors', 'Colors')}</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-on-surface">{t('emailEditor.styles.backgroundColor', 'Page Background')}</label>
            <ColorPicker value={styles.backgroundColor} onChange={(color) => updateStyle('backgroundColor', color)} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-on-surface">{t('emailEditor.styles.contentBackground', 'Content Background')}</label>
            <ColorPicker value={styles.contentBackgroundColor} onChange={(color) => updateStyle('contentBackgroundColor', color)} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-on-surface">{t('emailEditor.styles.textColor', 'Text Color')}</label>
            <ColorPicker value={styles.textColor} onChange={(color) => updateStyle('textColor', color)} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-on-surface">{t('emailEditor.styles.linkColor', 'Link Color')}</label>
            <ColorPicker value={styles.linkColor} onChange={(color) => updateStyle('linkColor', color)} size="sm" />
          </div>
        </div>
      </Card>

      {/* Typography Section */}
      <Card variant="outlined" padding="default" className="space-y-4">
        <h4 className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{t('emailEditor.styles.typography', 'Typography')}</h4>

        <Select
          label={t('emailEditor.styles.fontFamily', 'Font Family')}
          value={styles.fontFamily}
          onChange={(value) => updateStyle('fontFamily', value)}
          options={fontOptions}
          size="sm"
        />
      </Card>

      {/* Layout Section */}
      <Card variant="outlined" padding="default" className="space-y-4">
        <h4 className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{t('emailEditor.styles.layout', 'Layout')}</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-on-surface">{t('emailEditor.styles.contentWidth', 'Content Width')}</label>
            <NumberStepper
              value={styles.contentWidth}
              onChange={(value) => updateStyle('contentWidth', value)}
              min={400}
              max={800}
              step={10}
              suffix="px"
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-on-surface">{t('emailEditor.styles.borderRadius', 'Border Radius')}</label>
            <NumberStepper
              value={styles.borderRadius || 0}
              onChange={(value) => updateStyle('borderRadius', value)}
              min={0}
              max={24}
              step={2}
              suffix="px"
              size="sm"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

// Placeholders panel component - M3 Expressive design
function PlaceholdersPanel() {
  const { t } = useTranslation();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { copy } = useCopyToClipboard();

  const copyPlaceholder = (key: string) => {
    copy(key, { successMessage: t('emailEditor.placeholderCopied', { key, defaultValue: `Copied ${key}` }) });
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-on-surface">{t('emailEditor.placeholders', 'Placeholders')}</h3>
        <p className="text-xs text-on-surface-variant mt-1">{t('emailEditor.placeholdersHelp', 'Click to copy, then paste into text blocks')}</p>
      </div>
      <div className="space-y-2">
        {emailPlaceholders.map(({ key, label, description }) => (
          <Card
            key={key}
            variant="outlined"
            padding="sm"
            className={cn(
              'cursor-pointer transition-all duration-200',
              'hover:border-primary/50 hover:bg-primary-container/20',
              copiedKey === key && 'border-success bg-success-container/30'
            )}
            onClick={() => copyPlaceholder(key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyPlaceholder(key);
              }
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-on-surface truncate">{label}</p>
                <p className="text-xs text-on-surface-variant truncate">{description}</p>
              </div>
              <code className="text-xs font-mono bg-surface-container px-2 py-1 rounded-lg shrink-0">
                {copiedKey === key ? <Check className="h-3 w-3 text-success" /> : key}
              </code>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
