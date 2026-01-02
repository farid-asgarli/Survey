// Theme Preview Panel - For survey builder theme customization
// Two-tab architecture: Themes (selection) + Customize (editing)

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Palette, Sparkles, Eye, Type, Sliders, RotateCcw, Save, Sun, Moon, SquareIcon, ToggleLeft, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  Button,
  IconButton,
  toast,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
} from '@/components/ui';
import { useSurveyBuilderStore } from '@/stores';
import { useThemes, useApplyThemeToSurvey, useCreateTheme, useDialogState } from '@/hooks';
import type { SurveyThemeSummary } from '@/types';

// ============ Types ============

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface?: string;
  textPrimary?: string;
  textSecondary?: string;
  error?: string;
  success?: string;
}

interface UnifiedTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  fontFamily: string;
  headingFontFamily?: string;
  cornerRadius: string;
  spacing?: string;
  containerWidth?: string;
  progressBarStyle?: string;
  isDark: boolean;
  isSystem?: boolean;
}

// ============ No Presets - All Themes from Database ============

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
  { name: 'Linear', value: 'linear', icon: '━━━' },
  { name: 'Stepped', value: 'stepped', icon: '○─○─○' },
  { name: 'Minimal', value: 'minimal', icon: '···' },
];

// ============ Helper Functions ============

/**
 * Normalize font name from backend to match frontend CSS format.
 * Backend stores: "Inter", "DM Sans", "Open Sans"
 * Frontend needs: "Inter, sans-serif", "DM Sans", sans-serif"
 */
function normalizeFontFamily(fontFamily: string | undefined): string {
  if (!fontFamily) return 'Inter, sans-serif';

  // If already has fallback, return as-is
  if (fontFamily.includes(',')) return fontFamily;

  // Determine if serif or sans-serif based on font name
  const serifFonts = ['Merriweather', 'Playfair Display'];
  const isSerif = serifFonts.some((serif) => fontFamily.includes(serif));

  // Add quotes if font name has spaces
  const needsQuotes = fontFamily.includes(' ');
  const quotedName = needsQuotes ? `"${fontFamily}"` : fontFamily;

  return `${quotedName}, ${isSerif ? 'serif' : 'sans-serif'}`;
}

