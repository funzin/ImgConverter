import js from '@eslint/js'
import globals from 'globals'

const sharedGlobals = {
  ...globals.browser,
  chrome: 'readonly',
}

export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '.cursor/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: sharedGlobals,
    },
  },
  {
    files: ['spec/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...sharedGlobals,
        ...globals.node,
        chrome: 'writable',
        mockStorageData: 'writable',
        convertToImgTag: 'readonly',
        convertOnlySelectionToImgTag: 'readonly',
        createParams: 'readonly',
        createMarkdownImages: 'readonly',
        loadStorage: 'readonly',
        setText: 'writable',
        self: 'readonly',
      },
    },
  },
  {
    files: ['spec/helpers/**/*.js', 'spec/browser/**/*.js', 'playwright.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.browser,
        React: 'readonly',
        ReactDOM: 'readonly',
      },
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
]
