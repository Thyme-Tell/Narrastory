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
      external: [
        'react-dropzone'
      ],
      output: {
        manualChunks(id) {
          // Create a chunk for each major dependency
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
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
    include: ['@supabase/supabase-js']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}));
