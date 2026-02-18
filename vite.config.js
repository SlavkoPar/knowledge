import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import path from 'path';

export default defineConfig({
   plugins: [react()],
   'base': '/knowledge',
   build: {
      sourcemap: true
   },
   resolve: {
      alias: {
         '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
         '@': path.resolve(__dirname, './src') // Example: '@' maps to the 'src' directory
      },
   },
   css: {
    preprocessorOptions: {
      scss: {
        // Silences warnings from node_modules
        quietDeps: true,
        // Specifically silence the color-functions deprecation
        silenceDeprecations: ['color-functions', 'import', 'global-builtin'],
      }
    }
  }
});