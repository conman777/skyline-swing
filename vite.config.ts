import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [],
  server: {
    port: 5179,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
