import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('react-dropzone')) {
              return 'vendor-dropzone';
            }
            return 'vendor';
          }
        }
      }
    },
    sourcemap: mode === 'development',
    minify: mode === 'production',
    emptyOutDir: true
  },
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      'react-dropzone'
    ]
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}));
