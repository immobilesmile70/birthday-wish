import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000
  },
  base: "/",
  build: {
    assetsDir: 'assets',
    outDir: "dist",
    minify: "terser",
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
      mangle: true,
    },
    emptyOutDir: true,
  }
});
