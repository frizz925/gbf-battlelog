const merge = require("webpack-merge");
module.exports = function(config) {
  return merge(config, {
    devtool: "cheap-source-map",
  });
};
