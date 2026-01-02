import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { MantineThemeConfig } from './ThemeConfig';
import { Storage } from '@src/utils/storage';

export default function AppUiProvider(props: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>((Storage.read('color-scheme') as ColorScheme) ?? 'dark');

  useEffect(() => {
    Storage.write('color-scheme', colorScheme);
    document.body.setAttribute('data-theme', colorScheme);
  }, [colorScheme]);

  const toggleColorScheme = (value?: ColorScheme) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider {...MantineThemeConfig} theme={{ ...MantineThemeConfig.theme, colorScheme }}>
        {props.children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
