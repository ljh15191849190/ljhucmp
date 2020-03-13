'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const meta = require("../package.json")

const copyright = `${meta.name} v${meta.version} \nCopyright ${(new Date).getFullYear()} \nAuthors ${meta.author}`

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  mode: 'production',
  output: {
    path: config.build.assetsRoot,
    publicPath: config.build.publicPath,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  optimization: {
    // minimizer: true,
    providedExports: true,
    usedExports: true,
    //识别package.json中的sideEffects以剔除无用的模块，用来做tree-shake
    //依赖于optimization.providedExports和optimization.usedExports
    sideEffects: true,
    //取代 new webpack.optimize.ModuleConcatenationPlugin()
    concatenateModules: true,
    //取代 new webpack.NoEmitOnErrorsPlugin()，编译错误时不打印输出资源。
    noEmitOnErrors: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: config.build.productionSourceMap,
        cache: true,
        parallel: true
      }),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        // cssProcessorOptions: config.build.productionSourceMap
        //   ? { safe: true, map: { inline: false } }
        //   : { safe: true }
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
        canPrint: true
      }),
    ],
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          name: 'vendors',
        },
        'async-vendors': {
          test: /[\\/]node_modules[\\/]/,
          minChunks: 2,
          chunks: 'async',
          name: 'async-vendors'
        },
        commons: {
          chunks: 'all',
          minChunks: 2,
          maxInitialRequests: 5, // The default limit is too small to showcase the effect
          minSize: 0, // This is example is too small to create commons chunks
          name: 'common'
        }
      }
    },
    //提取webpack运行时的代码
    runtimeChunk: { name: 'runtime' }
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: copyright
    }),

    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // set the following option to `true` if you want to extract CSS from
      // codesplit chunks into this main css file as well.
      // This will result in *all* of your app's CSS being loaded upfront.
      allChunks: false,
    }),

    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.pug',
      inject: true,
      favicon: 'favicon.ico',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }),
    new PreloadWebpackPlugin({
      rel: 'prefetch',
    }),
    new PreloadWebpackPlugin({
      rel: 'preload'
    }),
    // keep module.id stable when vender modules does not change
    new webpack.HashedModuleIdsPlugin(),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
