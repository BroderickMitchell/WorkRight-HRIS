import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/tailwind.ts"],
  format: ["cjs", "esm"],
  dts: { resolve: true },
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  target: "es2020",
  tsconfig: "tsconfig.json",
  external: ["react", "react-dom", "next"],
});
