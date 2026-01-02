import { splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { createHtmlPlugin } from 'vite-plugin-html';

export const vitePlugins = (env: Record<string, string>) => [
  react(),
  createHtmlPlugin({
    minify: true,
    inject: {
      data: {
        title: env.VITE_APP_TITLE?.concat(' - ', env.VITE_APP_ENV_NAME ?? ''),
      },
    },
  }),
  tsconfigPaths(),
  splitVendorChunkPlugin(),
];
