import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/', '.astro/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-strict'],
  {
    rules: {
      'no-console': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': 'allow-with-description', 'ts-expect-error': 'allow-with-description' },
      ],
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      'astro/no-set-html-directive': 'error',
    },
  },
  {
    files: ['src/**/*.tsx'],
    ...jsxA11y.configs.strict,
    languageOptions: {
      ...jsxA11y.configs.strict.languageOptions,
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/no-danger': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'dangerouslySetInnerHTML dilarang (CLAUDE.md §4 Keamanan).',
        },
      ],
    },
  },
  {
    files: ['scripts/**', '*.config.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    // Script CLI melaporkan hasil lewat stdout/stderr.
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
  prettier,
);
