import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  ChevronDown,
  Check,
  X,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  TestTube2,
  QrCode,
  Camera,
  Keyboard,
  PanelRightOpen,
  PanelRightClose,
  Maximize,
  Minimize,
  Settings2,
  Copy,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { Button, IconButton, Switch, Menu, Input, Tooltip } from '@/components/ui';
import { cn } from '@/lib/utils';
import { DEVICE_PRESETS } from '../constants/devices';
import type { DevicePreset, DeviceCategory, Orientation, DisplayMode, ThemeMode } from '../types';

interface PreviewToolbarProps {
  surveyTitle: string;
  selectedPreset: DevicePreset;
  orientation: Orientation;
  effectiveDimensions: { width: number; height: number };
  zoom: number;
  themeMode: ThemeMode;
  isTestMode: boolean;
  displayMode: DisplayMode;
  showResponseDrawer: boolean;
  showKeyboardHints: boolean;
  isFullscreen: boolean;
  customWidth: string;
  customHeight: string;
  previewUrl: string;
  onBack: () => void;
  onSelectPreset: (preset: DevicePreset) => void;
  onToggleOrientation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onTestModeChange: (enabled: boolean) => void;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onToggleResponseDrawer: () => void;
  onToggleKeyboardHints: () => void;
  onToggleFullscreen: () => void;
  onShowQRCode: () => void;
  onCaptureScreenshot: () => void;
  onReset: () => void;
  onCopyLink: () => void;
  onCustomWidthChange: (width: string) => void;
  onCustomHeightChange: (height: string) => void;
  onApplyCustomDimensions: () => void;
}

