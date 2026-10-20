import js from '@eslint/js'
import globals from 'globals'

const sharedGlobals = {
  ...globals.browser,
  chrome: 'readonly',
}

export default [
  { ignores: ['node_modules/**', 'coverage/**', '.cursor/**'] },
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
    files: ['spec/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...sharedGlobals,
        chrome: 'writable',
        mockStorageData: 'writable',
        __html__: 'readonly',
        convertToImgTag: 'readonly',
        convertOnlySelectionToImgTag: 'readonly',
        createParams: 'readonly',
        createMarkdownImages: 'readonly',
        loadStorage: 'readonly',
        setText: 'writable',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        spyOn: 'readonly',
        jasmine: 'readonly',
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
  {
    files: ['karma.conf.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },
]
