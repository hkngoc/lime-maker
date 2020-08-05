const path = require('path');

const HTMLPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const ManifestVersionSyncPlugin = require('webpack-manifest-version-sync-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const TerserPlugin = require('terser-webpack-plugin');
// const CompressionPlugin = require('compression-webpack-plugin');

const ENV = process.env.NODE_ENV || 'development';
const HOST = 'localhost';
const PORT = 3000;

const APP_DIR = path.resolve(__dirname, './src');
const MONACO_DIR = path.resolve(__dirname, './node_modules/monaco-editor');

module.exports = {
  mode: ENV,
  entry: {
    index: path.join(__dirname, 'src', 'index.js'),
    background: path.join(__dirname, 'src', 'background.js')
  },
  output: {
    path: path.resolve(__dirname, ENV === 'production' ? 'build' : 'dev'),
    filename: 'static/[name].js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }, {
      test: /\.(scss|sass|css)$/,
      // include: APP_DIR,
      loaders: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }, {
      test: /\.ttf$/,
      include: MONACO_DIR,
      use: ['file-loader?name=static/[name].[ext]']
    }]
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: false
    }),
    new HTMLPlugin({
      title: 'Lime',
      filename: 'index.html',
      template: './src/index.html',
      chunks: ['index'],
    }),
    new CopyPlugin([
      { from: './src/assets', to: './assets' },
      { from: './src/libs', to: './libs' },
      { from: './src/background.js', to: './background.js' },
      { from: './src/manifest.json', to: './manifest.json' },
    ]),
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      // publicPath: 'static/worker',
      filename: 'static/worker/[name].worker.js',
      languages: [
        'html',
        'css',
        'scss',
        'coffee',
        'less',
        'markdown',
        'javascript',
        'typescript'
      ],
      features: [
        '!accessibilityHelp',
        '!coreCommands',
        '!iPadShowKeyboard',
        '!toggleHighContrast',
        '!toggleTabFocusMode',
        '!dnd'
        // 'bracketMatching',
        // 'caretOperations',
        // 'clipboard',
        // 'codeAction',
        // 'codelens',
        // 'colorDetector',
        // 'comment',
        // 'find',
        // 'folding',
        // // 'fontZoom',
        // 'gotoError',
        // 'gotoLine',
        // 'gotoSymbol',
        // 'hover',
        // 'linesOperations',
        // 'links',
        // 'multicursor',
        // 'parameterHints',
        // 'referenceSearch',
        // 'rename',
        // 'smartSelect',
        // 'snippets',
        // 'suggest',
        // 'transpose',
        // 'wordHighlighter',
        // 'wordOperations',
        // 'wordPartOperations'
      ]
    }),
    // new ChromeExtensionReloader({
    //   port: 9090, // Which port use to create the server
    //   reloadPage: true, // Force the reload of the page also
    //   entries: { // The entries used for the content/background scripts
    //     contentScript: ['index'], // Use the entry names, not the file name or the path
    //     background: 'background' // *REQUIRED
    //   }
    // }),
    // new CompressionPlugin(),
    // new BundleAnalyzerPlugin()
  ],
  stats: {
    colors: true
  },
  // optimization: {
  //   minimize: true,
  //   minimizer: [new TerserPlugin()],
  // },
  devtool: ENV === 'production' ? '' : 'eval-cheap-source-map',
  devServer: {
    port: process.env.PORT || PORT,
    host: HOST,
    publicPath: '/',
    contentBase: path.join(__dirname, ENV === 'production' ? 'build' : 'dev'),
    open: true,
    // historyApiFallback: true,
    // openPage: '',
    // proxy: {
      // OPTIONAL: proxy configuration:
      // '/optional-prefix/**': { // path pattern to rewrite
      //   target: 'http://target-host.com',
      //   pathRewrite: path => path.replace(/^\/[^\/]+\//, '')   // strip first path segment
      // }
    // }
  }
}
