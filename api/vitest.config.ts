import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@core": path.resolve(__dirname, "src/core"),
      "@db": path.resolve(__dirname, "src/db"),
      "@modules": path.resolve(__dirname, "src/modules"),
      "@int": path.resolve(__dirname, "src/integrations"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      reporter: ["text", "json-summary"],
    },
  },
});
