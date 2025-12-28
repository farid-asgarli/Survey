import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ButtonStyle } from '@/types';

interface ThemeLivePreviewProps {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  logoUrl?: string;
  backgroundImageUrl?: string;
  buttonStyle?: ButtonStyle;
  className?: string;
  variant?: 'card' | 'full';
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
      return '12px';
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

export function ThemeLivePreview({
  primaryColor,
  secondaryColor,
  backgroundColor,
  textColor,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontSize = 16,
  logoUrl,
  backgroundImageUrl,
  buttonStyle = ButtonStyle.Rounded,
  className,
  variant = 'card',
}: ThemeLivePreviewProps) {
  const { t } = useTranslation();
  const buttonRadius = getButtonRadius(buttonStyle);
  const bgIsLight = isLightColor(backgroundColor);
  const resolvedTextColor = textColor || (bgIsLight ? '#1f2937' : '#ffffff');
  const buttonTextColor = isLightColor(primaryColor) ? '#1f2937' : '#ffffff';

  if (variant === 'full') {
    return (
      <div
        className={cn('rounded-2xl border-2 border-outline-variant/30 overflow-hidden', className)}
        style={{
          backgroundColor,
          backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily,
          fontSize: `${fontSize}px`,
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b" style={{ borderColor: `${resolvedTextColor}20` }}>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <div className="h-10 w-10 rounded-xl shadow-sm" style={{ backgroundColor: primaryColor }} />
            )}
            <div>
              <div className="text-lg font-bold" style={{ color: resolvedTextColor }}>
                {t('themePreview.surveyTitle')}
              </div>
              <div className="text-sm opacity-70" style={{ color: resolvedTextColor }}>
                {t('themePreview.surveyDescription')}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${primaryColor}30` }}>
              <div className="h-full w-1/3 rounded-full transition-all" style={{ backgroundColor: primaryColor }} />
            </div>
            <span className="text-sm font-medium" style={{ color: resolvedTextColor }}>
              {t('themePreview.progress', { current: 1, total: 3 })}
            </span>
          </div>

          {/* Question */}
          <div className="space-y-4">
            <div className="text-lg font-semibold" style={{ color: resolvedTextColor }}>
              {t('themePreview.sampleQuestion1')}
            </div>

            {/* Rating options */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className="h-12 w-12 rounded-xl border-2 flex items-center justify-center font-semibold transition-all hover:scale-105"
                  style={{
                    borderColor: n === 4 ? primaryColor : `${resolvedTextColor}30`,
                    backgroundColor: n === 4 ? primaryColor : 'transparent',
                    color: n === 4 ? buttonTextColor : resolvedTextColor,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Radio options */}
            <div className="space-y-2 mt-6">
              <div className="text-lg font-semibold" style={{ color: resolvedTextColor }}>
                {t('themePreview.sampleQuestion2')}
              </div>
              {[t('themePreview.option1'), t('themePreview.option2'), t('themePreview.option3')].map((option, i) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                  style={{
                    backgroundColor: i === 0 ? `${primaryColor}15` : 'transparent',
                    border: `2px solid ${i === 0 ? primaryColor : `${resolvedTextColor}20`}`,
                  }}
                >
                  <div
                    className="h-5 w-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: i === 0 ? primaryColor : `${resolvedTextColor}40` }}
                  >
                    {i === 0 && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: primaryColor }} />}
                  </div>
                  <span style={{ color: resolvedTextColor }}>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              className="px-6 py-3 font-medium transition-all border-2"
              style={{
                borderColor: `${resolvedTextColor}30`,
                color: resolvedTextColor,
                borderRadius: buttonRadius,
              }}
            >
              {t('themePreview.previous')}
            </button>
            <button
              className="px-6 py-3 font-medium transition-all shadow-md hover:shadow-lg"
              style={{
                backgroundColor: primaryColor,
                color: buttonTextColor,
                borderRadius: buttonRadius,
              }}
            >
              {t('themePreview.next')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Card variant (compact)
  return (
    <div
      className={cn('rounded-2xl border-2 border-outline-variant/30 p-6 transition-colors', className)}
      style={{
        backgroundColor,
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-xl object-contain bg-white/90" />
        ) : (
          <div className="h-10 w-10 rounded-xl" style={{ backgroundColor: primaryColor }} />
        )}
        <div>
          <div className="h-3 w-32 rounded mb-1.5" style={{ backgroundColor: primaryColor }} />
          <div className="h-2 w-20 rounded opacity-60" style={{ backgroundColor: secondaryColor }} />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-2">
        <div className="h-2 w-full rounded" style={{ backgroundColor: resolvedTextColor, opacity: 0.3 }} />
        <div className="h-2 w-3/4 rounded" style={{ backgroundColor: resolvedTextColor, opacity: 0.3 }} />
        <div className="h-2 w-1/2 rounded" style={{ backgroundColor: resolvedTextColor, opacity: 0.3 }} />
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-2">
        <div
          className="h-8 w-20 flex items-center justify-center text-xs font-medium"
          style={{
            backgroundColor: primaryColor,
            color: buttonTextColor,
            borderRadius: buttonRadius,
          }}
        >
          {t('themePreview.primaryBtn')}
        </div>
        <div
          className="h-8 w-20 flex items-center justify-center text-xs font-medium border-2"
          style={{
            borderColor: primaryColor,
            backgroundColor: 'transparent',
            color: primaryColor,
            borderRadius: buttonRadius,
          }}
        >
          {t('themePreview.outlineBtn')}
        </div>
      </div>
    </div>
  );
}
