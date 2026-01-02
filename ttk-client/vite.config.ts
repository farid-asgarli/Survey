import path from 'path';
import { loadEnv, UserConfig } from 'vite';
import packageJson from './package.json';
import { vitePlugins } from './config/vite-plugins';
import { rollupOptions } from './config/rollup-config';
import fs from 'fs';
import axios from 'axios';
import * as https from 'https';

const setupSassVariables = async (env: Record<string, string>) => {
  const tempContent = await fs.promises.readFile(path.resolve('config/templates', 'scss-variables.template'));
  return tempContent.toString().replace('<*prefix*>', env.VITE_CLS_PREFIX);
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const setupLocalization = async (env: Record<string, string>) => {
  try {
    const res = await axios.get(env.VITE_BASE_API_URI + 'Localization/GetResources', { httpsAgent });
    const content = res?.data?.data;
    if (content) await fs.promises.writeFile(path.resolve('src', 'localization', 'locale-az.json'), JSON.stringify(content, null, 4));
    return content;
  } catch (error) {
    console.log(error);
  }
};

export default async (config: UserConfig): Promise<UserConfig> => {
  const env = loadEnv(config.mode, process.cwd());

  await setupLocalization(env);

  const scssContent = await setupSassVariables(env);

  const isDev = process.env.NODE_ENV === 'development';
  const baseAppPath = packageJson.homepage;
  const baseAppPathRel = !isDev ? '/' + baseAppPath : undefined;

  const outputFolder = 'build';
  const configFolder = 'config';

  return {
    base: baseAppPathRel,
    build: {
      outDir: './' + outputFolder,
      rollupOptions: rollupOptions(baseAppPath, configFolder, outputFolder),
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: scssContent,
        },
      },
    },
    define: {
      'import.meta.env.APP_BASE_PATH': JSON.stringify(baseAppPathRel),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    },
    plugins: vitePlugins(env),
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
    },
  };
};
