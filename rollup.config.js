import {defineConfig} from "rollup";
import babel from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";

const defaults = {
  input: "src/bemmed.js",
};

export default defineConfig([
  // CommonJS
  Object.assign({}, defaults, {
    output: {file: "lib/bemmed.js", format: "cjs", indent: false, exports: "named"},
    external: ["@babel/runtime"],
    plugins: [
      babel({
        plugins: [["@babel/plugin-transform-runtime", {}]],
        babelHelpers: "runtime",
      }),
    ],
  }),

  // ES
  Object.assign({}, defaults, {
    output: {file: "es/bemmed.js", format: "es", indent: false, exports: "named"},
    external: ["@babel/runtime"],
    plugins: [
      babel({
        plugins: [["@babel/plugin-transform-runtime", {useESModules: true}]],
        babelHelpers: "runtime",
      }),
    ],
  }),

  // ES for Browsers
  Object.assign({}, defaults, {
    output: {file: "es/bemmed.mjs", format: "es", indent: false, exports: "named"},
    plugins: [
      babel({
        exclude: "node_modules/**",
        skipPreflightCheck: true,
        babelHelpers: "bundled",
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      }),
    ],
  }),
  // UMD Development
  Object.assign({}, defaults, {
    output: {
      file: "dist/bemmed.js",
      format: "umd",
      name: "bemmed",
      indent: false,
      exports: "named",
    },
    plugins: [
      babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
      }),
    ],
  }),
  // UMD Production
  Object.assign({}, defaults, {
    output: {
      file: "dist/bemmed.min.js",
      format: "umd",
      name: "bemmed",
      indent: false,
      exports: "named",
    },
    plugins: [
      babel({
        exclude: "node_modules/**",
        skipPreflightCheck: true,
        babelHelpers: "bundled",
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      }),
    ],
  }),
]);
