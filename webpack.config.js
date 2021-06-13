const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'react-attached-properties.js',
    library: 'reactAttachedProperties',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  externals: {
    react: 'react',
    uuid: 'uuid',
  },
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }],
  },
};
