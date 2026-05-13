import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
  },
  {
    entry: ["src/core.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    outDir: "dist",
  },
  {
    entry: ["src/react.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    outDir: "dist",
    external: ["react", "react-dom"],
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
  },
  {
    entry: ["tailwind.preset.ts"],
    format: ["cjs", "esm"],
    outDir: "dist",
    dts: true,
  },
]);
