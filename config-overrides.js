module.exports = function override(config) {
  config.optimization.concatenateModules = false;

  // Must come before other rules so node_modules ESM can resolve react/jsx-runtime.
  config.module.rules = [
    {
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    },
    ...config.module.rules,
  ];

  return config;
};
