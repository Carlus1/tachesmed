module.exports = [
  // ignore common build folders
  { ignores: ['node_modules/**', 'dist/**'] },

  // Basic project-wide rules without using FlatCompat or extends
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    // Register plugin modules so flat config can resolve plugin rules
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y')
    },
    languageOptions: {
      // Provide the parser module itself (object with parse/parseForESLint) instead of a path
      parser: require('@typescript-eslint/parser'),
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
      globals: { window: 'readonly', document: 'readonly', process: 'readonly' }
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // Common hygiene
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'no-console': 'off',
      // React / TS adjustments
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
];
