import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env from both frontend/ and root ../ so a single root .env works for dev
  const frontendEnv = loadEnv(mode, process.cwd(), '');
  const rootEnv = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
  // Merge: frontend/.env takes precedence, root .env fills in missing keys
  const mergedEnv: Record<string, string> = { ...rootEnv, ...frontendEnv };

  return {
    plugins: [react()],
    define: {
      // Only expose VITE_* prefixed vars to the browser bundle
      ...Object.fromEntries(
        Object.entries(mergedEnv)
          .filter(([k]) => k.startsWith('VITE_'))
          .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
      ),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
});
