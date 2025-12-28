// Block Settings Panel - Right sidebar for editing block properties
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input, Textarea, Select } from '@/components/ui';
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

// Color input component
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-on-surface-variant flex-1">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-outline-variant cursor-pointer"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="w-24 text-xs font-mono" size="sm" />
      </div>
    </div>
  );
}

// Alignment selector
function AlignmentSelector({ value, onChange }: { value: 'left' | 'center' | 'right'; onChange: (value: 'left' | 'center' | 'right') => void }) {
  return (
    <div className="flex items-center gap-1 bg-surface-container rounded-lg p-0.5">
      {[
        { value: 'left' as const, icon: AlignLeft },
        { value: 'center' as const, icon: AlignCenter },
        { value: 'right' as const, icon: AlignRight },
      ].map(({ value: alignValue, icon: Icon }) => (
        <button
          key={alignValue}
          onClick={() => onChange(alignValue)}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            value === alignValue ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

// Number input with label
function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  suffix = '',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-on-surface-variant flex-1">{label}</label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-20 text-xs"
          size="sm"
        />
        {suffix && <span className="text-xs text-on-surface-variant">{suffix}</span>}
      </div>
    </div>
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
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.logo', 'Logo')}</h4>
        <Input
          label={t('emailEditor.settings.logoUrl', 'Logo URL')}
          value={block.content.logoUrl || ''}
          onChange={(e) => updateContent({ logoUrl: e.target.value })}
          placeholder="https://..."
          size="sm"
        />
        <NumberInput
          label={t('emailEditor.settings.logoWidth', 'Logo Width')}
          value={block.content.logoWidth || 150}
          onChange={(value) => updateContent({ logoWidth: value })}
          suffix="px"
        />
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.content', 'Content')}</h4>
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
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.style', 'Style')}</h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">{t('emailEditor.settings.alignment', 'Alignment')}</span>
          <AlignmentSelector value={block.content.alignment || 'center'} onChange={(alignment) => updateContent({ alignment })} />
        </div>
        <ColorInput
          label={t('emailEditor.settings.backgroundColor', 'Background')}
          value={block.content.backgroundColor || '#ffffff'}
          onChange={(backgroundColor) => updateContent({ backgroundColor })}
        />
        <ColorInput
          label={t('emailEditor.settings.textColor', 'Text Color')}
          value={block.content.textColor || '#333333'}
          onChange={(textColor) => updateContent({ textColor })}
        />
        <NumberInput
          label={t('emailEditor.settings.padding', 'Padding')}
          value={block.content.padding || 20}
          onChange={(padding) => updateContent({ padding })}
          suffix="px"
        />
      </div>
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
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.content', 'Content')}</h4>
        <div>
          <label className="text-xs text-on-surface-variant mb-1 block">{t('emailEditor.settings.htmlContent', 'HTML Content')}</label>
          <Textarea value={block.content.html} onChange={(e) => updateContent({ html: e.target.value })} rows={5} className="font-mono text-xs" />
          <p className="text-xs text-on-surface-variant mt-1">
            {t('emailEditor.settings.htmlSupport', 'Supports: <p>, <strong>, <em>, <a>, <ul>, <ol>')}
          </p>
        </div>
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          {t('emailEditor.settings.typography', 'Typography')}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">{t('emailEditor.settings.alignment', 'Alignment')}</span>
          <AlignmentSelector value={block.content.alignment || 'left'} onChange={(alignment) => updateContent({ alignment })} />
        </div>
        <NumberInput
          label={t('emailEditor.settings.fontSize', 'Font Size')}
          value={block.content.fontSize || 16}
          onChange={(fontSize) => updateContent({ fontSize })}
          min={10}
          max={48}
          suffix="px"
        />
        <NumberInput
          label={t('emailEditor.settings.lineHeight', 'Line Height')}
          value={block.content.lineHeight || 1.5}
          onChange={(lineHeight) => updateContent({ lineHeight })}
          min={1}
          max={3}
          step={0.1}
        />
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.colors', 'Colors')}</h4>
        <ColorInput
          label={t('emailEditor.settings.textColor', 'Text Color')}
          value={block.content.textColor || '#333333'}
          onChange={(textColor) => updateContent({ textColor })}
        />
        <ColorInput
          label={t('emailEditor.settings.backgroundColor', 'Background')}
          value={block.content.backgroundColor || '#ffffff'}
          onChange={(backgroundColor) => updateContent({ backgroundColor })}
        />
        <NumberInput
          label={t('emailEditor.settings.padding', 'Padding')}
          value={block.content.padding || 20}
          onChange={(padding) => updateContent({ padding })}
          suffix="px"
        />
      </div>
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
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.image', 'Image')}</h4>
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
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.layout', 'Layout')}</h4>
        <NumberInput
          label={t('emailEditor.settings.width', 'Width')}
          value={block.content.width || 560}
          onChange={(width) => updateContent({ width })}
          max={600}
          suffix="px"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">{t('emailEditor.settings.alignment', 'Alignment')}</span>
          <AlignmentSelector value={block.content.alignment || 'center'} onChange={(alignment) => updateContent({ alignment })} />
        </div>
        <NumberInput
          label={t('emailEditor.settings.borderRadius', 'Border Radius')}
          value={block.content.borderRadius || 0}
          onChange={(borderRadius) => updateContent({ borderRadius })}
          suffix="px"
        />
        <NumberInput
          label={t('emailEditor.settings.padding', 'Padding')}
          value={block.content.padding || 10}
          onChange={(padding) => updateContent({ padding })}
          suffix="px"
        />
      </div>
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
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.button', 'Button')}</h4>
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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="fullWidth"
            checked={block.content.fullWidth || false}
            onChange={(e) => updateContent({ fullWidth: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="fullWidth" className="text-xs text-on-surface-variant">
            {t('emailEditor.settings.fullWidth', 'Full Width')}
          </label>
        </div>
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.style', 'Style')}</h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">{t('emailEditor.settings.alignment', 'Alignment')}</span>
          <AlignmentSelector value={block.content.alignment || 'center'} onChange={(alignment) => updateContent({ alignment })} />
        </div>
        <ColorInput
          label={t('emailEditor.settings.buttonColor', 'Button Color')}
          value={block.content.backgroundColor || '#0066cc'}
          onChange={(backgroundColor) => updateContent({ backgroundColor })}
        />
        <ColorInput
          label={t('emailEditor.settings.textColor', 'Text Color')}
          value={block.content.textColor || '#ffffff'}
          onChange={(textColor) => updateContent({ textColor })}
        />
        <NumberInput
          label={t('emailEditor.settings.fontSize', 'Font Size')}
          value={block.content.fontSize || 16}
          onChange={(fontSize) => updateContent({ fontSize })}
          min={12}
          max={24}
          suffix="px"
        />
        <NumberInput
          label={t('emailEditor.settings.borderRadius', 'Border Radius')}
          value={block.content.borderRadius || 4}
          onChange={(borderRadius) => updateContent({ borderRadius })}
          suffix="px"
        />
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.padding', 'Padding')}</h4>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={t('emailEditor.settings.vertical', 'Vertical')}
            value={block.content.padding?.vertical || 12}
            onChange={(vertical) =>
              updateContent({ padding: { ...block.content.padding, vertical, horizontal: block.content.padding?.horizontal || 24 } })
            }
            suffix="px"
          />
          <NumberInput
            label={t('emailEditor.settings.horizontal', 'Horizontal')}
            value={block.content.padding?.horizontal || 24}
            onChange={(horizontal) =>
              updateContent({ padding: { ...block.content.padding, horizontal, vertical: block.content.padding?.vertical || 12 } })
            }
            suffix="px"
          />
        </div>
      </div>
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
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.divider', 'Divider')}</h4>
        <ColorInput
          label={t('emailEditor.settings.color', 'Color')}
          value={block.content.color || '#dddddd'}
          onChange={(color) => updateContent({ color })}
        />
        <NumberInput
          label={t('emailEditor.settings.thickness', 'Thickness')}
          value={block.content.thickness || 1}
          onChange={(thickness) => updateContent({ thickness })}
          min={1}
          max={10}
          suffix="px"
        />
        <Select
          label={t('emailEditor.settings.style', 'Style')}
          value={block.content.style || 'solid'}
          onChange={(style) => updateContent({ style: style as 'solid' | 'dashed' | 'dotted' })}
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' },
          ]}
        />
        <Input
          label={t('emailEditor.settings.width', 'Width')}
          value={block.content.width || '100%'}
          onChange={(e) => updateContent({ width: e.target.value })}
          placeholder="100% or 400px"
          size="sm"
        />
        <NumberInput
          label={t('emailEditor.settings.padding', 'Padding')}
          value={block.content.padding || 20}
          onChange={(padding) => updateContent({ padding })}
          suffix="px"
        />
      </div>
    </div>
  );
}

// Spacer block settings
function SpacerBlockSettings({ block, onChange }: { block: SpacerBlock; onChange: (block: SpacerBlock) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.spacer', 'Spacer')}</h4>
        <NumberInput
          label={t('emailEditor.settings.height', 'Height')}
          value={block.content.height || 20}
          onChange={(height) => onChange({ ...block, content: { height } })}
          min={5}
          max={200}
          suffix="px"
        />
      </div>
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
    const newColumn = { id: `col-${Date.now()}`, blocks: [], width: Math.floor(100 / (block.content.columns.length + 1)) };
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.columns', 'Columns')}</h4>
          <Button variant="text" size="sm" onClick={addColumn} disabled={block.content.columns.length >= 4}>
            + {t('common.add', 'Add')}
          </Button>
        </div>

        <div className="space-y-2">
          {block.content.columns.map((column, index) => (
            <div key={column.id} className="flex items-center gap-2 p-2 bg-surface-container rounded-lg">
              <span className="text-xs text-on-surface-variant w-8">#{index + 1}</span>
              <Input
                type="number"
                value={column.width || Math.floor(100 / block.content.columns.length)}
                onChange={(e) => updateColumnWidth(index, Number(e.target.value))}
                min={10}
                max={90}
                className="w-16 text-xs"
                size="sm"
              />
              <span className="text-xs text-on-surface-variant">%</span>
              <Button
                variant="text"
                size="icon-sm"
                onClick={() => removeColumn(index)}
                disabled={block.content.columns.length <= 1}
                className="ml-auto"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.layout', 'Layout')}</h4>
        <NumberInput
          label={t('emailEditor.settings.gap', 'Gap')}
          value={block.content.gap || 20}
          onChange={(gap) => updateContent({ gap })}
          suffix="px"
        />
        <ColorInput
          label={t('emailEditor.settings.backgroundColor', 'Background')}
          value={block.content.backgroundColor || '#ffffff'}
          onChange={(backgroundColor) => updateContent({ backgroundColor })}
        />
        <NumberInput
          label={t('emailEditor.settings.padding', 'Padding')}
          value={block.content.padding || 20}
          onChange={(padding) => updateContent({ padding })}
          suffix="px"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="stackOnMobile"
            checked={block.content.stackOnMobile !== false}
            onChange={(e) => updateContent({ stackOnMobile: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="stackOnMobile" className="text-xs text-on-surface-variant">
            {t('emailEditor.settings.stackOnMobile', 'Stack on mobile')}
          </label>
        </div>
      </div>
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

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          {t('emailEditor.settings.socialLinks', 'Social Links')}
        </h4>
        {(block.content.links || []).map((link, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs font-medium capitalize w-16">{link.platform}</span>
            <Input value={link.url} onChange={(e) => updateLink(index, e.target.value)} placeholder="https://..." size="sm" className="flex-1" />
            <Button variant="text" size="icon-sm" onClick={() => removeLink(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Select
          value=""
          onChange={(platform) => {
            if (platform) addLink(platform as SocialLink['platform']);
          }}
          options={[
            { value: '', label: t('emailEditor.settings.addPlatform', 'Add platform...') },
            ...platforms
              .filter((p) => !(block.content.links || []).some((l) => l.platform === p))
              .map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })),
          ]}
        />
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.style', 'Style')}</h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">{t('emailEditor.settings.alignment', 'Alignment')}</span>
          <AlignmentSelector value={block.content.alignment || 'center'} onChange={(alignment) => updateContent({ alignment })} />
        </div>
        <NumberInput
          label={t('emailEditor.settings.iconSize', 'Icon Size')}
          value={block.content.iconSize || 32}
          onChange={(iconSize) => updateContent({ iconSize })}
          min={20}
          max={64}
          suffix="px"
        />
        <NumberInput
          label={t('emailEditor.settings.gap', 'Gap')}
          value={block.content.gap || 10}
          onChange={(gap) => updateContent({ gap })}
          suffix="px"
        />
      </div>
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
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          {t('emailEditor.settings.companyInfo', 'Company Info')}
        </h4>
        <Input
          label={t('emailEditor.settings.companyName', 'Company Name')}
          value={block.content.companyName || ''}
          onChange={(e) => updateContent({ companyName: e.target.value })}
          placeholder="{{companyName}}"
          size="sm"
        />
        <div>
          <label className="text-xs text-on-surface-variant mb-1 block">{t('emailEditor.settings.address', 'Address')}</label>
          <Textarea
            value={block.content.address || ''}
            onChange={(e) => updateContent({ address: e.target.value })}
            rows={2}
            placeholder={t('emailEditor.settings.addressPlaceholder', 'Company address...')}
          />
        </div>
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          {t('emailEditor.settings.unsubscribe', 'Unsubscribe')}
        </h4>
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
      </div>

      <div className="h-px bg-outline-variant/30" />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('emailEditor.settings.style', 'Style')}</h4>
        <ColorInput
          label={t('emailEditor.settings.backgroundColor', 'Background')}
          value={block.content.backgroundColor || '#f4f4f4'}
          onChange={(backgroundColor) => updateContent({ backgroundColor })}
        />
        <ColorInput
          label={t('emailEditor.settings.textColor', 'Text Color')}
          value={block.content.textColor || '#666666'}
          onChange={(textColor) => updateContent({ textColor })}
        />
        <NumberInput
          label={t('emailEditor.settings.fontSize', 'Font Size')}
          value={block.content.fontSize || 12}
          onChange={(fontSize) => updateContent({ fontSize })}
          min={10}
          max={18}
          suffix="px"
        />
      </div>
    </div>
  );
}

// Main Block Settings Panel component
export function BlockSettingsPanel({ block, onChange, onClose }: BlockSettingsPanelProps) {
  const { t } = useTranslation();

  if (!block) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
          <MousePointer2 className="h-6 w-6 text-on-surface-variant" />
        </div>
        <h3 className="text-sm font-medium text-on-surface mb-1">{t('emailEditor.noBlockSelected', 'No block selected')}</h3>
        <p className="text-xs text-on-surface-variant">{t('emailEditor.selectBlockHint', 'Select a block in the canvas to edit its properties')}</p>
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
      <div className="flex items-center justify-between p-3 border-b border-outline-variant/30 bg-surface-container/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{getBlockIcon(block.type)}</div>
          <div>
            <h4 className="text-sm font-medium text-on-surface">{blockTypeLabel[block.type]}</h4>
            <p className="text-xs text-on-surface-variant">{t('emailEditor.blockSettings', 'Block Settings')}</p>
          </div>
        </div>
        <Button variant="text" size="icon-sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto p-4">{renderSettings()}</div>
    </div>
  );
}
