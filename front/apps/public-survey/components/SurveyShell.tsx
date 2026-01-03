/**
 * Survey Shell - Layout wrapper with theme support
 */

'use client';

import { useMemo, type ReactNode } from 'react';
import type { PublicSurveyTheme } from '@survey/types';
import { generateThemeCSSVariables } from '@survey/ui';

interface SurveyShellProps {
  theme?: PublicSurveyTheme;
  children: ReactNode;
}

export function SurveyShell({ theme, children }: SurveyShellProps) {
  const themeStyles = useMemo(() => {
    if (!theme) return {};
    return generateThemeCSSVariables(theme);
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-background" style={themeStyles}>
      {children}
    </div>
  );
}
