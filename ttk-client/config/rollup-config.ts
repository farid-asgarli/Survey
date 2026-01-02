import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { RollupOptions } from 'rollup';
import fs from 'fs';
import packageJson from '../package.json';

export const rollupOptions = (baseAppDir: string, configFolder: string, outFolder: string): RollupOptions => {
  const configFile = 'web.config';

  const chunks: Record<string, Array<keyof typeof packageJson.dependencies | (string & {})>> = {
    'azure-auth': ['@azure/msal-browser', '@azure/msal-common', '@azure/msal-react'],
    emotion: ['@emotion/react'],
    mantine: ['@mantine'],
    'mantine-core-hooks': ['@mantine/core', '@mantine/hooks'],
    'mantine-dates': ['@mantine/dates'],
    axios: ['axios'],
    utilities: ['clsx', 'lodash.debounce', 'uuid'],
    'date-handling': ['dayjs'],
    mobx: ['mobx', 'mobx-react-lite'],
    'react-hook-form': ['react-hook-form'],
    'react-router': ['react-router-dom', 'history'],
    particles: ['react-tsparticles', 'tsparticles-preset-links'],
    virtuoso: ['react-virtuoso'],
  };

  return {
    plugins: [
      {
        name: 'AddWebConfigFile',
        generateBundle: () => {
          const configPath = resolve(process.cwd(), configFolder);
          const outputFilePath = resolve(process.cwd(), outFolder, configFile);
          let configFileContent = fs.readFileSync(resolve(configPath, 'templates', configFile + '.template')).toString();
          configFileContent = configFileContent.replace('%BASEDIR%', baseAppDir);
          writeFile(outputFilePath, configFileContent);
        },
      },
    ],
    output: {
      manualChunks(id: string) {
        if (id.includes('node_modules')) {
          for (const key in chunks) {
            for (const packageName of chunks[key]) {
              if (id.includes(packageName)) return 'manual_chunk-' + key;
            }
          }
          // Fallback for any other libraries
          return 'vendor';
        }
      },
    },
  };
};
