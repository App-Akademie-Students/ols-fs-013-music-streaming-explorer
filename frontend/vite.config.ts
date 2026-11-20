import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const proxy = { '/api': 'http://127.0.0.1:8000' };

export default defineConfig({
  // Resolve the root consistently when the repository is opened through a Windows junction.
  root: fileURLToPath(new URL('.', import.meta.url)),
  optimizeDeps: { noDiscovery: true },
  server: { proxy },
  preview: { proxy },
});

