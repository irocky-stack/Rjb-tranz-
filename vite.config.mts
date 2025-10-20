import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Temporarily disable GitHub Spark plugins in development to prevent CORS issues
    ...(process.env.NODE_ENV === 'development' ? [] : [
      createIconImportProxy() as PluginOption,
      sparkPlugin() as PluginOption,
    ]),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'esnext',
    rollupOptions: {
      input: 'index.html',
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  // Ensure relative asset paths when packaged under Electron (file://)
  base: './',
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  preview: {
    allowedHosts: ['rjb-tranz-remittance.onrender.com']
  }
});
