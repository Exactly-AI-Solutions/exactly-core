import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Plugin to inject CSS into JavaScript bundle for Shadow DOM
 */
function injectCssPlugin(): Plugin {
  let cssContent = '';

  return {
    name: 'inject-css',
    buildStart() {
      // Read CSS file at build start
      const cssPath = resolve(__dirname, 'src/styles.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    },
    transform(code, id) {
      if (id.endsWith('index.tsx')) {
        // Replace the placeholder in getStyles() with actual CSS
        return code.replace(
          'INJECT_CSS_PLACEHOLDER',
          cssContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')
        );
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), injectCssPlugin()],
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'ExactlyChat',
      formats: ['umd'],
      fileName: () => 'chat-widget.umd.js',
    },
    rollupOptions: {
      // Bundle everything - no external deps for embed
      external: [],
    },
    cssCodeSplit: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
