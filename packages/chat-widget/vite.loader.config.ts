import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/loader.ts',
      name: 'ExactlyChatLoader',
      formats: ['iife'],
      fileName: () => 'chat-widget.js',
    },
    emptyOutDir: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
