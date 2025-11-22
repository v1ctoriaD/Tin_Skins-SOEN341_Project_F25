import js from '@eslint/js'
import parser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  // ---------------------------------------------------------
  // GLOBAL IGNORES — prevents linting Prisma, WASM, dist, etc.
  // ---------------------------------------------------------
  {
    ignores: [
      'node_modules/',
      'backend/generated/',
      'backend/prisma/generated/',
      'backend/dist/',
      'backend/build/',
      'frontend/dist/',
      'frontend/build/',
      '**/*.min.js',
    ],
  },

  // ---------------------------------------------------------
  // FRONTEND (React) CONFIG
  // ---------------------------------------------------------
  {
    files: ['frontend/src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser,
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FileReader: 'readonly',
        Image: 'readonly',
        Blob: 'readonly',
        setTimeout: 'readonly',
        process: 'readonly', // needed for Vite env variables
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
    },
  },

  // ---------------------------------------------------------
  // BACKEND (Node + TypeScript)
  // ---------------------------------------------------------
  {
    files: ['backend/src/**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
    },
  },

  // ---------------------------------------------------------
  // JEST TESTS — fixes the "beforeAll is not defined" errors
  // ---------------------------------------------------------
  {
    files: ['frontend/src/__tests__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        global: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        // Jest globals:
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
  },
  {
    files: [
      'frontend/src/__tests__/**/*.{js,jsx,ts,tsx}',
      'backend/src/__tests__/**/*.{js,ts}',
      'frontend/src/setupTests.js',
    ],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        jest: 'readonly',
        test: 'readonly',
      },
    },
  },
]
