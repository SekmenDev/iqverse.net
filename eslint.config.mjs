import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores([
    ".astro/**",
    "dist/**",
    "build/**",
    "html/**",
    "node_modules/**",
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
    "vitest-report/**",
    ".yarn/**",
    ".pnp.cjs",
    ".yarnrc.yml"
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
]);

export default eslintConfig;