// Note: isDark is now computed on the backend and sent in the API response.
// This function is kept for local UI preview calculations only.
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 2), 16);
  const b = parseInt(hex.substring(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function savedThemeToUnified(theme: SurveyThemeSummary): UnifiedTheme {
  // Summary themes have flat color fields - no nested structure
  const primary = theme.primaryColor;
  const secondary = theme.secondaryColor;
  const background = theme.backgroundColor;
  // These are not available in summary, use defaults
  const accent = '#E8F4FF';
  const surface = '#FFFFFF';
  const textPrimary = '#111827';
  const textSecondary = '#6B7280';
  const error = '#DC2626';
  const success = '#16A34A';

  return {
    id: theme.id,
    name: theme.name,
    colors: {
      primary,
      secondary,
      accent,
      background,
      surface,
      textPrimary,
      textSecondary,
      error,
      success,
    },
    fontFamily: 'Inter, sans-serif', // Default - not available in summary
    headingFontFamily: 'Inter, sans-serif',
    cornerRadius: '12px',
    spacing: 'normal',
    containerWidth: '800px',
    progressBarStyle: 'linear',
    isDark: theme.isDark,
    isSystem: theme.isSystem,
  };
}

// ============ Main Component ============

interface ThemePreviewPanelProps {
  className?: string;
  isReadOnly?: boolean;
}

export function ThemePreviewPanel({ className, isReadOnly = false }: ThemePreviewPanelProps) {
  const { t } = useTranslation();
  const { survey, updateSurveyMetadata } = useSurveyBuilderStore();
  const { data: themesData, isLoading: isLoadingThemes } = useThemes();
  const applyThemeMutation = useApplyThemeToSurvey();
  const createThemeMutation = useCreateTheme();

  // Current editing state
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState<ThemeColors>({
    primary: '#0066FF',
    secondary: '#00A3FF',
    accent: '#E8F4FF',
    background: '#FAFCFF',
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    error: '#DC2626',
    success: '#16A34A',
  });
  const [selectedFont, setSelectedFont] = useState('Inter, sans-serif');
  const [headingFont, setHeadingFont] = useState('Inter, sans-serif');
  const [cornerRadius, setCornerRadius] = useState('12px');
  const [spacing, setSpacing] = useState('normal');
  const [containerWidth, setContainerWidth] = useState('800px');
  const [progressBarStyle, setProgressBarStyle] = useState('linear');
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);
  const [questionNumberStyle, setQuestionNumberStyle] = useState('badge'); // 'badge' | 'text' | 'none'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('themes');

  // Save dialog state - using proper hook pattern
  const saveThemeDialog = useDialogState();
  const [newThemeName, setNewThemeName] = useState('');

  // Track if customizations have been made (different from selected theme)
  const [hasCustomizations, setHasCustomizations] = useState(false);

  // Get all themes from database only
  const allThemes = useMemo(() => {
    return (themesData?.items || []).map(savedThemeToUnified);
  }, [themesData]);

  // Get currently selected theme object
  const selectedTheme = useMemo(() => {
    return allThemes.find((t) => t.id === selectedThemeId) || null;
  }, [allThemes, selectedThemeId]);

  // Apply theme values to editor state
  const applyThemeToEditor = useCallback((theme: UnifiedTheme) => {
    setCustomColors(theme.colors);
    setSelectedFont(theme.fontFamily);
    setHeadingFont(theme.headingFontFamily || theme.fontFamily);
    setCornerRadius(theme.cornerRadius);
    setSpacing(theme.spacing || 'normal');
    setContainerWidth(theme.containerWidth || '800px');
    setProgressBarStyle(theme.progressBarStyle || 'linear');
    setIsDarkMode(theme.isDark);
    setHasCustomizations(false);
  }, []);

  // Track if we've initialized to prevent re-initialization
  const isInitializedRef = useRef(false);

  // Initialize with survey's current theme or first available theme
  useEffect(() => {
    if (isInitializedRef.current) return;
    if (allThemes.length === 0) return;

    let themeToApply: UnifiedTheme | undefined;

    // Check if survey has a theme applied
    if (survey?.themeId) {
      themeToApply = allThemes.find((t) => t.id === survey.themeId);
    }

    // Fallback to first available theme (prefer default/system theme)
    if (!themeToApply) {
      // Try to find default theme first
      themeToApply = allThemes.find((t) => t.isSystem) || allThemes[0];
    }

    if (themeToApply) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setSelectedThemeId(themeToApply!.id);
        applyThemeToEditor(themeToApply!);

        // Apply customizations if they exist
        if (survey?.themeCustomizations) {
          try {
            const customizations = JSON.parse(survey.themeCustomizations);

            // Apply custom colors if present
            if (customizations.colors) {
              setCustomColors(customizations.colors);
              if (customizations.colors.background) {
                setIsDarkMode(isColorDark(customizations.colors.background));
              }
            }

            // Apply custom font if present
            if (customizations.fontFamily) {
              setSelectedFont(normalizeFontFamily(customizations.fontFamily));
            }

            // Apply custom heading font if present
            if (customizations.headingFontFamily) {
              setHeadingFont(normalizeFontFamily(customizations.headingFontFamily));
            }

            // Apply custom corner radius if present
            if (customizations.cornerRadius) {
              setCornerRadius(customizations.cornerRadius);
            }

            // Apply spacing if present
            if (customizations.spacing) {
              setSpacing(customizations.spacing);
            }

            // Apply container width if present
            if (customizations.containerWidth) {
              setContainerWidth(customizations.containerWidth);
            }

            // Apply progress bar style if present
            if (customizations.progressBarStyle) {
              setProgressBarStyle(customizations.progressBarStyle);
            }

            // Apply display options if present
            if (customizations.showProgressBar !== undefined) {
              setShowProgressBar(customizations.showProgressBar);
            }

            if (customizations.showQuestionNumbers !== undefined) {
              setShowQuestionNumbers(customizations.showQuestionNumbers);
            }

            if (customizations.questionNumberStyle) {
              setQuestionNumberStyle(customizations.questionNumberStyle);
            }

            // Mark as customized
            setHasCustomizations(true);
          } catch (error) {
            console.error('Failed to parse theme customizations:', error);
          }
        }
      }, 0);
      isInitializedRef.current = true;
    }
  }, [survey?.themeId, survey?.themeCustomizations, allThemes, applyThemeToEditor]);

  // Handle theme selection from the grid
  const handleThemeSelect = useCallback(
    (theme: UnifiedTheme) => {
      setSelectedThemeId(theme.id);
      applyThemeToEditor(theme);
    },
    [applyThemeToEditor]
  );

  // Handle color change (marks as customized)
  const handleColorChange = useCallback((key: keyof ThemeColors, value: string) => {
    setCustomColors((prev) => ({ ...prev, [key]: value }));
    if (key === 'background') {
      setIsDarkMode(isColorDark(value));
    }
    setHasCustomizations(true);
  }, []);

  // Handle font change
  const handleFontChange = useCallback((font: string) => {
    setSelectedFont(font);
    setHasCustomizations(true);
  }, []);

  // Handle corner radius change
  const handleCornerRadiusChange = useCallback((radius: string) => {
    setCornerRadius(radius);
    setHasCustomizations(true);
  }, []);

  // Reset customizations to selected theme
  const handleResetCustomizations = useCallback(() => {
    if (selectedTheme) {
      applyThemeToEditor(selectedTheme);
    }
  }, [selectedTheme, applyThemeToEditor]);

  // Apply theme to survey (all themes are from database)
  const handleApplyToSurvey = useCallback(async () => {
    if (!survey?.id || !selectedThemeId) return;

    try {
      // Build customizations JSON if user made changes
      const customizations = hasCustomizations
        ? JSON.stringify({
            colors: customColors,
            fontFamily: selectedFont,
            headingFontFamily: headingFont,
            cornerRadius,
            spacing,
            containerWidth,
            progressBarStyle,
            showProgressBar,
            showQuestionNumbers,
            questionNumberStyle,
          })
        : undefined;

      await applyThemeMutation.mutateAsync({
        surveyId: survey.id,
        themeId: selectedThemeId,
        themeCustomizations: customizations,
      });

      updateSurveyMetadata({
        themeId: selectedThemeId,
        presetThemeId: undefined,
        themeCustomizations: customizations,
      });

      setHasCustomizations(false);
      toast.success(t('themes.applySuccess', 'Theme applied to survey'));
    } catch (error) {
      console.error('Failed to apply theme:', error);
      toast.error(t('themes.applyError', 'Failed to apply theme'));
    }
  }, [
    survey,
    selectedThemeId,
    hasCustomizations,
    customColors,
    selectedFont,
    headingFont,
    cornerRadius,
    spacing,
    containerWidth,
    progressBarStyle,
    showProgressBar,
    showQuestionNumbers,
    questionNumberStyle,
    applyThemeMutation,
    updateSurveyMetadata,
    t,
  ]);

  // Save as new theme
  const handleSaveAsNewTheme = useCallback(async () => {
    if (!newThemeName.trim()) {
      toast.error(t('themes.nameRequired', 'Theme name is required'));
      return;
    }

    try {
      const newTheme = await createThemeMutation.mutateAsync({
        name: newThemeName.trim(),
        colors: {
          primary: customColors.primary,
          secondary: customColors.secondary,
          background: customColors.background,
          text: isDarkMode ? '#F9FAFB' : '#111827',
        },
        typography: {
          fontFamily: selectedFont,
        },
      });

      // Select the newly created theme
      setSelectedThemeId(newTheme.id);
      setHasCustomizations(false);
      saveThemeDialog.close();
      setNewThemeName('');

      toast.success(t('themes.createSuccess', 'Theme created successfully'));

      // Optionally apply to survey immediately
      if (survey?.id) {
        await applyThemeMutation.mutateAsync({
          surveyId: survey.id,
          themeId: newTheme.id,
        });
        updateSurveyMetadata({
          themeId: newTheme.id,
          presetThemeId: undefined,
          themeCustomizations: undefined,
        });
      }
    } catch {
      toast.error(t('themes.createError', 'Failed to create theme'));
    }
  }, [newThemeName, customColors, isDarkMode, selectedFont, createThemeMutation, survey, applyThemeMutation, updateSurveyMetadata, t, saveThemeDialog]);

  // Check if current theme is applied to survey (without unsaved customizations)
  const isAppliedToSurvey = !hasCustomizations && survey?.themeId === selectedThemeId;

  return (
    <aside className={cn('w-100 shrink-0 flex flex-col bg-surface border-l border-outline-variant/30 overflow-hidden', className)}>
      {/* Panel Header */}
      <div className='shrink-0 px-6 py-5 border-b border-outline-variant/30'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-11 h-11 rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center'>
              <Palette className='w-5 h-5 text-primary' />
            </div>
            <div>
              <h2 className='font-semibold text-on-surface text-base'>{t('themes.appearance', 'Appearance')}</h2>
              <p className='text-xs text-on-surface-variant'>{t('themes.customizeLook', 'Customize your survey look')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className='shrink-0 px-5 py-5 border-b border-outline-variant/30 bg-surface-container-lowest/30'>
        <ThemePreview
          colors={customColors}
          font={selectedFont}
          headingFont={headingFont}
          cornerRadius={cornerRadius}
          spacing={spacing}
          progressBarStyle={progressBarStyle}
          showProgress={showProgressBar}
          showNumbers={showQuestionNumbers}
          questionNumberStyle={questionNumberStyle}
          isDark={isDarkMode}
        />
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} variant='pills' className='flex-1 flex flex-col overflow-hidden'>
        <div className='shrink-0 px-5 py-3 border-b border-outline-variant/30'>
          <TabsList className='w-full'>
            <TabsTrigger value='themes' className='flex-1 gap-1.5'>
              <Palette className='w-3.5 h-3.5' />
              {t('themes.title', 'Themes')}
            </TabsTrigger>
            <TabsTrigger value='customize' className='flex-1 gap-1.5'>
              <Sliders className='w-3.5 h-3.5' />
              {t('themes.customize', 'Customize')}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Themes Tab - All available themes */}
        <TabsContent value='themes' className='flex-1 overflow-auto px-5 py-5 space-y-6'>
          {/* Light Themes */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-xs font-medium text-on-surface-variant'>
              <Sun className='w-3.5 h-3.5' />
              {t('themes.light', 'Light')}
            </div>
            <div className='grid grid-cols-2 gap-2.5'>
              {allThemes
                .filter((t) => !t.isDark)
                .map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isSelected={selectedThemeId === theme.id}
                    isApplied={survey?.themeId === theme.id}
                    onClick={() => handleThemeSelect(theme)}
                  />
                ))}
            </div>
          </div>

          {/* Dark Themes */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-xs font-medium text-on-surface-variant'>
              <Moon className='w-3.5 h-3.5' />
              {t('themes.dark', 'Dark')}
            </div>
            <div className='grid grid-cols-2 gap-2.5'>
              {allThemes
                .filter((t) => t.isDark)
                .map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isSelected={selectedThemeId === theme.id}
                    isApplied={survey?.themeId === theme.id}
                    onClick={() => handleThemeSelect(theme)}
                  />
                ))}
            </div>
          </div>

          {isLoadingThemes && (
            <div className='space-y-2.5'>
              <Skeleton className='h-16 rounded-2xl' />
              <Skeleton className='h-16 rounded-2xl' />
            </div>
          )}
        </TabsContent>

        {/* Customize Tab - Edit selected theme */}
        <TabsContent value='customize' className='flex-1 overflow-auto px-5 py-5 space-y-6'>
          {/* Currently editing indicator */}
          {selectedTheme && (
            <div className='flex items-center justify-between p-3 rounded-xl bg-surface-container-low/50 border border-outline-variant/20'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-lg flex items-center justify-center' style={{ backgroundColor: customColors.accent }}>
                  <div className='flex -space-x-1'>
                    <div className='w-3 h-3 rounded-full ring-1 ring-white' style={{ backgroundColor: customColors.primary }} />
                    <div className='w-3 h-3 rounded-full ring-1 ring-white' style={{ backgroundColor: customColors.secondary }} />
                  </div>
                </div>
                <div>
                  <span className='text-sm font-medium text-on-surface'>{hasCustomizations ? t('themes.customized', 'Customized') : selectedTheme.name}</span>
                  {hasCustomizations && (
                    <span className='text-xs text-on-surface-variant block'>
                      {t('themes.basedOn', 'Based on')} {selectedTheme.name}
                    </span>
                  )}
                </div>
              </div>
              {hasCustomizations && (
                <IconButton variant='standard' size='sm' onClick={handleResetCustomizations} aria-label={t('themes.reset', 'Reset')}>
                  <RotateCcw className='w-4 h-4' />
                </IconButton>
              )}
            </div>
          )}

          {/* Colors Section */}
          <div className='space-y-4'>
            <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
              <Palette className='w-4 h-4' />
              {t('themes.colors', 'Colors')}
            </label>
            <div className='space-y-3'>
              {/* Brand Colors */}
              <div>
                <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.brandColors', 'Brand Colors')}</span>
                <div className='grid grid-cols-2 gap-2'>
                  <ColorPickerButton label={t('themes.primary', 'Primary')} value={customColors.primary} onChange={(v) => handleColorChange('primary', v)} />
                  <ColorPickerButton
                    label={t('themes.secondary', 'Secondary')}
                    value={customColors.secondary}
                    onChange={(v) => handleColorChange('secondary', v)}
                  />
                </div>
              </div>

              {/* Surface Colors */}
              <div>
                <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.surfaceColors', 'Surface Colors')}</span>
                <div className='grid grid-cols-2 gap-2'>
                  <ColorPickerButton
                    label={t('themes.background', 'Background')}
                    value={customColors.background}
                    onChange={(v) => handleColorChange('background', v)}
                  />
                  <ColorPickerButton
                    label={t('themes.surface', 'Surface')}
                    value={customColors.surface || '#FFFFFF'}
                    onChange={(v) => handleColorChange('surface', v)}
                  />
                  <ColorPickerButton label={t('themes.accent', 'Accent')} value={customColors.accent} onChange={(v) => handleColorChange('accent', v)} />
                  <ColorPickerButton
                    label={t('themes.textPrimary', 'Text')}
                    value={customColors.textPrimary || '#111827'}
                    onChange={(v) => handleColorChange('textPrimary', v)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className='space-y-4'>
            <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
              <Type className='w-4 h-4' />
              {t('themes.typography', 'Typography')}
            </label>
            <div className='space-y-3'>
              {/* Body Font */}
              <div>
                <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.bodyFont', 'Body Font')}</span>
                <div className='grid grid-cols-2 gap-2'>
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => handleFontChange(font.value)}
                      className={cn(
                        'flex flex-col items-start gap-1 p-2.5 rounded-xl border transition-all text-left',
                        selectedFont === font.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-outline-variant/30 hover:bg-surface-container/50'
                      )}
                    >
                      <div className='flex items-center justify-between w-full'>
                        <span className='text-base font-medium' style={{ fontFamily: font.value }}>
                          Aa
                        </span>
                        {selectedFont === font.value && <Check className='w-3.5 h-3.5 text-primary' />}
                      </div>
                      <span className='text-xs font-medium text-on-surface'>{font.name}</span>
                      <span className='text-[10px] text-on-surface-variant'>{font.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Corner Radius */}
          <div className='space-y-4'>
            <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
              <SquareIcon className='w-4 h-4' />
              {t('themes.cornerRadius', 'Corner Radius')}
            </label>
            <div className='grid grid-cols-5 gap-2'>
              {CORNER_OPTIONS.map((corner) => (
                <button
                  key={corner.name}
                  onClick={() => handleCornerRadiusChange(corner.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                    cornerRadius === corner.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-outline-variant/30 hover:bg-surface-container/50'
                  )}
                >
                  <div className={cn('w-8 h-8 bg-primary/20 border-2 border-primary/40', corner.preview)} />
                  <span className='text-xs text-on-surface-variant'>{corner.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout & Spacing */}
          <div className='space-y-4'>
            <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
              <Sliders className='w-4 h-4' />
              {t('themes.layoutSpacing', 'Layout & Spacing')}
            </label>
            <div className='space-y-3'>
              <div>
                <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.containerWidth', 'Container Width')}</span>
                <div className='grid grid-cols-2 gap-2'>
                  {WIDTH_OPTIONS.map((width) => (
                    <button
                      key={width.name}
                      onClick={() => {
                        setContainerWidth(width.value);
                        setHasCustomizations(true);
                      }}
                      className={cn(
                        'flex flex-col items-start gap-0.5 p-2.5 rounded-xl border transition-all text-left',
                        containerWidth === width.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-outline-variant/30 hover:bg-surface-container/50'
                      )}
                    >
                      <span className='text-xs font-medium text-on-surface'>{width.name}</span>
                      <span className='text-[10px] text-on-surface-variant'>{width.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.spacing', 'Spacing')}</span>
                <div className='grid grid-cols-4 gap-2'>
                  {SPACING_OPTIONS.map((spacingOption) => (
                    <button
                      key={spacingOption.name}
                      onClick={() => {
                        setSpacing(spacingOption.value);
                        setHasCustomizations(true);
                      }}
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-xl border transition-all',
                        spacing === spacingOption.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-outline-variant/30 hover:bg-surface-container/50'
                      )}
                    >
                      <span className='text-xs text-on-surface-variant'>{spacingOption.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className='space-y-4'>
            <label className='text-sm font-semibold text-on-surface flex items-center gap-2'>
              <ToggleLeft className='w-4 h-4' />
              {t('themes.displayOptions', 'Display Options')}
            </label>
            <div className='space-y-3'>
              {/* Progress Indicator */}
              <div>
                <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.progressIndicator', 'Progress Indicator')}</span>
                <div className='grid grid-cols-4 gap-2'>
                  <button
                    onClick={() => {
                      setShowProgressBar(false);
                      setHasCustomizations(true);
                    }}
                    className={cn(
                      'flex items-center justify-center p-2.5 rounded-xl border transition-all',
                      !showProgressBar
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20 text-primary font-medium'
                        : 'border-outline-variant/30 hover:bg-surface-container/50 text-on-surface-variant'
                    )}
                  >
                    <span className='text-xs'>{t('common.none', 'None')}</span>
                  </button>
                  {PROGRESS_STYLES.map((style) => (
                    <button
                      key={style.name}
                      onClick={() => {
                        setShowProgressBar(true);
                        setProgressBarStyle(style.value);
                        setHasCustomizations(true);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all',
                        showProgressBar && progressBarStyle === style.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-outline-variant/30 hover:bg-surface-container/50'
                      )}
                    >
                      <span className='text-sm font-mono text-on-surface'>{style.icon}</span>
                      <span className='text-[10px] text-on-surface-variant'>{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Numbers */}
              <div>
                <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.questionNumbers', 'Question Numbers')}</span>
                <div className='grid grid-cols-3 gap-2'>
                  <button
                    onClick={() => {
                      setShowQuestionNumbers(false);
                      setHasCustomizations(true);
                    }}
                    className={cn(
                      'flex items-center justify-center p-2.5 rounded-xl border transition-all',
                      !showQuestionNumbers
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20 text-primary font-medium'
                        : 'border-outline-variant/30 hover:bg-surface-container/50 text-on-surface-variant'
                    )}
                  >
                    <span className='text-xs'>{t('common.none', 'None')}</span>
                  </button>
                  {[
                    { name: 'Badge', value: 'badge' },
                    { name: 'Plain', value: 'text' },
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => {
                        setShowQuestionNumbers(true);
                        setQuestionNumberStyle(style.value);
                        setHasCustomizations(true);
                      }}
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-xl border transition-all',
                        showQuestionNumbers && questionNumberStyle === style.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20 text-primary font-medium'
                          : 'border-outline-variant/30 hover:bg-surface-container/50 text-on-surface-variant'
                      )}
                    >
                      <span className='text-xs'>{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons - Fixed at bottom (only in edit mode) */}
      {!isReadOnly && (
        <div className='shrink-0 p-4 border-t border-outline-variant/30 bg-surface space-y-2'>
          <Button variant='filled' className='w-full' onClick={handleApplyToSurvey} disabled={applyThemeMutation.isPending || !!isAppliedToSurvey}>
            {applyThemeMutation.isPending ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : isAppliedToSurvey ? <Check className='w-4 h-4 mr-2' /> : null}
            {isAppliedToSurvey ? t('themes.applied', 'Applied') : t('themes.applyToSurvey', 'Apply to Survey')}
          </Button>

          {hasCustomizations && (
            <Button variant='tonal' className='w-full' onClick={() => saveThemeDialog.open()}>
              <Plus className='w-4 h-4 mr-2' />
              {t('themes.saveAsNewTheme', 'Save as New Theme')}
            </Button>
          )}
        </div>
      )}

      {/* Save Theme Dialog */}
      <Dialog open={saveThemeDialog.isOpen} onOpenChange={saveThemeDialog.setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('themes.saveTheme', 'Save Theme')}</DialogTitle>
            <DialogDescription>{t('themes.saveThemeDesc', 'Create a new theme from your customizations')}</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label htmlFor='theme-name' className='text-sm font-medium text-on-surface'>
                {t('themes.themeName', 'Theme Name')}
              </label>
              <Input
                id='theme-name'
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder={t('themes.themeNamePlaceholder', 'My Custom Theme')}
              />
            </div>
            {/* Preview */}
            <div className='p-3 rounded-xl bg-surface-container-low border border-outline-variant/20'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{ backgroundColor: customColors.accent }}>
                  <div className='flex -space-x-1.5'>
                    <div className='w-4 h-4 rounded-full ring-2 ring-white' style={{ backgroundColor: customColors.primary }} />
                    <div className='w-4 h-4 rounded-full ring-2 ring-white' style={{ backgroundColor: customColors.secondary }} />
                  </div>
                </div>
                <div>
                  <span className='text-sm font-medium text-on-surface'>{newThemeName || t('themes.untitled', 'Untitled Theme')}</span>
                  <span className='text-xs text-on-surface-variant flex items-center gap-1'>
                    <Sparkles className='w-3 h-3' /> {t('themes.customTheme', 'Custom theme')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => saveThemeDialog.close()}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button variant='filled' onClick={handleSaveAsNewTheme} disabled={createThemeMutation.isPending || !newThemeName.trim()}>
              {createThemeMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              <Save className='w-4 h-4 mr-2' />
              {t('themes.saveAndApply', 'Save & Apply')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

// ============ Sub-Components ============

interface ThemeCardProps {
  theme: UnifiedTheme;
  isSelected: boolean;
  isApplied: boolean;
  onClick: () => void;
}

function ThemeCard({ theme, isSelected, isApplied, onClick }: ThemeCardProps) {
  const { t } = useTranslation();
  const cardBg = theme.isDark ? theme.colors.background : theme.colors.surface || theme.colors.background;
  const textColor = theme.isDark ? '#f5f5f5' : '#1a1a1a';
  const subtextColor = theme.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-2xl border-2 transition-[border-color,box-shadow] duration-200 text-left overflow-hidden',
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/30 hover:border-primary/50'
      )}
      style={{ backgroundColor: cardBg }}
    >
      {/* Mini survey preview */}
      <div className='p-3 pb-2.5'>
        {/* Header mockup */}
        <div className='flex items-center gap-2 mb-3'>
          <div className='w-5 h-5 rounded-full shrink-0' style={{ backgroundColor: theme.colors.primary }} />
          <div className='flex-1 space-y-1'>
            <div className='h-1.5 rounded-full w-16' style={{ backgroundColor: subtextColor }} />
            <div className='h-1 rounded-full w-10 opacity-60' style={{ backgroundColor: subtextColor }} />
          </div>
        </div>

        {/* Progress bar mockup */}
        <div className='h-1 rounded-full mb-3 overflow-hidden' style={{ backgroundColor: `${theme.colors.primary}20` }}>
          <div className='h-full rounded-full w-2/3' style={{ backgroundColor: theme.colors.primary }} />
        </div>

        {/* Button mockups */}
        <div className='flex gap-1.5'>
          <div className='h-5 px-3 rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.primary }}>
            <div className='h-1 w-6 rounded-full' style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }} />
          </div>
          <div
            className='h-5 px-3 rounded-full flex items-center justify-center border'
            style={{
              borderColor: `${theme.colors.primary}40`,
              backgroundColor: 'transparent',
            }}
          >
            <div className='h-1 w-5 rounded-full' style={{ backgroundColor: theme.colors.primary }} />
          </div>
        </div>
      </div>

      {/* Theme info footer */}
      <div
        className='px-3 py-2.5 border-t flex items-center gap-2'
        style={{
          borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        }}
      >
        {/* Color dots */}
        <div className='flex -space-x-1'>
          <div
            className='w-3.5 h-3.5 rounded-full'
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: `0 0 0 1.5px ${cardBg}`,
            }}
          />
          <div
            className='w-3.5 h-3.5 rounded-full'
            style={{
              backgroundColor: theme.colors.secondary,
              boxShadow: `0 0 0 1.5px ${cardBg}`,
            }}
          />
        </div>

        {/* Name */}
        <span className='text-xs font-medium truncate flex-1' style={{ color: textColor }}>
          {theme.name}
        </span>

        {/* System/Custom indicator */}
        {theme.isSystem ? (
          <Palette className='w-3 h-3 opacity-40' style={{ color: textColor }} />
        ) : (
          <Sparkles className='w-3 h-3 opacity-40' style={{ color: textColor }} />
        )}
      </div>

      {/* Selection checkmark - top right */}
      {isSelected && (
        <div className='absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center'>
          <Check className='w-3 h-3 text-on-primary' strokeWidth={3} />
        </div>
      )}

      {/* Applied indicator - subtle badge */}
      {isApplied && !isSelected && (
        <div
          className='absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-semibold'
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.isDark ? '#000' : '#fff',
          }}
        >
          {t('themeCard.default', 'Default')}
        </div>
      )}
    </button>
  );
}

interface ColorPickerButtonProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPickerButton({ label, value, onChange }: ColorPickerButtonProps) {
  return (
    <div className='relative group'>
      <input type='color' value={value} onChange={(e) => onChange(e.target.value)} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
      <div className='flex items-center gap-3 p-3 rounded-2xl border border-outline-variant/30 bg-surface group-hover:border-primary/50 transition-colors cursor-pointer'>
        <div className='w-9 h-9 rounded-xl border border-black/10' style={{ backgroundColor: value }} />
        <div className='flex-1 min-w-0'>
          <span className='text-xs text-on-surface-variant block mb-0.5'>{label}</span>
          <span className='text-xs font-mono text-on-surface uppercase'>{value}</span>
        </div>
      </div>
    </div>
  );
}

interface ThemePreviewProps {
  colors: ThemeColors;
  font: string;
  headingFont: string;
  cornerRadius: string;
  spacing: string;
  progressBarStyle: string;
  showProgress: boolean;
  showNumbers: boolean;
  questionNumberStyle: string;
  isDark: boolean;
}

function ThemePreview({
  colors,
  font,
  headingFont,
  cornerRadius,
  spacing,
  progressBarStyle,
  showProgress,
  showNumbers,
  questionNumberStyle,
  isDark,
}: ThemePreviewProps) {
  const textColor = colors.textPrimary || (isDark ? '#F9FAFB' : '#111827');
  const subtextColor = colors.textSecondary || (isDark ? '#9CA3AF' : '#6B7280');

  // Calculate spacing multiplier
  const spacingMap = {
    compact: 0.75,
    normal: 1,
    relaxed: 1.25,
    spacious: 1.5,
  };
  const spacingMultiplier = spacingMap[spacing as keyof typeof spacingMap] || 1;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5'>
          <Eye className='w-3.5 h-3.5' />
          Preview
        </span>
        {isDark && (
          <span className='text-[10px] px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant flex items-center gap-1'>
            <Moon className='w-2.5 h-2.5' /> Dark
          </span>
        )}
      </div>

      <div
        className='overflow-hidden border border-outline-variant/40 transition-all duration-300'
        style={{
          backgroundColor: colors.background,
          fontFamily: font,
          borderRadius: cornerRadius === '9999px' ? '24px' : cornerRadius === '0px' ? '4px' : cornerRadius,
        }}
      >
        {/* Progress bar */}
        {showProgress && (
          <div className='relative h-1.5' style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
            {progressBarStyle === 'stepped' ? (
              <div className='flex items-center h-full px-2'>
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className='flex-1 flex items-center'>
                    <div
                      className='w-1.5 h-1.5 rounded-full'
                      style={{
                        backgroundColor: step <= 3 ? colors.primary : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                      }}
                    />
                    {step < 5 && (
                      <div
                        className='flex-1 h-0.5 mx-1'
                        style={{
                          backgroundColor: step < 3 ? colors.primary : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : progressBarStyle === 'minimal' ? (
              <div className='absolute top-0 right-2 text-[9px] font-medium px-1.5 py-0.5' style={{ color: colors.primary }}>
                60%
              </div>
            ) : (
              <div
                className='h-full transition-all duration-500'
                style={{
                  backgroundColor: colors.primary,
                  width: '60%',
                  borderRadius: cornerRadius === '9999px' ? '9999px' : cornerRadius === '0px' ? '0px' : '2px',
                }}
              />
            )}
          </div>
        )}

        <div
          className='space-y-4'
          style={{
            padding: `${16 * spacingMultiplier}px ${20 * spacingMultiplier}px`,
          }}
        >
          {/* Question */}
          <div>
            <div className='flex items-start gap-2.5 mb-3' style={{ marginBottom: `${12 * spacingMultiplier}px` }}>
              {showNumbers &&
                (questionNumberStyle === 'badge' ? (
                  <span
                    className='text-xs font-bold px-2.5 py-1 rounded-full shrink-0'
                    style={{
                      backgroundColor: colors.accent,
                      color: colors.primary,
                      borderRadius: cornerRadius === '9999px' ? '9999px' : cornerRadius === '0px' ? '4px' : '8px',
                    }}
                  >
                    Q1
                  </span>
                ) : (
                  <span className='text-sm font-semibold shrink-0' style={{ color: colors.primary }}>
                    1.
                  </span>
                ))}
              <span
                className='text-sm font-medium leading-relaxed'
                style={{
                  color: textColor,
                  fontFamily: headingFont,
                }}
              >
                How satisfied are you with our service?
              </span>
            </div>

            {/* Rating scale */}
            <div className='flex items-center justify-between' style={{ gap: `${8 * spacingMultiplier}px` }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className='flex-1 aspect-square max-w-11 flex items-center justify-center text-sm font-semibold transition-all'
                  style={{
                    backgroundColor: n === 4 ? colors.primary : 'transparent',
                    color: n === 4 ? '#FFFFFF' : subtextColor,
                    borderRadius: cornerRadius === '9999px' ? '9999px' : cornerRadius === '0px' ? '4px' : cornerRadius,
                    border: n === 4 ? 'none' : `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Continue button */}
          <button
            className='w-full py-3 text-sm font-semibold text-white transition-all hover:opacity-90'
            style={{
              backgroundColor: colors.primary,
              borderRadius: cornerRadius === '9999px' ? '9999px' : cornerRadius === '0px' ? '6px' : cornerRadius,
              fontFamily: headingFont,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
