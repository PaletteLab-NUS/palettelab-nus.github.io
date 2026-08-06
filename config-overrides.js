module.exports = function override(config) {
  // Prevent webpack from rewriting Mapbox's shared main/worker scope.
  config.optimization.concatenateModules = false;

  config.module.rules = [
    {
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    },
    ...config.module.rules,
  ];

  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
  if (oneOfRule) {
    oneOfRule.oneOf.unshift({
      test: /\.ya?ml$/,
      use: "yaml-loader",
    });
  }

  return config;
};
