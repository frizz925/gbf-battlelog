const webpack = require("webpack");
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");
const merge = require("webpack-merge");
module.exports = function(common) {
  return merge(common, {
    plugins: [
      new BabelMinifyPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production")
      })
    ],
  });
};
