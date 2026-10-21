import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

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
      'src/js/**/*.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
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
    files: ['src/js/options.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['**/convert', '**/convert.ts', '../pure/convert', '../pure/convert.ts'],
            message: 'options does not import the converter',
          },
          {
            group: ['../pure/css-size', '../pure/css-size.ts'],
            importNames: ['createParams'],
            message: 'options imports canonicalSize and decideSave',
          },
        ],
      }],
    },
  },
  {
    files: ['src/js/background.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../pure/*', '../pure/**'],
            message: 'background does not import pure modules',
          },
        ],
      }],
    },
  },
  {
    files: ['src/js/convert-to-img-tag.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../pure/css-size', '../pure/css-size.ts', '**/css-size', '**/css-size.ts'],
            message: 'the click script imports the converter',
          },
        ],
      }],
    },
  },
  {
    files: ['src/pure/css-size.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['*', '../*', './*', '../**'],
            message: 'css-size has no imports',
          },
        ],
      }],
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
