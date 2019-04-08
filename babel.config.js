module.exports = function(api) {
  api.cache(true);

  const presets = [
    [
      "@babel/preset-env",
      {
        // targets: ">= 0.25%, not dead"
        targets: {
          node: "current"
        }
      }
    ]
  ];
  const plugins = [];

  return {
    comments: false,
    compact: true,
    presets,
    plugins
  };
};
