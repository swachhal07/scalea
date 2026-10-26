import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: { port: 5173 },
  // The build-time render (scripts/prerender.mjs) needs only code, not the public files.
  build: { copyPublicDir: !isSsrBuild },
}));
