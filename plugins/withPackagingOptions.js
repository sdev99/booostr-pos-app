const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withPackagingOptions(config) {
  return withAppBuildGradle(config, (config) => {
    return config;
  });
};
