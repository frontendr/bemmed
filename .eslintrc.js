module.exports = {
  extends: ["plugin:prettier/recommended"],
  env: {
    browser: false,
    node: true,
    es6: true,
  },
  parser: "@babel/eslint-parser",
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
  plugins: ["babel", "prettier"],
  rules: {
    "no-console": 2,
  },
};
