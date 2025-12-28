import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Textarea,
  toast,
} from '@/components/ui';
import { ThemeLivePreview } from './ThemeLivePreview';
import { cn } from '@/lib/utils';
import { Upload, Code, Palette, Type, Image, Sparkles, Eye, FileCode, X, Check, SquareIcon, Sliders } from 'lucide-react';
import { ButtonStyle, ProgressBarStyle } from '@/types';
import type { SurveyTheme } from '@/types';

// ============ Types ============
export interface ThemeFormData {
  name: string;
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  // Typography
  fontFamily: string;
  headingFontFamily: string;
  fontSize: number;
  // Layout
  cornerRadius: string;
  spacing: string;
  containerWidth: string;
  // Display Options
  progressBarStyle: ProgressBarStyle;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  questionNumberStyle: string;
  // Button
  buttonStyle: ButtonStyle;
  // Branding
  logoUrl: string;
  backgroundImageUrl: string;
  // Advanced
  customCss: string;
}

interface ThemeEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: SurveyTheme | null;
  onSave: (data: ThemeFormData) => Promise<void>;
  isSaving?: boolean;
}

// ============ Constants ============
const defaultFormData: ThemeFormData = {
  name: '',
  primaryColor: '#6750a4',
  secondaryColor: '#625b71',
  accentColor: '#eaddff',
  backgroundColor: '#fef7ff',
  surfaceColor: '#ffffff',
  textColor: '#1d1b20',
  fontFamily: 'Inter, sans-serif',
  headingFontFamily: 'Inter, sans-serif',
  fontSize: 16,
  cornerRadius: '12px',
  spacing: 'normal',
  containerWidth: '800px',
  progressBarStyle: ProgressBarStyle.Bar,
  showProgressBar: true,
  showQuestionNumbers: true,
  questionNumberStyle: 'badge',
  buttonStyle: ButtonStyle.Rounded,
  logoUrl: '',
  backgroundImageUrl: '',
  customCss: '',
};

// Color presets with expanded colors
const colorPresets = [
  { name: 'Violet', primary: '#6750a4', secondary: '#625b71', accent: '#eaddff', background: '#fef7ff', surface: '#ffffff', text: '#1d1b20' },
  { name: 'Ocean', primary: '#1976d2', secondary: '#455a64', accent: '#bbdefb', background: '#f5f9ff', surface: '#ffffff', text: '#1e293b' },
  { name: 'Forest', primary: '#2e7d32', secondary: '#558b2f', accent: '#c8e6c9', background: '#f1f8e9', surface: '#ffffff', text: '#1b5e20' },
  { name: 'Sunset', primary: '#f57c00', secondary: '#e64a19', accent: '#ffe0b2', background: '#fff3e0', surface: '#ffffff', text: '#4a2c00' },
  { name: 'Rose', primary: '#c2185b', secondary: '#7b1fa2', accent: '#f8bbd9', background: '#fce4ec', surface: '#ffffff', text: '#4a0e2b' },
  { name: 'Slate', primary: '#475569', secondary: '#64748b', accent: '#e2e8f0', background: '#f1f5f9', surface: '#ffffff', text: '#1e293b' },
  { name: 'Teal', primary: '#0d9488', secondary: '#0891b2', accent: '#99f6e4', background: '#f0fdfa', surface: '#ffffff', text: '#134e4a' },
  { name: 'Amber', primary: '#d97706', secondary: '#b45309', accent: '#fde68a', background: '#fffbeb', surface: '#ffffff', text: '#451a03' },
];

