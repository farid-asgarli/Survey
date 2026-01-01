// Block Settings Panel - Right sidebar for editing block properties
// M3 Expressive Design: Uses proper UI components, no native elements
import { useTranslation } from 'react-i18next';
import {
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Unlink,
  Type,
  Image,
  MousePointer2,
  Minus,
  Space,
  Columns,
  Share2,
  FileText,
  LayoutTemplate,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  IconButton,
  Card,
  ColorPicker,
  NumberStepper,
  SegmentedButtonGroup,
  SegmentedButton,
} from '@/components/ui';
import type {
  EmailBlock,
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  SpacerBlock,
  ColumnsBlock,
  SocialBlock,
  FooterBlock,
  SocialLink,
} from './types';

interface BlockSettingsPanelProps {
  block: EmailBlock | null;
  onChange: (block: EmailBlock) => void;
  onClose: () => void;
}

// Settings section component - consistent styling for all sections
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );
}

// Section divider
function SectionDivider() {
  return <div className="h-px bg-outline-variant/30 my-4" />;
}

// Settings field wrapper for consistent label/control layout
interface SettingsFieldProps {
  label: string;
  children: React.ReactNode;
  inline?: boolean;
  className?: string;
}

function SettingsField({ label, children, inline = false, className }: SettingsFieldProps) {
  if (inline) {
    return (
      <div className={cn('flex items-center justify-between gap-3', className)}>
        <span className="text-xs text-on-surface-variant">{label}</span>
        {children}
      </div>
    );
  }
  return (
    <div className={cn('space-y-1.5', className)}>
      <span className="text-xs text-on-surface-variant block">{label}</span>
      {children}
    </div>
  );
}

// M3 Alignment selector using SegmentedButton
function AlignmentSelector({ value, onChange }: { value: 'left' | 'center' | 'right'; onChange: (value: 'left' | 'center' | 'right') => void }) {
  return (
    <SegmentedButtonGroup value={value} onChange={onChange} size="sm">
      <SegmentedButton value="left" icon={<AlignLeft className="h-4 w-4" />} aria-label="Align left" />
      <SegmentedButton value="center" icon={<AlignCenter className="h-4 w-4" />} aria-label="Align center" />
      <SegmentedButton value="right" icon={<AlignRight className="h-4 w-4" />} aria-label="Align right" />
    </SegmentedButtonGroup>
  );
}

// Get icon for block type
function getBlockIcon(type: EmailBlock['type']) {
  const icons = {
    header: <LayoutTemplate className="h-4 w-4" />,
    text: <Type className="h-4 w-4" />,
    image: <Image className="h-4 w-4" />,
    button: <MousePointer2 className="h-4 w-4" />,
    divider: <Minus className="h-4 w-4" />,
    spacer: <Space className="h-4 w-4" />,
    columns: <Columns className="h-4 w-4" />,
    social: <Share2 className="h-4 w-4" />,
    footer: <FileText className="h-4 w-4" />,
  };
  return icons[type];
}

