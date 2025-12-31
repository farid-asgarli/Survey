import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Check, Star, MoreVertical, Copy, Trash2, Edit, Globe, Lock, Palette, Sparkles } from 'lucide-react';
import { Menu, MenuItem, MenuSeparator, IconButton, Badge } from '@/components/ui';
import { ButtonStyle } from '@/types';
import type { SurveyTheme } from '@/types';

interface ThemePreviewCardProps {
  theme: SurveyTheme;
  isDefault?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

// Helper to get button border radius based on style
function getButtonRadius(style?: ButtonStyle): string {
  switch (style) {
    case ButtonStyle.Pill:
      return '9999px';
    case ButtonStyle.Square:
      return '4px';
    case ButtonStyle.Rounded:
    default:
      return '8px';
  }
}

// Helper to determine if a color is light or dark
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// Color swatch component for better consistency
function ColorSwatch({ color, ringColor, size = 'md' }: { color: string; ringColor?: string; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div
      className={cn(sizeClasses, 'rounded-full')}
      style={{
        backgroundColor: color,
        boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : undefined,
      }}
    />
  );
}

export function ThemePreviewCard({
  theme,
  isDefault = false,
  isSelected = false,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onSetDefault,
  showActions = true,
  compact = false,
}: ThemePreviewCardProps) {
  const { t } = useTranslation();

  // Extract colors from nested or flat structure
  const primaryColor = theme.colors?.primary || theme.primaryColor || '#6750a4';
  const secondaryColor = theme.colors?.secondary || theme.secondaryColor || '#625b71';
  const backgroundColor = theme.colors?.background || theme.backgroundColor || '#ffffff';
  const textColor = theme.colors?.text || theme.textColor;
  const logoUrl = theme.branding?.logoUrl || theme.logoUrl;
  const buttonStyle = theme.button?.style || theme.buttonStyle;
  const fontFamily = theme.typography?.fontFamily || theme.fontFamily;

  const buttonRadius = getButtonRadius(buttonStyle);
  const bgIsLight = isLightColor(backgroundColor);
  const displayTextColor = textColor || (bgIsLight ? '#1f2937' : '#ffffff');

  const hasActions = showActions && (onEdit || onDuplicate || onDelete || onSetDefault);

  // List/Compact view - horizontal layout
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 px-4 py-3.5 transition-colors duration-200',
          'border-b border-outline-variant/20',
          'hover:bg-surface-container-low',
          'cursor-pointer group',
          isSelected && 'bg-primary-container/10 hover:bg-primary-container/15'
        )}
        onClick={onSelect}
      >
        {/* Mini theme preview */}
        <div className="relative h-14 w-24 rounded-xl overflow-hidden shrink-0 border border-outline-variant/30" style={{ backgroundColor }}>
          {/* Header mockup */}
          <div className="flex items-center gap-1.5 p-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
            <div className="h-1 w-8 rounded-full" style={{ backgroundColor: displayTextColor, opacity: 0.4 }} />
          </div>
          {/* Button mockups */}
          <div className="absolute bottom-1.5 left-2 flex gap-1">
            <div className="h-3 w-8" style={{ backgroundColor: primaryColor, borderRadius: buttonRadius }} />
            <div className="h-3 w-6 border" style={{ borderColor: primaryColor, borderRadius: buttonRadius }} />
          </div>
          {/* Decorative circle */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full opacity-20" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-on-surface truncate">{theme.name}</h3>
            {theme.isPublic ? (
              <Globe className="h-3.5 w-3.5 text-on-surface-variant/60 shrink-0" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-on-surface-variant/60 shrink-0" />
            )}
          </div>
          <p className="text-sm text-on-surface-variant flex items-center gap-2">
            <span className="flex items-center gap-1">
              {theme.isSystem ? (
                <>
                  <Palette className="w-3 h-3" /> {t('themes.system')}
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" /> {t('themes.custom')}
                </>
              )}
            </span>
            {fontFamily && (
              <>
                <span className="text-on-surface-variant/40">·</span>
                <span className="truncate">{fontFamily.split(',')[0]}</span>
              </>
            )}
          </p>
        </div>

        {/* Color Swatches */}
        <div className="hidden sm:flex -space-x-1 shrink-0">
          <ColorSwatch color={primaryColor} ringColor={backgroundColor} size="sm" />
          <ColorSwatch color={secondaryColor} ringColor={backgroundColor} size="sm" />
        </div>

        {/* Status Badge */}
        {isDefault && (
          <Badge variant="success" size="sm" className="shrink-0">
            <Check className="h-3 w-3 mr-1" />
            {t('themes.default')}
          </Badge>
        )}
        {isSelected && !isDefault && (
          <Badge variant="info" size="sm" className="shrink-0">
            <Check className="h-3 w-3 mr-1" />
            {t('themes.selected')}
          </Badge>
        )}

        {/* Actions */}
        {hasActions && (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <Menu
              trigger={
                <IconButton variant="standard" size="sm" aria-label={t('a11y.moreOptions')}>
                  <MoreVertical className="h-4 w-4" />
                </IconButton>
              }
              align="end"
            >
              {onEdit && !theme.isSystem && (
                <MenuItem onClick={onEdit} icon={<Edit className="h-4 w-4" />}>
                  {t('common.edit')}
                </MenuItem>
              )}
              {onDuplicate && (
                <MenuItem onClick={onDuplicate} icon={<Copy className="h-4 w-4" />}>
                  {t('common.duplicate')}
                </MenuItem>
              )}
              {onSetDefault && !isDefault && (
                <MenuItem onClick={onSetDefault} icon={<Star className="h-4 w-4" />}>
                  {t('themes.setAsDefault')}
                </MenuItem>
              )}
              {onDelete && !theme.isSystem && (
                <>
                  <MenuSeparator />
                  <MenuItem onClick={onDelete} destructive icon={<Trash2 className="h-4 w-4" />}>
                    {t('common.delete')}
                  </MenuItem>
                </>
              )}
            </Menu>
          </div>
        )}
      </div>
    );
  }

  // Grid/Card view - visual preview focused
  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border-2 overflow-hidden cursor-pointer',
        'transition-[border-color,box-shadow] duration-200',
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/30 hover:border-primary/50'
      )}
      onClick={onSelect}
      style={{ backgroundColor }}
    >
      {/* Theme Preview Area */}
      <div className="relative p-4 pb-3 overflow-hidden">
        {/* Header mockup */}
        <div className="flex items-center gap-2.5 mb-4">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-6 w-6 rounded-lg object-contain" style={{ backgroundColor: `${primaryColor}20` }} />
          ) : (
            <div className="h-6 w-6 rounded-lg" style={{ backgroundColor: primaryColor }} />
          )}
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-20 rounded-full" style={{ backgroundColor: displayTextColor, opacity: 0.5 }} />
            <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: displayTextColor, opacity: 0.3 }} />
          </div>
        </div>

        {/* Progress bar mockup */}
        <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: `${primaryColor}20` }}>
          <div className="h-full rounded-full w-3/5" style={{ backgroundColor: primaryColor }} />
        </div>

        {/* Button mockups */}
        <div className="flex gap-2">
          <div className="h-7 px-4 flex items-center justify-center" style={{ backgroundColor: primaryColor, borderRadius: buttonRadius }}>
            <div
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: isLightColor(primaryColor) ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)' }}
            />
          </div>
          <div
            className="h-7 px-4 flex items-center justify-center border-2"
            style={{ borderColor: `${primaryColor}50`, borderRadius: buttonRadius }}
          >
            <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.8 }} />
          </div>
        </div>

        {/* Decorative accent circle */}
        <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-20" style={{ backgroundColor: secondaryColor }} />
      </div>

      {/* Theme Info Footer */}
      <div
        className="px-4 py-3 border-t flex items-center gap-3"
        style={{
          borderColor: bgIsLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
          backgroundColor: bgIsLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
        }}
      >
        {/* Color dots */}
        <div className="flex -space-x-1">
          <ColorSwatch color={primaryColor} ringColor={backgroundColor} size="sm" />
          <ColorSwatch color={secondaryColor} ringColor={backgroundColor} size="sm" />
        </div>

        {/* Name & type */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: displayTextColor }}>
            {theme.name}
          </h3>
          <p className="text-[11px] flex items-center gap-1" style={{ color: displayTextColor, opacity: 0.6 }}>
            {theme.isSystem ? (
              <>
                <Palette className="w-2.5 h-2.5" /> {t('themes.system')}
              </>
            ) : (
              <>
                <Sparkles className="w-2.5 h-2.5" /> {t('themes.custom')}
              </>
            )}
            {theme.isPublic ? <Globe className="w-2.5 h-2.5 ml-1" /> : <Lock className="w-2.5 h-2.5 ml-1" />}
          </p>
        </div>

        {/* Actions */}
        {hasActions && (
          <div onClick={(e) => e.stopPropagation()}>
            <Menu
              trigger={
                <IconButton variant="standard" size="sm" className="h-7 w-7" aria-label={t('a11y.moreOptions')}>
                  <MoreVertical className="h-3.5 w-3.5" style={{ color: displayTextColor, opacity: 0.6 }} />
                </IconButton>
              }
              align="end"
            >
              {onEdit && !theme.isSystem && (
                <MenuItem onClick={onEdit} icon={<Edit className="h-4 w-4" />}>
                  {t('common.edit')}
                </MenuItem>
              )}
              {onDuplicate && (
                <MenuItem onClick={onDuplicate} icon={<Copy className="h-4 w-4" />}>
                  {t('common.duplicate')}
                </MenuItem>
              )}
              {onSetDefault && !isDefault && (
                <MenuItem onClick={onSetDefault} icon={<Star className="h-4 w-4" />}>
                  {t('themes.setAsDefault')}
                </MenuItem>
              )}
              {onDelete && !theme.isSystem && (
                <>
                  <MenuSeparator />
                  <MenuItem onClick={onDelete} destructive icon={<Trash2 className="h-4 w-4" />}>
                    {t('common.delete')}
                  </MenuItem>
                </>
              )}
            </Menu>
          </div>
        )}
      </div>

      {/* Selection/Default badge - positioned top right */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-on-primary" strokeWidth={3} />
        </div>
      )}
      {isDefault && !isSelected && (
        <div
          className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: primaryColor, color: isLightColor(primaryColor) ? '#1f2937' : '#ffffff' }}
        >
          {t('themes.default')}
        </div>
      )}
    </div>
  );
}
