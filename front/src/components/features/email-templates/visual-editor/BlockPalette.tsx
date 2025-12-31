// Block Palette - Drag source for adding new blocks
import { useTranslation } from 'react-i18next';
import { Type, Image, MousePointer2, Minus, Space, Columns, Share2, FileText, LayoutTemplate, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EmailBlockType } from './types';

interface BlockPaletteProps {
  onAddBlock: (type: EmailBlockType) => void;
  className?: string;
}

interface BlockOption {
  type: EmailBlockType;
  icon: React.ReactNode;
  label: string;
  description: string;
}

export function BlockPalette({ onAddBlock, className }: BlockPaletteProps) {
  const { t } = useTranslation();

  const blockOptions: BlockOption[] = [
    {
      type: 'header',
      icon: <LayoutTemplate className="h-5 w-5" />,
      label: t('emailEditor.blocks.header', 'Header'),
      description: t('emailEditor.blocks.headerDesc', 'Logo and title section'),
    },
    {
      type: 'text',
      icon: <Type className="h-5 w-5" />,
      label: t('emailEditor.blocks.text', 'Text'),
      description: t('emailEditor.blocks.textDesc', 'Rich text content'),
    },
    {
      type: 'image',
      icon: <Image className="h-5 w-5" />,
      label: t('emailEditor.blocks.image', 'Image'),
      description: t('emailEditor.blocks.imageDesc', 'Single image with optional link'),
    },
    {
      type: 'button',
      icon: <MousePointer2 className="h-5 w-5" />,
      label: t('emailEditor.blocks.button', 'Button'),
      description: t('emailEditor.blocks.buttonDesc', 'Call-to-action button'),
    },
    {
      type: 'divider',
      icon: <Minus className="h-5 w-5" />,
      label: t('emailEditor.blocks.divider', 'Divider'),
      description: t('emailEditor.blocks.dividerDesc', 'Horizontal line separator'),
    },
    {
      type: 'spacer',
      icon: <Space className="h-5 w-5" />,
      label: t('emailEditor.blocks.spacer', 'Spacer'),
      description: t('emailEditor.blocks.spacerDesc', 'Empty vertical space'),
    },
    {
      type: 'columns',
      icon: <Columns className="h-5 w-5" />,
      label: t('emailEditor.blocks.columns', 'Columns'),
      description: t('emailEditor.blocks.columnsDesc', 'Multi-column layout'),
    },
    {
      type: 'social',
      icon: <Share2 className="h-5 w-5" />,
      label: t('emailEditor.blocks.social', 'Social Links'),
      description: t('emailEditor.blocks.socialDesc', 'Social media icons'),
    },
    {
      type: 'footer',
      icon: <FileText className="h-5 w-5" />,
      label: t('emailEditor.blocks.footer', 'Footer'),
      description: t('emailEditor.blocks.footerDesc', 'Company info & unsubscribe'),
    },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-semibold text-on-surface px-2">{t('emailEditor.addBlock', 'Add Block')}</h3>
      <div className="grid grid-cols-1 gap-1.5">
        {blockOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => onAddBlock(option.type)}
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200',
              'border-2 border-transparent hover:bg-surface-container-high hover:border-primary/30',
              'active:scale-[0.98]',
              'group cursor-grab active:cursor-grabbing'
            )}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('blockType', option.type);
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <div
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg',
                'bg-surface-container-high text-on-surface-variant',
                'group-hover:bg-primary group-hover:text-on-primary',
                'transition-colors duration-200'
              )}
            >
              {option.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{option.label}</p>
              <p className="text-xs text-on-surface-variant truncate">{option.description}</p>
            </div>
            <GripVertical className="h-4 w-4 text-on-surface-variant/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
