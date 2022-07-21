module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        // always try to resolve types under `<root>@types` directory
        // even if it doesn't contain any source code, like `@types/unist`
        alwaysTryTypes: true,
        project: '**/tsconfig.json',
      },
      node: {
        paths: ['src'],
        project: ['tsconfig.json', 'package/tsconfig.json'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
