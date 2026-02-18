import { defineConfig } from 'vite';
import { resolve } from 'path';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');
const entryPath = resolve(__dirname, 'src/js/Lazy.js');

export default defineConfig({
    root,
    publicDir: 'public',
    plugins: [],
    build: {
      lib: {
        entry: entryPath,
        name: 'Lazy',
        formats: ['es', 'umd'],
        fileName: (format, name) => `${name}.${format}.js`,
      },
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        external: [],
        output: {
          name: 'Lazy',
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@js': resolve(__dirname, './src/js'),
      },
    },
});
