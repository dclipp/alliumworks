const path = require('path');

module.exports = env => {
  let noModule = true;
  // try {
  //   noModule = env.no_module === true;
  // } catch (ex) { }
  return {
    mode: "production",// : "production",
    entry: "./src/cmodule",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.js",
      // library: noModule ? "cm4a_v2" : undefined,
      library: "cm4a_v2",
      libraryTarget: noModule ? "var" : "commonjs"
    },
    optimization: {
      minimize: true
    },
    target: "web",
    // devtool: "source-map"// DEV ? "source-map" : undefined
  }
}