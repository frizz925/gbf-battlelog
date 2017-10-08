const path = require("path");

module.exports = {
  devtool: "cheap-source-map",
  entry: {
    background: path.resolve(__dirname, "./src/background.js"),
    contentscript: path.resolve(__dirname, "./src/contentscript.js"),
    panel: path.resolve(__dirname, "./src/panel.js"),
  },
  output: {
    path: path.resolve(__dirname, "./extension/dist"),
    filename: "[name].js"
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: "babel-loader"
    }, {
      test: /\.html$/,
      loader: "raw-loader"
    }, {
      test: /\.handlebars$/,
      loader: "handlebars-loader"
    }]
  }
};
