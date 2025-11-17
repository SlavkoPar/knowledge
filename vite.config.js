import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import path from 'path';

export default defineConfig({
   plugins: [react()],
   'base': '/knowledge',
   resolve: {
      alias: {
         '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
         '@': path.resolve(__dirname, './src') // Example: '@' maps to the 'src' directory
      },
   },
   // ... other Vite configurations
});