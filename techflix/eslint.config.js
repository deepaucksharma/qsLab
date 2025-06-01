import reactPlugin from 'eslint-plugin-react';

export default [
  {
    ignores: ['node_modules/**', 'public/**'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module'
    },
    plugins: {
      react: reactPlugin
    },
    rules: {},
  },
];
