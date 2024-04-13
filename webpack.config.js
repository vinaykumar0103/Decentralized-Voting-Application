// webpack.config.js
module.exports = {
  // ... other configurations
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      // ... any other polyfills you might need
    },
  },
  // ... other configurations
};