// Header block settings
function HeaderBlockSettings({ block, onChange }: { block: HeaderBlock; onChange: (block: HeaderBlock) => void }) {
  const { t } = useTranslation();
  const updateContent = (updates: Partial<HeaderBlock['content']>) => {
    onChange({ ...block, content: { ...block.content, ...updates } });
  };

  return (
    <div className="space-y-4">
      <SettingsSection title={t('emailEditor.settings.logo', 'Logo')}>
        <Input
          label={t('emailEditor.settings.logoUrl', 'Logo URL')}
          value={block.content.logoUrl || ''}
          onChange={(e) => updateContent({ logoUrl: e.target.value })}
          placeholder="https://..."
          size="sm"
        />
        <SettingsField label={t('emailEditor.settings.logoWidth', 'Logo Width')} inline>
          <NumberStepper
            value={block.content.logoWidth || 150}
            onChange={(value) => updateContent({ logoWidth: value })}
            min={50}
            max={400}
            suffix="px"
            size="sm"
          />
        </SettingsField>
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.content', 'Content')}>
        <Input
          label={t('emailEditor.settings.title', 'Title')}
          value={block.content.title || ''}
          onChange={(e) => updateContent({ title: e.target.value })}
          size="sm"
        />
        <Input
          label={t('emailEditor.settings.subtitle', 'Subtitle')}
          value={block.content.subtitle || ''}
          onChange={(e) => updateContent({ subtitle: e.target.value })}
          size="sm"
        />
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.style', 'Style')}>
        <SettingsField label={t('emailEditor.settings.alignment', 'Alignment')} inline>
          <AlignmentSelector value={block.content.alignment || 'center'} onChange={(alignment) => updateContent({ alignment })} />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.backgroundColor', 'Background')} inline>
          <ColorPicker
            value={block.content.backgroundColor || '#ffffff'}
            onChange={(backgroundColor) => updateContent({ backgroundColor })}
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.textColor', 'Text Color')} inline>
          <ColorPicker value={block.content.textColor || '#333333'} onChange={(textColor) => updateContent({ textColor })} size="sm" />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.padding', 'Padding')} inline>
          <NumberStepper
            value={block.content.padding || 20}
            onChange={(padding) => updateContent({ padding })}
            min={0}
            max={100}
            suffix="px"
            size="sm"
          />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}

// Text block settings
function TextBlockSettings({ block, onChange }: { block: TextBlock; onChange: (block: TextBlock) => void }) {
  const { t } = useTranslation();
  const updateContent = (updates: Partial<TextBlock['content']>) => {
    onChange({ ...block, content: { ...block.content, ...updates } });
  };

  return (
    <div className="space-y-4">
      <SettingsSection title={t('emailEditor.settings.content', 'Content')}>
        <SettingsField label={t('emailEditor.settings.htmlContent', 'HTML Content')}>
          <Textarea value={block.content.html} onChange={(e) => updateContent({ html: e.target.value })} rows={5} className="font-mono text-xs" />
          <p className="text-xs text-on-surface-variant">{t('emailEditor.settings.htmlSupport', 'Supports: <p>, <strong>, <em>, <a>, <ul>, <ol>')}</p>
        </SettingsField>
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.typography', 'Typography')}>
        <SettingsField label={t('emailEditor.settings.alignment', 'Alignment')} inline>
          <AlignmentSelector value={block.content.alignment || 'left'} onChange={(alignment) => updateContent({ alignment })} />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.fontSize', 'Font Size')} inline>
          <NumberStepper
            value={block.content.fontSize || 16}
            onChange={(fontSize) => updateContent({ fontSize })}
            min={10}
            max={48}
            suffix="px"
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.lineHeight', 'Line Height')} inline>
          <NumberStepper
            value={block.content.lineHeight || 1.5}
            onChange={(lineHeight) => updateContent({ lineHeight })}
            min={1}
            max={3}
            step={0.1}
            size="sm"
          />
        </SettingsField>
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.colors', 'Colors')}>
        <SettingsField label={t('emailEditor.settings.textColor', 'Text Color')} inline>
          <ColorPicker value={block.content.textColor || '#333333'} onChange={(textColor) => updateContent({ textColor })} size="sm" />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.backgroundColor', 'Background')} inline>
          <ColorPicker
            value={block.content.backgroundColor || '#ffffff'}
            onChange={(backgroundColor) => updateContent({ backgroundColor })}
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.padding', 'Padding')} inline>
          <NumberStepper
            value={block.content.padding || 20}
            onChange={(padding) => updateContent({ padding })}
            min={0}
            max={100}
            suffix="px"
            size="sm"
          />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}

// Image block settings
function ImageBlockSettings({ block, onChange }: { block: ImageBlock; onChange: (block: ImageBlock) => void }) {
  const { t } = useTranslation();
  const updateContent = (updates: Partial<ImageBlock['content']>) => {
    onChange({ ...block, content: { ...block.content, ...updates } });
  };

  return (
    <div className="space-y-4">
      <SettingsSection title={t('emailEditor.settings.image', 'Image')}>
        <Input
          label={t('emailEditor.settings.imageUrl', 'Image URL')}
          value={block.content.src}
          onChange={(e) => updateContent({ src: e.target.value })}
          placeholder="https://..."
          size="sm"
        />
        <Input
          label={t('emailEditor.settings.altText', 'Alt Text')}
          value={block.content.alt}
          onChange={(e) => updateContent({ alt: e.target.value })}
          size="sm"
        />
        <Input
          label={t('emailEditor.settings.linkUrl', 'Link URL (optional)')}
          value={block.content.linkUrl || ''}
          onChange={(e) => updateContent({ linkUrl: e.target.value })}
          placeholder="https://..."
          size="sm"
          startIcon={block.content.linkUrl ? <Link className="h-3.5 w-3.5" /> : <Unlink className="h-3.5 w-3.5" />}
        />
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.layout', 'Layout')}>
        <SettingsField label={t('emailEditor.settings.width', 'Width')} inline>
          <NumberStepper
            value={block.content.width || 560}
            onChange={(width) => updateContent({ width })}
            min={100}
            max={600}
            suffix="px"
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.alignment', 'Alignment')} inline>
          <AlignmentSelector value={block.content.alignment || 'center'} onChange={(alignment) => updateContent({ alignment })} />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.borderRadius', 'Border Radius')} inline>
          <NumberStepper
            value={block.content.borderRadius || 0}
            onChange={(borderRadius) => updateContent({ borderRadius })}
            min={0}
            max={50}
            suffix="px"
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.padding', 'Padding')} inline>
          <NumberStepper
            value={block.content.padding || 10}
            onChange={(padding) => updateContent({ padding })}
            min={0}
            max={100}
            suffix="px"
            size="sm"
          />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}

// Button block settings
function ButtonBlockSettings({ block, onChange }: { block: ButtonBlock; onChange: (block: ButtonBlock) => void }) {
  const { t } = useTranslation();
  const updateContent = (updates: Partial<ButtonBlock['content']>) => {
    onChange({ ...block, content: { ...block.content, ...updates } });
  };

  return (
    <div className="space-y-4">
      <SettingsSection title={t('emailEditor.settings.button', 'Button')}>
        <Input
          label={t('emailEditor.settings.buttonText', 'Button Text')}
          value={block.content.text}
          onChange={(e) => updateContent({ text: e.target.value })}
          size="sm"
        />
        <Input
          label={t('emailEditor.settings.url', 'URL')}
          value={block.content.url}
          onChange={(e) => updateContent({ url: e.target.value })}
          placeholder="{{surveyLink}}"
          size="sm"
        />
        <Checkbox
          id="fullWidth"
          label={t('emailEditor.settings.fullWidth', 'Full Width')}
          checked={block.content.fullWidth || false}
          onChange={(e) => updateContent({ fullWidth: e.target.checked })}
        />
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.style', 'Style')}>
        <SettingsField label={t('emailEditor.settings.alignment', 'Alignment')} inline>
          <AlignmentSelector value={block.content.alignment || 'center'} onChange={(alignment) => updateContent({ alignment })} />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.buttonColor', 'Button Color')} inline>
          <ColorPicker
            value={block.content.backgroundColor || '#0066cc'}
            onChange={(backgroundColor) => updateContent({ backgroundColor })}
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.textColor', 'Text Color')} inline>
          <ColorPicker value={block.content.textColor || '#ffffff'} onChange={(textColor) => updateContent({ textColor })} size="sm" />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.fontSize', 'Font Size')} inline>
          <NumberStepper
            value={block.content.fontSize || 16}
            onChange={(fontSize) => updateContent({ fontSize })}
            min={12}
            max={24}
            suffix="px"
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.borderRadius', 'Border Radius')} inline>
          <NumberStepper
            value={block.content.borderRadius || 4}
            onChange={(borderRadius) => updateContent({ borderRadius })}
            min={0}
            max={50}
            suffix="px"
            size="sm"
          />
        </SettingsField>
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.padding', 'Padding')}>
        <div className="grid grid-cols-2 gap-3">
          <SettingsField label={t('emailEditor.settings.vertical', 'Vertical')}>
            <NumberStepper
              value={block.content.padding?.vertical || 12}
              onChange={(vertical) =>
                updateContent({
                  padding: {
                    ...block.content.padding,
                    vertical,
                    horizontal: block.content.padding?.horizontal || 24,
                  },
                })
              }
              min={4}
              max={40}
              suffix="px"
              size="sm"
            />
          </SettingsField>
          <SettingsField label={t('emailEditor.settings.horizontal', 'Horizontal')}>
            <NumberStepper
              value={block.content.padding?.horizontal || 24}
              onChange={(horizontal) =>
                updateContent({
                  padding: {
                    ...block.content.padding,
                    horizontal,
                    vertical: block.content.padding?.vertical || 12,
                  },
                })
              }
              min={8}
              max={60}
              suffix="px"
              size="sm"
            />
          </SettingsField>
        </div>
      </SettingsSection>
    </div>
  );
}

// Divider block settings
function DividerBlockSettings({ block, onChange }: { block: DividerBlock; onChange: (block: DividerBlock) => void }) {
  const { t } = useTranslation();
  const updateContent = (updates: Partial<DividerBlock['content']>) => {
    onChange({ ...block, content: { ...block.content, ...updates } });
  };

  return (
    <div className="space-y-4">
      <SettingsSection title={t('emailEditor.settings.divider', 'Divider')}>
        <SettingsField label={t('emailEditor.settings.color', 'Color')} inline>
          <ColorPicker value={block.content.color || '#dddddd'} onChange={(color) => updateContent({ color })} size="sm" />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.thickness', 'Thickness')} inline>
          <NumberStepper
            value={block.content.thickness || 1}
            onChange={(thickness) => updateContent({ thickness })}
            min={1}
            max={10}
            suffix="px"
            size="sm"
          />
        </SettingsField>
        <Select
          label={t('emailEditor.settings.style', 'Style')}
          value={block.content.style || 'solid'}
          onChange={(style) => updateContent({ style: style as 'solid' | 'dashed' | 'dotted' })}
          options={[
            { value: 'solid', label: t('emailEditor.dividerStyles.solid', 'Solid') },
            { value: 'dashed', label: t('emailEditor.dividerStyles.dashed', 'Dashed') },
            { value: 'dotted', label: t('emailEditor.dividerStyles.dotted', 'Dotted') },
          ]}
        />
        <Input
          label={t('emailEditor.settings.width', 'Width')}
          value={block.content.width || '100%'}
          onChange={(e) => updateContent({ width: e.target.value })}
          placeholder="100% or 400px"
          size="sm"
        />
        <SettingsField label={t('emailEditor.settings.padding', 'Padding')} inline>
          <NumberStepper
            value={block.content.padding || 20}
            onChange={(padding) => updateContent({ padding })}
            min={0}
            max={100}
            suffix="px"
            size="sm"
          />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}

// Spacer block settings
function SpacerBlockSettings({ block, onChange }: { block: SpacerBlock; onChange: (block: SpacerBlock) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <SettingsSection title={t('emailEditor.settings.spacer', 'Spacer')}>
        <SettingsField label={t('emailEditor.settings.height', 'Height')} inline>
          <NumberStepper
            value={block.content.height || 20}
            onChange={(height) => onChange({ ...block, content: { height } })}
            min={5}
            max={200}
            suffix="px"
            size="sm"
          />
        </SettingsField>
      </SettingsSection>

      {/* Visual preview of spacer height */}
      <Card variant="outlined" padding="sm" className="mt-4">
        <div className="text-xs text-on-surface-variant text-center mb-2">{t('emailEditor.settings.preview', 'Preview')}</div>
        <div className="bg-primary/10 rounded-xl flex items-center justify-center" style={{ height: block.content.height || 20 }}>
          <span className="text-xs text-primary font-medium">{block.content.height || 20}px</span>
        </div>
      </Card>
    </div>
  );
}

// Columns block settings
function ColumnsBlockSettings({ block, onChange }: { block: ColumnsBlock; onChange: (block: ColumnsBlock) => void }) {
  const { t } = useTranslation();
  const updateContent = (updates: Partial<ColumnsBlock['content']>) => {
    onChange({ ...block, content: { ...block.content, ...updates } });
  };

  const addColumn = () => {
    const newColumn = {
      id: `col-${Date.now()}`,
      blocks: [],
      width: Math.floor(100 / (block.content.columns.length + 1)),
    };
    const newColumns = [...block.content.columns, newColumn].map((col, _, arr) => ({
      ...col,
      width: Math.floor(100 / arr.length),
    }));
    updateContent({ columns: newColumns });
  };

  const removeColumn = (index: number) => {
    if (block.content.columns.length <= 1) return;
    const newColumns = block.content.columns
      .filter((_, i) => i !== index)
      .map((col, _, arr) => ({
        ...col,
        width: Math.floor(100 / arr.length),
      }));
    updateContent({ columns: newColumns });
  };

  const updateColumnWidth = (index: number, width: number) => {
    const newColumns = [...block.content.columns];
    newColumns[index] = { ...newColumns[index], width };
    updateContent({ columns: newColumns });
  };

  return (
    <div className="space-y-4">
      <SettingsSection title={t('emailEditor.settings.columns', 'Columns')}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-on-surface-variant">
            {block.content.columns.length} {t('emailEditor.columns', 'columns')}
          </span>
          <Button variant="tonal" size="sm" onClick={addColumn} disabled={block.content.columns.length >= 4}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t('common.add', 'Add')}
          </Button>
        </div>

        <div className="space-y-2">
          {block.content.columns.map((column, index) => (
            <Card key={column.id} variant="filled" padding="sm" className="flex items-center gap-3">
              <span className="text-xs text-on-surface-variant font-medium w-6">#{index + 1}</span>
              <NumberStepper
                value={column.width || Math.floor(100 / block.content.columns.length)}
                onChange={(value) => updateColumnWidth(index, value)}
                min={10}
                max={90}
                suffix="%"
                size="sm"
                className="flex-1"
              />
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => removeColumn(index)}
                disabled={block.content.columns.length <= 1}
                aria-label={t('common.delete', 'Delete')}
              >
                <X className="h-4 w-4" />
              </IconButton>
            </Card>
          ))}
        </div>
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.layout', 'Layout')}>
        <SettingsField label={t('emailEditor.settings.gap', 'Gap')} inline>
          <NumberStepper value={block.content.gap || 20} onChange={(gap) => updateContent({ gap })} min={0} max={60} suffix="px" size="sm" />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.backgroundColor', 'Background')} inline>
          <ColorPicker
            value={block.content.backgroundColor || '#ffffff'}
            onChange={(backgroundColor) => updateContent({ backgroundColor })}
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.padding', 'Padding')} inline>
          <NumberStepper
            value={block.content.padding || 20}
            onChange={(padding) => updateContent({ padding })}
            min={0}
            max={100}
            suffix="px"
            size="sm"
          />
        </SettingsField>
        <Checkbox
          id="stackOnMobile"
          label={t('emailEditor.settings.stackOnMobile', 'Stack on mobile')}
          checked={block.content.stackOnMobile !== false}
          onChange={(e) => updateContent({ stackOnMobile: e.target.checked })}
        />
      </SettingsSection>
    </div>
  );
}

// Social block settings
function SocialBlockSettings({ block, onChange }: { block: SocialBlock; onChange: (block: SocialBlock) => void }) {
  const { t } = useTranslation();
  const updateContent = (updates: Partial<SocialBlock['content']>) => {
    onChange({ ...block, content: { ...block.content, ...updates } });
  };

  const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'] as const;

  const addLink = (platform: SocialLink['platform']) => {
    const newLinks = [...(block.content.links || []), { platform, url: '' }];
    updateContent({ links: newLinks });
  };

  const updateLink = (index: number, url: string) => {
    const newLinks = [...(block.content.links || [])];
    newLinks[index] = { ...newLinks[index], url };
    updateContent({ links: newLinks });
  };

  const removeLink = (index: number) => {
    const newLinks = (block.content.links || []).filter((_, i) => i !== index);
    updateContent({ links: newLinks });
  };

  const availablePlatforms = platforms.filter((p) => !(block.content.links || []).some((l) => l.platform === p));

  return (
    <div className="space-y-4">
      <SettingsSection title={t('emailEditor.settings.socialLinks', 'Social Links')}>
        <div className="space-y-2">
          {(block.content.links || []).map((link, index) => (
            <Card key={index} variant="filled" padding="sm" className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium capitalize text-on-surface">{link.platform}</span>
                <IconButton variant="ghost" size="sm" onClick={() => removeLink(index)} aria-label={t('common.delete', 'Delete')}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
              <Input
                value={link.url}
                onChange={(e) => updateLink(index, e.target.value)}
                placeholder={`https://${link.platform}.com/...`}
                size="sm"
              />
            </Card>
          ))}
        </div>

        {availablePlatforms.length > 0 && (
          <Select
            value=""
            onChange={(platform) => {
              if (platform) addLink(platform as SocialLink['platform']);
            }}
            options={[
              { value: '', label: t('emailEditor.settings.addPlatform', 'Add platform...') },
              ...availablePlatforms.map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
              })),
            ]}
          />
        )}
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.style', 'Style')}>
        <SettingsField label={t('emailEditor.settings.alignment', 'Alignment')} inline>
          <AlignmentSelector value={block.content.alignment || 'center'} onChange={(alignment) => updateContent({ alignment })} />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.iconSize', 'Icon Size')} inline>
          <NumberStepper
            value={block.content.iconSize || 32}
            onChange={(iconSize) => updateContent({ iconSize })}
            min={20}
            max={64}
            suffix="px"
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.gap', 'Gap')} inline>
          <NumberStepper value={block.content.gap || 10} onChange={(gap) => updateContent({ gap })} min={0} max={40} suffix="px" size="sm" />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}

