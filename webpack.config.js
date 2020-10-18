"use strict"
const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const ExtensionReloader = require("webpack-extension-reloader")

const sourceRootPath = path.join(__dirname, "src")
const distRootPath = path.join(__dirname, "dist")
const indexHtmlPath = path.join(sourceRootPath, "index.html")
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : "development"
const webBrowser = process.env.WEB_BROWSER ? process.env.WEB_BROWSER : "chrome"

module.exports = {
  watch: nodeEnv === "watch",
  entry: {
    "content-script": path.join(sourceRootPath, "content", "index.ts"),
    background: path.join(sourceRootPath, "background", "index.ts"),
    options: path.join(sourceRootPath, "options", "index.tsx"),
    popup: path.join(sourceRootPath, " popup", "index.tsx"),
  },
  output: {
    path: distRootPath,
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      // Inject compiled options.js
      template: indexHtmlPath,
      inject: "body",
      filename: "options.html",
      title: "Last.fm edits | Options",
      chunks: ["options"],
    }),
    new HtmlWebpackPlugin({
      // Inject compiled popup.js
      template: indexHtmlPath,
      inject: "body",
      filename: "popup.html",
      title: "Last.fm edits | Popup",
      chunks: ["popup"],
    }),
    new CopyWebpackPlugin([
      // Copy static stuff
      {
        from: path.join(sourceRootPath, "assets"),
        to: path.join(distRootPath, "assets"),
        test: /\.(jpg|jpeg|png|gif|svg)?$/,
      },
      {
        from: path.join(sourceRootPath, "manifest.json"),
        to: path.join(distRootPath, "manifest.json"),
        toType: "file",
      },
    ]),
    new webpack.DefinePlugin({
      // Define env values
      NODE_ENV: JSON.stringify(nodeEnv),
      WEB_BROWSER: JSON.stringify(webBrowser),
    }),
    new ExtensionReloader({
      port: 9090,
      reloadPage: true,
      entries: {
        "content-script": "content-script",
        background: "background",
        extensionPage: ["popup", "options"],
      },
    }),
    nodeEnv === "production"
      ? new CleanWebpackPlugin()
      : () => {
          this.apply = () => {}
        },
  ],
}
