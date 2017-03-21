const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const rootFilePath = "src/com/mendix/widget/custom/progresscircle/";
const fileName = "ProgressCircle";

module.exports = {
    entry: "./src/components/ProgressCircleContainer.ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: rootFilePath + fileName + ".js",
        libraryTarget:  "umd"
    },
    resolve: {
        extensions: [ "", ".ts", ".js", ".json" ],
        alias: {
            "tests": path.resolve(__dirname, "./tests")
        }
    },
    errorDetails: true,
    module: {
        loaders: [
            { test: /\.ts$/, loader: "ts-loader" },
            { test: /\.json$/, loader: "json" },
            { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") }
        ]
    },
    devtool: "source-map",
    externals: [ "react", "react-dom" ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/**/*.js" },
            { from: "src/**/*.xml" }
        ], {
            copyUnmodified: true
        }),
        new ExtractTextPlugin("./" + rootFilePath + "ui/" + fileName + ".css")
    ],
    watch: true
};
