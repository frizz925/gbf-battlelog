const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const config = {
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
      loader: "babel-loader",
      include: [path.resolve(__dirname, "./src")],
      exclude: [path.resolve(__dirname, "./node_modules")],
    }, {
      test: /\.html$/,
      loader: "raw-loader"
    }, {
      test: /\.handlebars$/,
      loader: "handlebars-loader"
    }]
  },
  plugins: [
    new CleanWebpackPlugin([
      path.resolve(__dirname, "./extension/dist/**/*.*")
    ])
  ],
  externals: {
    "moment": "moment",
    "lodash": "_"
  }
};

if (process.env.NODE_ENV === "production") {
  console.log("Using production configuration");
  module.exports = require("./webpack.production")(config);
} else {
  module.exports = require("./webpack.development")(config);
}
