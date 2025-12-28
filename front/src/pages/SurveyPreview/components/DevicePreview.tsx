import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { getIsolatedThemeVariables } from '@/utils/themeApplication';
import type { PublicSurvey, PublicQuestion } from '@/types/public-survey';
import type { DevicePreset } from '../types';
import { PreviewContent } from './PreviewContent';
import type { PreviewContentProps } from '../types';

interface DevicePreviewProps extends Omit<PreviewContentProps, 'survey' | 'visibleQuestions'> {
  survey: PublicSurvey;
  /** Questions filtered by conditional logic (only visible ones) */
  visibleQuestions: PublicQuestion[];
  selectedPreset: DevicePreset;
  effectiveDimensions: { width: number; height: number };
  zoom: number;
  themeMode: 'light' | 'dark' | 'system';
  isFullscreen: boolean;
}

export function DevicePreview({
  survey,
  visibleQuestions,
  selectedPreset,
  effectiveDimensions,
  zoom,
  themeMode,
  isFullscreen,
  ...previewContentProps
}: DevicePreviewProps) {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const isResponsive = selectedPreset.id === 'responsive';

  return (
    <div className={cn('flex-1 flex items-center justify-center p-4', isFullscreen && 'p-0')}>
      <div
        ref={previewContainerRef}
        className={cn(
          'relative bg-surface transition-all duration-300 flex flex-col overflow-hidden',
          // Only show frame styling when not in fullscreen
          !isFullscreen && 'rounded-2xl border-2 border-outline-variant/40',
          !isFullscreen && selectedPreset.category === 'mobile' && 'rounded-4xl',
          !isFullscreen && selectedPreset.category === 'tablet' && 'rounded-3xl',
          previewContentProps.showKeyboardHints && !isFullscreen && 'ring-2 ring-info/50 ring-offset-2',
          // Fullscreen takes full space
          isFullscreen && 'w-full h-full'
        )}
        style={
          isFullscreen
            ? undefined
            : {
                width: isResponsive ? '100%' : effectiveDimensions.width * (zoom / 100),
                maxWidth: isResponsive ? '100%' : effectiveDimensions.width * (zoom / 100),
                height: isResponsive ? '100%' : effectiveDimensions.height * (zoom / 100),
                minHeight: isResponsive ? undefined : 300,
              }
        }
      >
        {/* Device chrome for mobile/tablet - hidden in fullscreen */}
        {selectedPreset.category !== 'desktop' && !isResponsive && !isFullscreen && (
          <div className="shrink-0 h-6 bg-surface-container flex items-center justify-center border-b border-outline-variant/20 rounded-t-[inherit]">
            {selectedPreset.category === 'mobile' && <div className="w-16 h-1 bg-outline-variant/40 rounded-full" />}
            {selectedPreset.category === 'tablet' && <div className="w-2 h-2 bg-outline-variant/40 rounded-full" />}
          </div>
        )}

        {/* Preview content - theme applied only to this container */}
        <div
          className={cn(
            '@container flex-1 overflow-y-auto overflow-x-hidden',
            selectedPreset.category !== 'desktop' && !isResponsive && !isFullscreen && 'pb-4',
            'scrollbar-thin scrollbar-thumb-outline-variant/30 scrollbar-track-transparent',
            themeMode === 'dark' && 'dark'
          )}
          style={{
            ...getIsolatedThemeVariables(survey.theme),
            backgroundColor: themeMode === 'dark' ? '#141218' : survey.theme?.backgroundColor,
            color: themeMode === 'dark' ? '#e6e0e9' : survey.theme?.textColor,
            fontFamily: survey.theme?.fontFamily,
          }}
          data-theme={themeMode === 'dark' ? 'dark' : undefined}
        >
          <PreviewContent survey={survey} visibleQuestions={visibleQuestions} {...previewContentProps} />
        </div>

        {/* Device home indicator for mobile - hidden in fullscreen */}
        {selectedPreset.category === 'mobile' && !isResponsive && !isFullscreen && (
          <div className="shrink-0 h-5 flex items-center justify-center border-t border-outline-variant/20">
            <div className="w-24 h-1 bg-outline-variant/40 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
