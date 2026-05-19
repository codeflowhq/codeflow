import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const graphvizPackages = new Set(["d3-graphviz", "d3-transition"]);
const editorPackages = new Set(["@monaco-editor/react"]);

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if ([...graphvizPackages].some((pkg) => id.includes(`/node_modules/${pkg}/`))) {
            return "graphviz-runtime";
          }
          if ([...editorPackages].some((pkg) => id.includes(`/node_modules/${pkg}/`))) {
            return "editor-runtime";
          }
          return undefined;
        },
      },
    },
  },
});
