const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  devtool: process.env.NODE_ENV === "production" ? false : "eval-source-map",
  entry: "./src/main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: "raw-loader",
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml|glsl)$/i,
        use: "file-loader",
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.join(__dirname, "dist/**/*")],
    }),
    new webpack.DefinePlugin({
      "typeof CANVAS_RENDERER": JSON.stringify(true),
      "typeof WEBGL_RENDERER": JSON.stringify(true),
      "typeof WEBGL_DEBUG": JSON.stringify(true),
      "typeof EXPERIMENTAL": JSON.stringify(true),
      "typeof PLUGIN_3D": JSON.stringify(false),
      "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
      "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
      "typeof FEATURE_SOUND": JSON.stringify(true),
    }),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CopyPlugin({
      patterns: [{ from: "public", to: "." }],
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, "../dist"),
    },
    port: 8080,
    open: true,
    hot: true,
    liveReload: true,
    watchFiles: ["src/**/*"],
    compress: true,
    historyApiFallback: true,
    client: {
      overlay: true,
      progress: true,
    },
  },
};