// Font options - matches fonts available in index.css
const FONT_OPTIONS = [
  { name: 'Inter', value: 'Inter, sans-serif', category: 'Sans Serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Sans Serif' },
  { name: 'Lato', value: 'Lato, sans-serif', category: 'Sans Serif' },
  { name: 'DM Sans', value: '"DM Sans", sans-serif', category: 'Sans Serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Sans Serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif', category: 'Sans Serif' },
  { name: 'Outfit', value: 'Outfit, sans-serif', category: 'Sans Serif' },
  { name: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif', category: 'Sans Serif' },
  { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif', category: 'Serif' },
];

// Corner radius options
const CORNER_OPTIONS = [
  { name: 'Sharp', value: '0px', preview: 'rounded-none' },
  { name: 'Subtle', value: '4px', preview: 'rounded' },
  { name: 'Rounded', value: '12px', preview: 'rounded-xl' },
  { name: 'Smooth', value: '20px', preview: 'rounded-3xl' },
  { name: 'Pill', value: '9999px', preview: 'rounded-full' },
];

// Spacing options
const SPACING_OPTIONS = [
  { name: 'Compact', value: 'compact' },
  { name: 'Normal', value: 'normal' },
  { name: 'Relaxed', value: 'relaxed' },
  { name: 'Spacious', value: 'spacious' },
];

// Container width options
const WIDTH_OPTIONS = [
  { name: 'Narrow', value: '600px', description: 'Best for mobile' },
  { name: 'Medium', value: '800px', description: 'Balanced' },
  { name: 'Wide', value: '1000px', description: 'Desktop first' },
  { name: 'Full', value: '100%', description: 'Edge to edge' },
];

// Progress bar styles
const PROGRESS_STYLES = [
  { name: 'Linear', value: ProgressBarStyle.Bar, icon: '━━━' },
  { name: 'Stepped', value: ProgressBarStyle.Steps, icon: '○─○─○' },
  { name: 'Minimal', value: ProgressBarStyle.Dots, icon: '···' },
];

// Button style options with visual preview
const BUTTON_STYLE_OPTIONS: { name: string; value: ButtonStyle; preview: string }[] = [
  { name: 'Rounded', value: ButtonStyle.Rounded, preview: 'rounded-xl' },
  { name: 'Pill', value: ButtonStyle.Pill, preview: 'rounded-full' },
  { name: 'Square', value: ButtonStyle.Square, preview: 'rounded' },
];

// ============ Component ============
export function ThemeEditorDrawer({ open, onOpenChange, theme, onSave, isSaving = false }: ThemeEditorDrawerProps) {
  const { t } = useTranslation();
  const isEditing = !!theme?.id;
  const [activeTab, setActiveTab] = useState('colors');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data from theme or defaults
  const initialFormData = useMemo((): ThemeFormData => {
    if (theme) {
      return {
        name: theme.name || '',
        primaryColor: theme.colors?.primary || theme.primaryColor || defaultFormData.primaryColor,
        secondaryColor: theme.colors?.secondary || theme.secondaryColor || defaultFormData.secondaryColor,
        accentColor: theme.colors?.accent || defaultFormData.accentColor,
        backgroundColor: theme.colors?.background || theme.backgroundColor || defaultFormData.backgroundColor,
        surfaceColor: theme.colors?.surface || defaultFormData.surfaceColor,
        textColor: theme.colors?.text || theme.textColor || defaultFormData.textColor,
        fontFamily: theme.typography?.fontFamily || theme.fontFamily || defaultFormData.fontFamily,
        headingFontFamily:
          theme.typography?.headingFontFamily || theme.typography?.fontFamily || theme.fontFamily || defaultFormData.headingFontFamily,
        fontSize: theme.typography?.baseFontSize || theme.fontSize || defaultFormData.fontSize,
        // These layout fields may not be in backend yet, use defaults
        cornerRadius: defaultFormData.cornerRadius,
        spacing: defaultFormData.spacing,
        containerWidth: defaultFormData.containerWidth,
        // Display options from layout settings
        progressBarStyle: theme.layout?.progressBarStyle || defaultFormData.progressBarStyle,
        showProgressBar: theme.layout?.showProgressBar ?? defaultFormData.showProgressBar,
        showQuestionNumbers: defaultFormData.showQuestionNumbers,
        questionNumberStyle: defaultFormData.questionNumberStyle,
        buttonStyle: theme.button?.style || theme.buttonStyle || defaultFormData.buttonStyle,
        logoUrl: theme.branding?.logoUrl || theme.logoUrl || '',
        backgroundImageUrl: theme.layout?.backgroundImageUrl || theme.backgroundImageUrl || '',
        customCss: theme.customCss || '',
      };
    }
    return { ...defaultFormData };
  }, [theme]);

  const [formData, setFormData] = useState<ThemeFormData>(initialFormData);

  // Reset form when theme changes
  const themeKey = theme?.id || 'new';
  const [prevThemeKey, setPrevThemeKey] = useState(themeKey);
  if (themeKey !== prevThemeKey) {
    setPrevThemeKey(themeKey);
    setFormData(initialFormData);
    setErrors({});
    setActiveTab('colors');
  }

  const updateField = useCallback(
    <K extends keyof ThemeFormData>(field: K, value: ThemeFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const applyPreset = useCallback((preset: (typeof colorPresets)[0]) => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      backgroundColor: preset.background,
      surfaceColor: preset.surface,
      textColor: preset.text,
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('themeEditor.validation.nameRequired');
    }
    if (!formData.primaryColor) {
      newErrors.primaryColor = t('themeEditor.validation.primaryColorRequired');
    }
    if (!formData.backgroundColor) {
      newErrors.backgroundColor = t('themeEditor.validation.backgroundColorRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      toast.error(t('themeEditor.toast.validationError'));
      return;
    }

    try {
      await onSave(formData);
      onOpenChange(false);
    } catch {
      // Error handled by parent
    }
  }, [formData, validate, onSave, onOpenChange, t]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onOpenChange(false);
    }
  }, [isSaving, onOpenChange]);

  // Generate CSS preview
  const cssPreview = useMemo(() => {
    const buttonRadius = formData.buttonStyle === ButtonStyle.Pill ? '9999px' : formData.buttonStyle === ButtonStyle.Square ? '4px' : '12px';
    return `:root {
  /* Theme Colors */
  --theme-primary: ${formData.primaryColor};
  --theme-secondary: ${formData.secondaryColor};
  --theme-accent: ${formData.accentColor};
  --theme-background: ${formData.backgroundColor};
  --theme-surface: ${formData.surfaceColor};
  --theme-text: ${formData.textColor};
  
  /* Typography */
  --theme-font-family: ${formData.fontFamily};
  --theme-heading-font-family: ${formData.headingFontFamily};
  --theme-font-size: ${formData.fontSize}px;
  
  /* Layout */
  --theme-corner-radius: ${formData.cornerRadius};
  --theme-container-width: ${formData.containerWidth};
  --theme-button-radius: ${buttonRadius};
}

${formData.customCss || '/* Custom CSS */'}`;
  }, [formData]);

  return (
    <Drawer open={open} onOpenChange={handleClose} side="right">
      <DrawerContent className="w-full max-w-6xl" showClose={false}>
        <DrawerHeader
          hero
          icon={<Palette className="h-7 w-7" />}
          title={isEditing ? t('themeEditor.editTitle') : t('themeEditor.createTitle')}
          description={isEditing ? t('themeEditor.editDescription') : t('themeEditor.createDescription')}
          showClose
        />

        {/* Split Layout: Preview (left) + Editor (right) */}
        <div className="flex-1 flex min-h-0">
          {/* Live Preview Panel - Fixed on left */}
          <div className="hidden lg:flex w-100 shrink-0 flex-col border-r border-outline-variant/30 bg-surface-container-low/50">
            <div className="p-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                <Eye className="h-4 w-4" />
                {t('themeEditor.livePreview')}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">{t('themeEditor.livePreviewHint', 'Changes update in real-time')}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ThemeLivePreview
                primaryColor={formData.primaryColor}
                secondaryColor={formData.secondaryColor}
                backgroundColor={formData.backgroundColor}
                textColor={formData.textColor}
                fontFamily={formData.fontFamily}
                fontSize={formData.fontSize}
                logoUrl={formData.logoUrl}
                backgroundImageUrl={formData.backgroundImageUrl}
                buttonStyle={formData.buttonStyle}
                variant="full"
                className="sticky top-0"
              />
            </div>
          </div>

          {/* Editor Panel - Scrollable on right */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Theme Name */}
            <div className="mb-6">
              <Input
                label={t('themeEditor.themeName')}
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
                placeholder={t('themeEditor.themeNamePlaceholder')}
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 flex-wrap">
                <TabsTrigger value="colors">
                  <Palette className="h-4 w-4 mr-2" /> {t('themeEditor.tabs.colors')}
                </TabsTrigger>
                <TabsTrigger value="typography">
                  <Type className="h-4 w-4 mr-2" /> {t('themeEditor.tabs.typography')}
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Sliders className="h-4 w-4 mr-2" /> {t('themeEditor.tabs.layout', 'Layout')}
                </TabsTrigger>
                <TabsTrigger value="branding">
                  <Image className="h-4 w-4 mr-2" /> {t('themeEditor.tabs.branding')}
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Code className="h-4 w-4 mr-2" /> {t('themeEditor.tabs.advanced')}
                </TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-6">
                {/* Quick Presets */}
                <div>
                  <label className="text-sm font-semibold text-on-surface flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4" />
                    {t('themeEditor.quickPresets')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all',
                          formData.primaryColor === preset.primary
                            ? 'border-primary bg-primary-container/30'
                            : 'border-outline-variant/30 hover:border-outline-variant'
                        )}
                      >
                        <div className="flex -space-x-1">
                          <div className="h-5 w-5 rounded-full ring-2 ring-surface" style={{ backgroundColor: preset.primary }} />
                          <div className="h-5 w-5 rounded-full ring-2 ring-surface" style={{ backgroundColor: preset.secondary }} />
                        </div>
                        <span className="text-sm font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Colors */}
                <div>
                  <span className="text-xs font-medium text-on-surface-variant block mb-3">{t('themeEditor.brandColors', 'Brand Colors')}</span>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label={t('themeEditor.colors.primary')}
                      value={formData.primaryColor}
                      onChange={(v) => updateField('primaryColor', v)}
                      error={errors.primaryColor}
                    />
                    <ColorPicker
                      label={t('themeEditor.colors.secondary')}
                      value={formData.secondaryColor}
                      onChange={(v) => updateField('secondaryColor', v)}
                    />
                    <ColorPicker
                      label={t('themeEditor.colors.accent', 'Accent')}
                      value={formData.accentColor}
                      onChange={(v) => updateField('accentColor', v)}
                    />
                  </div>
                </div>

                {/* Surface Colors */}
                <div>
                  <span className="text-xs font-medium text-on-surface-variant block mb-3">{t('themeEditor.surfaceColors', 'Surface Colors')}</span>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label={t('themeEditor.colors.background')}
                      value={formData.backgroundColor}
                      onChange={(v) => updateField('backgroundColor', v)}
                      error={errors.backgroundColor}
                    />
                    <ColorPicker
                      label={t('themeEditor.colors.surface', 'Surface')}
                      value={formData.surfaceColor}
                      onChange={(v) => updateField('surfaceColor', v)}
                    />
                    <ColorPicker label={t('themeEditor.colors.text')} value={formData.textColor} onChange={(v) => updateField('textColor', v)} />
                  </div>
                </div>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="space-y-6">
                {/* Body Font */}
                <div>
                  <span className="text-sm font-semibold text-on-surface block mb-3">{t('themeEditor.bodyFont', 'Body Font')}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.name}
                        type="button"
                        onClick={() => updateField('fontFamily', font.value)}
                        className={cn(
                          'flex flex-col items-start gap-1 p-2.5 rounded-xl border-2 transition-all text-left',
                          formData.fontFamily === font.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-outline-variant/30 hover:border-outline-variant'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base font-medium" style={{ fontFamily: font.value }}>
                            Aa
                          </span>
                          {formData.fontFamily === font.value && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <span className="text-xs font-medium text-on-surface">{font.name}</span>
                        <span className="text-[10px] text-on-surface-variant">{font.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Heading Font */}
                <div>
                  <span className="text-sm font-semibold text-on-surface block mb-3">{t('themeEditor.headingFont', 'Heading Font')}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.name}
                        type="button"
                        onClick={() => updateField('headingFontFamily', font.value)}
                        className={cn(
                          'flex flex-col items-start gap-1 p-2.5 rounded-xl border-2 transition-all text-left',
                          formData.headingFontFamily === font.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-outline-variant/30 hover:border-outline-variant'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base font-semibold" style={{ fontFamily: font.value }}>
                            Heading
                          </span>
                          {formData.headingFontFamily === font.value && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <span className="text-xs font-medium text-on-surface">{font.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Style */}
                <div>
                  <span className="text-sm font-semibold text-on-surface block mb-3">{t('themeEditor.buttonStyle')}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {BUTTON_STYLE_OPTIONS.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => updateField('buttonStyle', style.value)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                          formData.buttonStyle === style.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-outline-variant/30 hover:border-outline-variant'
                        )}
                      >
                        <div className={cn('w-16 h-8 bg-primary flex items-center justify-center', style.preview)}>
                          <span className="text-xs text-on-primary font-medium">Button</span>
                        </div>
                        <span className="text-xs text-on-surface-variant">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-6">
                {/* Corner Radius */}
                <div>
                  <label className="text-sm font-semibold text-on-surface flex items-center gap-2 mb-3">
                    <SquareIcon className="w-4 h-4" />
                    {t('themeEditor.cornerRadius', 'Corner Radius')}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {CORNER_OPTIONS.map((corner) => (
                      <button
                        key={corner.name}
                        type="button"
                        onClick={() => updateField('cornerRadius', corner.value)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                          formData.cornerRadius === corner.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-outline-variant/30 hover:border-outline-variant'
                        )}
                      >
                        <div className={cn('w-8 h-8 bg-primary/20 border-2 border-primary/40', corner.preview)} />
                        <span className="text-xs text-on-surface-variant">{corner.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Container Width */}
                <div>
                  <span className="text-sm font-semibold text-on-surface block mb-3">{t('themeEditor.containerWidth', 'Container Width')}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {WIDTH_OPTIONS.map((width) => (
                      <button
                        key={width.name}
                        type="button"
                        onClick={() => updateField('containerWidth', width.value)}
                        className={cn(
                          'flex flex-col items-start gap-0.5 p-2.5 rounded-xl border-2 transition-all text-left',
                          formData.containerWidth === width.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-outline-variant/30 hover:border-outline-variant'
                        )}
                      >
                        <span className="text-xs font-medium text-on-surface">{width.name}</span>
                        <span className="text-[10px] text-on-surface-variant">{width.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing */}
                <div>
                  <span className="text-sm font-semibold text-on-surface block mb-3">{t('themeEditor.spacing', 'Spacing')}</span>
                  <div className="grid grid-cols-4 gap-2">
                    {SPACING_OPTIONS.map((spacingOption) => (
                      <button
                        key={spacingOption.name}
                        type="button"
                        onClick={() => updateField('spacing', spacingOption.value)}
                        className={cn(
                          'flex items-center justify-center p-2.5 rounded-xl border-2 transition-all',
                          formData.spacing === spacingOption.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-outline-variant/30 hover:border-outline-variant'
                        )}
                      >
                        <span className="text-xs text-on-surface-variant">{spacingOption.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Indicator */}
                <div>
                  <span className="text-sm font-semibold text-on-surface block mb-3">{t('themeEditor.progressIndicator', 'Progress Indicator')}</span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('showProgressBar', false)}
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-xl border-2 transition-all',
                        !formData.showProgressBar
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20 text-primary font-medium'
                          : 'border-outline-variant/30 hover:border-outline-variant text-on-surface-variant'
                      )}
                    >
                      <span className="text-xs">{t('common.none', 'None')}</span>
                    </button>
                    {PROGRESS_STYLES.map((style) => (
                      <button
                        key={style.name}
                        type="button"
                        onClick={() => {
                          updateField('showProgressBar', true);
                          updateField('progressBarStyle', style.value);
                        }}
                        className={cn(
                          'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all',
                          formData.showProgressBar && formData.progressBarStyle === style.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-outline-variant/30 hover:border-outline-variant'
                        )}
                      >
                        <span className="text-sm font-mono text-on-surface">{style.icon}</span>
                        <span className="text-[10px] text-on-surface-variant">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Numbers */}
                <div>
                  <span className="text-sm font-semibold text-on-surface block mb-3">{t('themeEditor.questionNumbers', 'Question Numbers')}</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('showQuestionNumbers', false)}
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-xl border-2 transition-all',
                        !formData.showQuestionNumbers
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20 text-primary font-medium'
                          : 'border-outline-variant/30 hover:border-outline-variant text-on-surface-variant'
                      )}
                    >
                      <span className="text-xs">{t('common.none', 'None')}</span>
                    </button>
                    {[
                      { name: 'Badge', value: 'badge' },
                      { name: 'Plain', value: 'text' },
                    ].map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => {
                          updateField('showQuestionNumbers', true);
                          updateField('questionNumberStyle', style.value);
                        }}
                        className={cn(
                          'flex items-center justify-center p-2.5 rounded-xl border-2 transition-all',
                          formData.showQuestionNumbers && formData.questionNumberStyle === style.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20 text-primary font-medium'
                            : 'border-outline-variant/30 hover:border-outline-variant text-on-surface-variant'
                        )}
                      >
                        <span className="text-xs">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-6">
                <ImageUrlInput
                  label={t('themeEditor.logoUrl')}
                  value={formData.logoUrl}
                  onChange={(v) => updateField('logoUrl', v)}
                  placeholder="https://example.com/logo.png"
                  helperText={t('themeEditor.logoUrlHelperText')}
                />

                <ImageUrlInput
                  label={t('themeEditor.backgroundImageUrl')}
                  value={formData.backgroundImageUrl}
                  onChange={(v) => updateField('backgroundImageUrl', v)}
                  placeholder="https://example.com/background.jpg"
                  helperText={t('themeEditor.backgroundImageUrlHelperText')}
                />
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-on-surface flex items-center gap-2 mb-3">
                    <Code className="h-4 w-4" />
                    {t('themeEditor.customCss')}
                  </label>
                  <Textarea
                    value={formData.customCss}
                    onChange={(e) => updateField('customCss', e.target.value)}
                    placeholder={t('themeEditor.customCssPlaceholder')}
                    className="font-mono text-sm"
                    rows={6}
                  />
                  <p className="text-xs text-on-surface-variant mt-2">
                    {t('themeEditor.customCssHelperText')} <code className="bg-surface-container-high px-1 rounded">var(--theme-primary)</code>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-on-surface flex items-center gap-2 mb-3">
                    <FileCode className="h-4 w-4" />
                    {t('themeEditor.generatedCssPreview')}
                  </label>
                  <pre className="bg-surface-container-highest rounded-xl p-4 text-xs font-mono overflow-x-auto text-on-surface-variant">
                    {cssPreview}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>

            {/* Mobile-only Live Preview (shown below form on smaller screens) */}
            <div className="mt-8 lg:hidden">
              <label className="text-sm font-semibold text-on-surface flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4" />
                {t('themeEditor.livePreview')}
              </label>
              <ThemeLivePreview
                primaryColor={formData.primaryColor}
                secondaryColor={formData.secondaryColor}
                backgroundColor={formData.backgroundColor}
                textColor={formData.textColor}
                fontFamily={formData.fontFamily}
                fontSize={formData.fontSize}
                logoUrl={formData.logoUrl}
                backgroundImageUrl={formData.backgroundImageUrl}
                buttonStyle={formData.buttonStyle}
                variant="full"
              />
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button variant="text" onClick={handleClose} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={isSaving}>
            {isEditing ? t('themeEditor.saveChanges') : t('themeEditor.createTheme')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// ============ Helper Components ============

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function ColorPicker({ label, value, onChange, error }: ColorPickerProps) {
  return (
    <div>
      <label className={cn('block text-sm font-semibold mb-2', error ? 'text-error' : 'text-on-surface')}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 rounded-lg border-2 border-outline-variant/30 cursor-pointer"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" size="sm" error={error} />
      </div>
    </div>
  );
}

interface ImageUrlInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
}

function ImageUrlInput({ label, value, onChange, placeholder, helperText }: ImageUrlInputProps) {
  const [previewError, setPreviewError] = useState(false);

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-on-surface">{label}</label>
      <div className="flex gap-3">
        {/* Preview */}
        <div className="h-16 w-16 rounded-xl border-2 border-outline-variant/30 bg-surface-container-low overflow-hidden flex items-center justify-center shrink-0">
          {value && !previewError ? (
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-contain"
              onError={() => setPreviewError(true)}
              onLoad={() => setPreviewError(false)}
            />
          ) : (
            <Upload className="h-5 w-5 text-on-surface-variant" />
          )}
        </div>

        {/* Input */}
        <div className="flex-1">
          <div className="relative">
            <Input
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setPreviewError(false);
              }}
              placeholder={placeholder}
              className="pr-10"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <X className="h-4 w-4 text-on-surface-variant" />
              </button>
            )}
          </div>
          {helperText && <p className="text-xs text-on-surface-variant mt-1">{helperText}</p>}
        </div>
      </div>
    </div>
  );
}
