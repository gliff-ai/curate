import { defineConfig } from "vite";
import { ViteAliases } from "vite-aliases";
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: "examples/samples",
  build: {
    minify: false, // TODO maybe?
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      external: [],
      output: {
        globals: {},
      },
    },
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  plugins: [ViteAliases()],
  server: {
    port: parseInt(process.env.PORT) || 3000,
    hmr: {
      port: process.env.PORT || process.env.CODESPACES ? 443 : 3000
    }
  }
});