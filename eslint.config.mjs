import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default tseslint.config(
  {
    ignores: [
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
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-useless-assignment": "off",
      "no-restricted-globals": [
        "error",
        { "name": "isNaN", "message": "Use Number.isNaN instead." },
        { "name": "parseInt", "message": "Use Number.parseInt instead." }
      ]
    }
  }
);
