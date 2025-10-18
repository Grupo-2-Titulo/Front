// eslint.config.js
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tailwindPlugin from "eslint-plugin-tailwindcss";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      "jsx-a11y": jsxA11y,
      tailwindcss: tailwindPlugin, // 👈 nombre del plugin tal cual lo usan las reglas
    },
    settings: {
      react: { version: "detect" },
      tailwindcss: { callees: ["classnames", "clsx", "ctl"] },
    },
    rules: {
      // --- Reglas base ---
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended[1].rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // --- Tailwind (manual, sin preset) ---
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "off",

      // --- Personalizaciones ---
      "react/react-in-jsx-scope": "off",
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
];
