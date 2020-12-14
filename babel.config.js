module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      "@babel/preset-env",
      {
        // targets: ">= 0.25%, not dead"
        targets: {
          node: "current",
        },
      },
    ],
  ];
  const plugins = [];
  const comments = false;

  function shouldPrintComment(comment) {
    return /^#/.test(comment.trim());
  }

  return {
    shouldPrintComment,
    minified: true,
    comments,
    presets,
    plugins,
  };
};
