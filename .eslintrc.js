/**
 * ESLint configuration for LogoHub project
 *
 * Supports JavaScript (API) and TypeScript (packages) with React support
 * Uses legacy configuration format for ESLint 8.x compatibility
 */

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  overrides: [
    // JavaScript files (API)
    {
      files: ['api/**/*.js', 'tools/**/*.js'],
      env: {
        node: true,
      },
      extends: ['eslint:recommended'],
      rules: {
        'no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        'no-console': 'warn',
        'prefer-const': 'error',
        // Turn off all TypeScript rules for JavaScript files
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    // TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
    // React-specific files
    {
      files: ['packages/react/**/*.tsx', 'packages/react/**/*.ts'],
      env: {
        browser: true,
      },
      rules: {
        'react/react-in-jsx-scope': 'off', // Not needed in React 17+
        'react/prop-types': 'off', // Using TypeScript instead
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.vercel/',
    'docs/.vitepress/cache/',
    'docs/.vitepress/dist/',
    'coverage/',
    '*.config.js',
    'tools/',
  ],
};
