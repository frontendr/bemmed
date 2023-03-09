module.exports = {
  root: true,
  extends: ["prettier", "plugin:@typescript-eslint/recommended"],
  env: {
    browser: false,
    node: true,
    es6: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
    },
  },
  globals: {
    __DEV__: true,
    __SERVER__: true,
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-console": 2,
  },
};