// Footer block settings
function FooterBlockSettings({ block, onChange }: { block: FooterBlock; onChange: (block: FooterBlock) => void }) {
  const { t } = useTranslation();
  const updateContent = (updates: Partial<FooterBlock['content']>) => {
    onChange({ ...block, content: { ...block.content, ...updates } });
  };

  return (
    <div className="space-y-4">
      <SettingsSection title={t('emailEditor.settings.companyInfo', 'Company Info')}>
        <Input
          label={t('emailEditor.settings.companyName', 'Company Name')}
          value={block.content.companyName || ''}
          onChange={(e) => updateContent({ companyName: e.target.value })}
          placeholder="{{companyName}}"
          size="sm"
        />
        <SettingsField label={t('emailEditor.settings.address', 'Address')}>
          <Textarea
            value={block.content.address || ''}
            onChange={(e) => updateContent({ address: e.target.value })}
            rows={2}
            placeholder={t('emailEditor.settings.addressPlaceholder', 'Company address...')}
          />
        </SettingsField>
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.unsubscribe', 'Unsubscribe')}>
        <Input
          label={t('emailEditor.settings.unsubscribeText', 'Link Text')}
          value={block.content.unsubscribeText || ''}
          onChange={(e) => updateContent({ unsubscribeText: e.target.value })}
          size="sm"
        />
        <Input
          label={t('emailEditor.settings.unsubscribeUrl', 'URL')}
          value={block.content.unsubscribeUrl || ''}
          onChange={(e) => updateContent({ unsubscribeUrl: e.target.value })}
          placeholder="{{unsubscribeLink}}"
          size="sm"
        />
      </SettingsSection>

      <SectionDivider />

      <SettingsSection title={t('emailEditor.settings.style', 'Style')}>
        <SettingsField label={t('emailEditor.settings.backgroundColor', 'Background')} inline>
          <ColorPicker
            value={block.content.backgroundColor || '#f4f4f4'}
            onChange={(backgroundColor) => updateContent({ backgroundColor })}
            size="sm"
          />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.textColor', 'Text Color')} inline>
          <ColorPicker value={block.content.textColor || '#666666'} onChange={(textColor) => updateContent({ textColor })} size="sm" />
        </SettingsField>
        <SettingsField label={t('emailEditor.settings.fontSize', 'Font Size')} inline>
          <NumberStepper
            value={block.content.fontSize || 12}
            onChange={(fontSize) => updateContent({ fontSize })}
            min={10}
            max={18}
            suffix="px"
            size="sm"
          />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}

// Main Block Settings Panel component
export function BlockSettingsPanel({ block, onChange, onClose }: BlockSettingsPanelProps) {
  const { t } = useTranslation();

  if (!block) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <Card variant="filled" className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
          <MousePointer2 className="h-7 w-7 text-on-surface-variant" />
        </Card>
        <h3 className="text-sm font-medium text-on-surface mb-1">{t('emailEditor.noBlockSelected', 'No block selected')}</h3>
        <p className="text-xs text-on-surface-variant max-w-50">
          {t('emailEditor.selectBlockHint', 'Select a block in the canvas to edit its properties')}
        </p>
      </div>
    );
  }

  const renderSettings = () => {
    switch (block.type) {
      case 'header':
        return <HeaderBlockSettings block={block} onChange={onChange} />;
      case 'text':
        return <TextBlockSettings block={block} onChange={onChange} />;
      case 'image':
        return <ImageBlockSettings block={block} onChange={onChange} />;
      case 'button':
        return <ButtonBlockSettings block={block} onChange={onChange} />;
      case 'divider':
        return <DividerBlockSettings block={block} onChange={onChange} />;
      case 'spacer':
        return <SpacerBlockSettings block={block} onChange={onChange} />;
      case 'social':
        return <SocialBlockSettings block={block} onChange={onChange} />;
      case 'footer':
        return <FooterBlockSettings block={block} onChange={onChange} />;
      case 'columns':
        return <ColumnsBlockSettings block={block} onChange={onChange} />;
      default:
        return null;
    }
  };

  const blockTypeLabel = {
    header: t('emailEditor.blocks.header', 'Header'),
    text: t('emailEditor.blocks.text', 'Text'),
    image: t('emailEditor.blocks.image', 'Image'),
    button: t('emailEditor.blocks.button', 'Button'),
    divider: t('emailEditor.blocks.divider', 'Divider'),
    spacer: t('emailEditor.blocks.spacer', 'Spacer'),
    columns: t('emailEditor.blocks.columns', 'Columns'),
    social: t('emailEditor.blocks.social', 'Social'),
    footer: t('emailEditor.blocks.footer', 'Footer'),
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-container/50 shrink-0">
        <div className="flex items-center gap-3">
          <Card variant="highlighted" className="w-10 h-10 rounded-xl flex items-center justify-center">
            {getBlockIcon(block.type)}
          </Card>
          <div>
            <h4 className="text-sm font-semibold text-on-surface">{blockTypeLabel[block.type]}</h4>
            <p className="text-xs text-on-surface-variant">{t('emailEditor.blockSettings', 'Block Settings')}</p>
          </div>
        </div>
        <IconButton variant="standard" size="sm" onClick={onClose} aria-label={t('common.close', 'Close')}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto p-4">{renderSettings()}</div>
    </div>
  );
}
