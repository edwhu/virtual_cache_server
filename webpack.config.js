const webpack = require('webpack');
const path = require('path');
const isDeveloping = process.env.NODE_ENV !== 'production';
//change entry
let entry = './src/components/App.js'
if(isDeveloping){
	entry = [
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './src/components/App.js'
  ]
}
//console.log('entry is', entry);
module.exports = {
  devtool: 'eval',
  entry,
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, 'src')
    }]
  }
};