export function PreviewToolbar({
  surveyTitle,
  selectedPreset,
  orientation,
  effectiveDimensions,
  zoom,
  themeMode,
  isTestMode,
  displayMode,
  showResponseDrawer,
  showKeyboardHints,
  isFullscreen,
  customWidth,
  customHeight,
  previewUrl,
  onBack,
  onSelectPreset,
  onToggleOrientation,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onThemeModeChange,
  onTestModeChange,
  onDisplayModeChange,
  onToggleResponseDrawer,
  onToggleKeyboardHints,
  onToggleFullscreen,
  onShowQRCode,
  onCaptureScreenshot,
  onReset,
  onCopyLink,
  onCustomWidthChange,
  onCustomHeightChange,
  onApplyCustomDimensions,
}: PreviewToolbarProps) {
  const { t } = useTranslation();
  const isResponsive = selectedPreset.id === 'responsive';
  const showOrientationToggle = selectedPreset.category !== 'desktop' && !isResponsive;

  return (
    <header className="shrink-0 h-14 flex items-center justify-between px-3 bg-surface border-b border-outline-variant/30 gap-2">
      {/* Left section - Navigation and Title */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <IconButton variant="standard" size="sm" aria-label={t('surveyPreview.backToEditor')} onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </IconButton>

        <div className="hidden sm:flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="font-medium text-on-surface text-sm">{t('surveyPreview.title')}</span>
        </div>

        <span className="text-sm text-on-surface-variant truncate max-w-32 lg:max-w-48">{surveyTitle}</span>
      </div>

      {/* Center - Device selector with Menu */}
      <div className="flex items-center gap-1">
        {/* Quick device category buttons */}
        <div className="hidden md:flex items-center gap-0.5 bg-surface-container rounded-full p-0.5">
          {(['mobile', 'tablet', 'desktop'] as DeviceCategory[]).map((category) => {
            const Icon = category === 'mobile' ? Smartphone : category === 'tablet' ? Tablet : Monitor;
            const isSelected = selectedPreset.category === category;
            return (
              <button
                key={category}
                onClick={() => {
                  const preset = DEVICE_PRESETS.find((p) => p.category === category);
                  if (preset) onSelectPreset(preset);
                }}
                className={cn(
                  'p-2 rounded-full transition-all',
                  isSelected ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high'
                )}
                title={category}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Device preset dropdown */}
        <Menu
          trigger={
            <Button variant="text" size="sm" className="gap-1 px-2">
              <selectedPreset.icon className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">{selectedPreset.name}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          }
          align="center"
        >
          <div className="w-72 max-h-80 overflow-auto">
            {/* Category tabs */}
            {(['mobile', 'tablet', 'desktop'] as DeviceCategory[]).map((category) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wide bg-surface-container-low sticky top-0">
                  {t(`surveyPreview.${category}`)}
                </div>
                {DEVICE_PRESETS.filter((p) => p.category === category).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      selectedPreset.id === preset.id
                        ? 'bg-primary-container/50 text-on-primary-container'
                        : 'hover:bg-surface-container-high text-on-surface'
                    )}
                  >
                    <preset.icon className="w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{preset.name}</div>
                      {preset.id !== 'responsive' && (
                        <div className="text-xs text-on-surface-variant">
                          {preset.width} × {preset.height}
                        </div>
                      )}
                    </div>
                    {selectedPreset.id === preset.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            ))}

            {/* Custom dimensions */}
            <div className="border-t border-outline-variant/30 p-3">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">{t('surveyPreview.customDimensions')}</div>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    value={customWidth}
                    onChange={(e) => onCustomWidthChange(e.target.value)}
                    placeholder="Width"
                    className="h-8 text-xs pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    size="sm"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-on-surface-variant/60 pointer-events-none">px</span>
                </div>
                <X className="w-3 h-3 text-on-surface-variant/50 shrink-0" />
                <div className="relative flex-1">
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => onCustomHeightChange(e.target.value)}
                    placeholder="Height"
                    className="h-8 text-xs pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    size="sm"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-on-surface-variant/60 pointer-events-none">px</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="tonal"
                onClick={onApplyCustomDimensions}
                disabled={!customWidth || !customHeight}
                className="w-full h-8 text-xs mt-2"
              >
                {t('common.apply')}
              </Button>
            </div>
          </div>
        </Menu>

        {/* Orientation toggle */}
        {showOrientationToggle && (
          <IconButton
            variant="standard"
            size="sm"
            aria-label={t('surveyPreview.toggleOrientation')}
            onClick={onToggleOrientation}
            title={t('surveyPreview.toggleOrientation')}
            className={cn(orientation === 'landscape' && 'rotate-90')}
          >
            <RotateCcw className="w-4 h-4" />
          </IconButton>
        )}

        {/* Dimensions display */}
        {!isResponsive && (
          <span className="hidden lg:inline text-xs text-on-surface-variant tabular-nums">
            {effectiveDimensions.width}×{effectiveDimensions.height}
          </span>
        )}
      </div>

      {/* Right section - Controls */}
      <div className="flex items-center gap-1">
        {/* Zoom controls */}
        <div className="hidden sm:flex items-center gap-0.5 bg-surface-container rounded-full p-0.5">
          <Tooltip content={t('surveyPreview.zoomOut')}>
            <IconButton variant="standard" size="sm" aria-label={t('surveyPreview.zoomOut')} onClick={onZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="w-3.5 h-3.5" />
            </IconButton>
          </Tooltip>
          <Tooltip content={t('surveyPreview.resetZoom')}>
            <button
              onClick={onZoomReset}
              className="px-2 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors tabular-nums min-w-12"
            >
              {zoom}%
            </button>
          </Tooltip>
          <Tooltip content={t('surveyPreview.zoomIn')}>
            <IconButton variant="standard" size="sm" aria-label={t('surveyPreview.zoomIn')} onClick={onZoomIn} disabled={zoom >= 150}>
              <ZoomIn className="w-3.5 h-3.5" />
            </IconButton>
          </Tooltip>
        </div>

        <div className="h-5 w-px bg-outline-variant/30 mx-1 hidden sm:block" />

        {/* Theme mode toggle */}
        <div className="flex items-center gap-0.5 bg-surface-container rounded-full p-0.5">
          <Tooltip content={t('surveyPreview.lightMode')}>
            <button
              onClick={() => onThemeModeChange('light')}
              className={cn(
                'p-1.5 rounded-full transition-all',
                themeMode === 'light' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip content={t('surveyPreview.darkMode')}>
            <button
              onClick={() => onThemeModeChange('dark')}
              className={cn(
                'p-1.5 rounded-full transition-all',
                themeMode === 'dark' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        <div className="h-5 w-px bg-outline-variant/30 mx-1 hidden sm:block" />

        {/* Test mode indicator */}
        <Tooltip content={isTestMode ? t('surveyPreview.testModeDesc', 'No data is saved') : t('surveyPreview.testModeOff', 'Test mode is off')}>
          <div
            className={cn(
              'hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-default',
              isTestMode ? 'bg-warning-container/60 text-on-warning-container' : 'bg-surface-container text-on-surface-variant'
            )}
          >
            <TestTube2 className="w-3.5 h-3.5" />
            <span>{t('surveyPreview.testMode')}</span>
          </div>
        </Tooltip>

        {/* Action buttons */}
        <Tooltip content={t('surveyPreview.showQRCode')}>
          <IconButton variant="standard" size="sm" aria-label={t('surveyPreview.showQRCode')} onClick={onShowQRCode}>
            <QrCode className="w-4 h-4" />
          </IconButton>
        </Tooltip>

        <Tooltip content={t('surveyPreview.captureScreenshot')}>
          <IconButton variant="standard" size="sm" aria-label={t('surveyPreview.captureScreenshot')} onClick={onCaptureScreenshot}>
            <Camera className="w-4 h-4" />
          </IconButton>
        </Tooltip>

        <Tooltip content={t('surveyPreview.keyboardHintsDesc', 'Show keyboard shortcuts')}>
          <IconButton
            variant={showKeyboardHints ? 'filled-tonal' : 'standard'}
            size="sm"
            aria-label={t('surveyPreview.keyboardMode')}
            onClick={onToggleKeyboardHints}
          >
            <Keyboard className="w-4 h-4" />
          </IconButton>
        </Tooltip>

        <Tooltip content={t('surveyPreview.toggleResponses')}>
          <IconButton
            variant={showResponseDrawer ? 'filled-tonal' : 'standard'}
            size="sm"
            aria-label={t('surveyPreview.toggleResponses')}
            onClick={onToggleResponseDrawer}
          >
            {showResponseDrawer ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </IconButton>
        </Tooltip>

        <Tooltip content={t('surveyPreview.resetPreview')}>
          <IconButton variant="standard" size="sm" aria-label={t('surveyPreview.resetPreview')} onClick={onReset}>
            <RefreshCw className="w-4 h-4" />
          </IconButton>
        </Tooltip>

        <Tooltip content={t('surveyPreview.toggleFullscreen')}>
          <IconButton variant="standard" size="sm" aria-label={t('surveyPreview.toggleFullscreen')} onClick={onToggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </IconButton>
        </Tooltip>

        {/* Settings menu */}
        <Menu
          trigger={
            <IconButton variant="standard" size="sm" aria-label={t('surveyPreview.previewSettings')}>
              <Settings2 className="w-4 h-4" />
            </IconButton>
          }
          align="end"
        >
          <div className="w-72">
            {/* Display Mode Section */}
            <div className="px-4 py-3 border-b border-outline-variant/30">
              <p className="text-sm font-medium text-on-surface mb-1">{t('surveyPreview.displayMode')}</p>
              <p className="text-xs text-on-surface-variant mb-3">{t('surveyPreview.displayModeDesc', 'How questions appear to respondents')}</p>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onDisplayModeChange('one-by-one')}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                    displayMode === 'one-by-one'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {t('surveyPreview.oneByOne')}
                </button>
                <button
                  onClick={() => onDisplayModeChange('all-at-once')}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                    displayMode === 'all-at-once'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {t('surveyPreview.allAtOnce')}
                </button>
              </div>
            </div>

            {/* Toggles Section */}
            <div className="px-4 py-3 border-b border-outline-variant/30 space-y-3" onClick={(e) => e.stopPropagation()}>
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm text-on-surface block">{t('surveyPreview.testModeLabel')}</span>
                  <span className="text-xs text-on-surface-variant">{t('surveyPreview.testModeDesc', 'No data is saved')}</span>
                </div>
                <Switch checked={isTestMode} onChange={(e) => onTestModeChange(e.target.checked)} size="sm" />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm text-on-surface block">{t('surveyPreview.keyboardHints')}</span>
                  <span className="text-xs text-on-surface-variant">{t('surveyPreview.keyboardHintsDesc', 'Show keyboard shortcuts')}</span>
                </div>
                <Switch checked={showKeyboardHints} onChange={() => onToggleKeyboardHints()} size="sm" />
              </label>
            </div>

            {/* Actions Section */}
            <div className="px-2 py-2">
              <Button
                variant="text"
                size="sm"
                className="w-full justify-start gap-3 px-3 h-10 hover:bg-surface-container rounded-lg"
                onClick={onCopyLink}
              >
                <Copy className="w-4 h-4" />
                <span className="flex-1 text-left">{t('surveyPreview.copyLink')}</span>
              </Button>
              <Button
                variant="text"
                size="sm"
                className="w-full justify-start gap-3 px-3 h-10 hover:bg-surface-container rounded-lg"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="flex-1 text-left">{t('surveyPreview.openInNewTab')}</span>
              </Button>
            </div>
          </div>
        </Menu>
      </div>
    </header>
  );
}
