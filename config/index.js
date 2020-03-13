'use strict'
// Template version: 1.2.5
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
    dev: {
        // Paths
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        proxyTable: {
            '/webSocket': {
                target: 'http://192.168.3.127:9090/webSocket',
                changeOrigin: true,
                ws: true,
                secure: false,
                pathRewrite: {
                    '^/webSocket': '',
                }
            },
            '/at': {
                target: 'http://192.168.3.127:9090/at',
                // target: 'http://192.168.3.127:9090/at',
                changeOrigin: true,
                pathRewrite: {
                    '^/at': ''
                }
            },
            '/ucmp3': {
                // target: 'http://192.168.3.28:8080/ucmp3',
                target: 'http://192.168.3.127:9090/ucmp3',
                // target: 'http://192.168.3.32:8080/ucmp3',
                changeOrigin: true,
                pathRewrite: {
                    '^/ucmp3': ''
                }
            },
            '/iaasmgt3': {
                // target: 'http://192.168.124.20:8080/iaasmgt3',
                target: 'http://192.168.3.127:9090/iaasmgt3',
                changeOrigin: true,
                pathRewrite: {
                    '^/iaasmgt3': ''
                }
            },
            '/guardian': {
                target: 'http://192.168.3.127:9090/guardian',
                // target: 'http://192.168.124.48:7070/guardian',
                changeOrigin: true,
                pathRewrite: {
                    '^/guardian': ''
                }
            },
            '/gd/v2': {
                target: 'http://192.168.3.127:9090/gd/v2',
                changeOrigin: true,
                pathRewrite: {
                    '^/gd/v2': ''
                }
            },
            '/billing3': {
                target: 'http://192.168.3.127:9090/billing3',
                // target: 'http://192.168.124.20:8080/billing3',
                changeOrigin: true,
                pathRewrite: {
                    '^/billing3': ''
                }
            },
            '/ecs': {
                target: 'http://192.168.3.127:9090/ecs',
                // target: 'http://192.168.124.20:8080/ecs',
                changeOrigin: true,
                pathRewrite: {
                    '^/ecs': ''
                }
            },
            '/volume': {
                target: 'http://192.168.3.127:9090/volume',
                // target: 'http://192.168.124.20:8080/volume',
                changeOrigin: true,
                pathRewrite: {
                    '^/volume': ''
                }
            },
            '/bpm3': {
                target: 'http://192.168.3.127:9090/bpm3',
                // target: 'http://192.168.3.71:8080/bpm3',
                changeOrigin: true,
                pathRewrite: {
                    '^/bpm3': ''
                }
            },

            '/api/ipam': {
                target: 'http://192.168.3.127:9090/api/ipam',
                // target: 'http://192.168.3.82:9090/api/ipam',
                changeOrigin: true,
                pathRewrite: {
                    '^/api/ipam': ''
                }
            },
            '/stats': {
                target: 'http://192.168.3.127:9090/stats',
                // target: 'http://192.168.3.127:9090/stats',
                // target: 'http://192.168.3.61:8080/stats',
                changeOrigin: true,
                pathRewrite: {
                    '^/stats': ''
                }
            },
            '/alerts': {
                target: 'http://192.168.3.127:9090/alerts',
                // target: 'http://192.168.3.72:7070/alerts',
                changeOrigin: true,
                pathRewrite: {
                    '^/alerts': ''
                }
            },
            '/qingcloud': {
                target: 'http://192.168.3.127:9090/qingcloud',
                // target: 'http://192.168.3.150:9090/qingcloud',
                changeOrigin: true,
                pathRewrite: {
                    '^/qingcloud': ''
                }
            },
            '/ucmps/jump': {
                target: 'http://192.168.3.105:8888/ucmps/jump',
                changeOrigin: true,
                pathRewrite: {
                    '^/ucmps/jump': ''
                }
            },
            '/vmware': {
                target: 'http://192.168.3.127:9090/vmware',
                changeOrigin: true,
                pathRewrite: {
                    '^/vmware': ''
                }
            },
            '/aliyun': {
                target: 'http://192.168.3.127:9090/aliyun',
                changeOrigin: true,
                pathRewrite: {
                    '^/aliyun': ''
                }
            },
            '/grafana': {
                target: 'http://192.168.3.127:9090/grafana',
                changeOrigin: true,
                pathRewrite: {
                    '^/grafana': ''
                }
            },
            '/nas': {
              target: 'http://192.168.3.127:9090/nas',
              changeOrigin: true,
              pathRewrite: {
                  '^/nas': ''
                }
            },
            '/f5': {
                target: 'http://192.168.3.127:9090/f5',
                changeOrigin: true,
                pathRewrite: {
                    '^/f5': ''
                }
            },
            '/baremetal': {
                target: 'http://192.168.3.127:9090/baremetal',
                changeOrigin: true,
                pathRewrite: {
                    '^/baremetal': ''
                }
            },
            '/hacksaw': {
                target: 'http://192.168.3.127:9090/hacksaw',
                changeOrigin: true,
                pathRewrite: {
                    '^/hacksaw': ''
                }
            },
            '/vdi': {
                target: 'http://192.168.3.127:9090/vdi',
                changeOrigin: true,
                pathRewrite: {
                    '^/vdi': ''
                }
            },
            '/citrix': {
                target: 'http://192.168.3.126:8586/citrix',
                changeOrigin: true,
                pathRewrite: {
                    '^/citrix': ''
                }
            },
            '/console': {
                target: 'http://192.168.3.127:9090/console',
                // target: 'http://192.168.3.126:6070/console',
                changeOrigin: true,
                pathRewrite: {
                    '^/console': ''
                }
            },
            '/vcops': {
                target: 'http://192.168.3.127:9090/vcops',
                changeOrigin: true,
                pathRewrite: {
                    '^/vcops': ''
                }
            },
            '/oracle_rac': {
                target: 'http://192.168.3.127:9090/oracle_rac',
                changeOrigin: true,
                pathRewrite: {
                    '^/oracle_rac': ''
                }
            },
        },

        // Various Dev Server settings
        host: 'localhost', // can be overwritten by process.env.HOST
        port: 8100, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
        autoOpenBrowser: false,
        errorOverlay: true,
        notifyOnErrors: true,
        poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

        // Use Eslint Loader?
        // If true, your code will be linted during bundling and
        // linting errors and warnings will be shown in the console.
        useEslint: true,
        // If true, eslint errors and warnings will also be shown in the error overlay
        // in the browser.
        showEslintErrorsInOverlay: false,

        /**
         * Source Maps
         */

        // https://webpack.js.org/configuration/devtool/#development
        devtool: 'eval-source-map',

        // If you have problems debugging vue-files in devtools,
        // set this to false - it *may* help
        // https://vue-loader.vuejs.org/en/options.html#cachebusting
        cacheBusting: true,

        // CSS Sourcemaps off by default because relative paths are "buggy"
        // with this option, according to the CSS-Loader README
        // (https://github.com/webpack/css-loader#sourcemaps)
        // In our experience, they generally work as expected,
        // just be aware of this issue when enabling this option.
        cssSourceMap: false
    },

    build: {
        // Template for index.html
        index: path.resolve(__dirname, '../dist/index.html'),

        // Paths
        assetsRoot: path.resolve(__dirname, '../dist'),
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        publicPath: '/static/ucmp-ui/',
        /**
         * Source Maps
         */

        productionSourceMap: process.env.NODE_ENV !== 'production',
        // https://webpack.js.org/configuration/devtool/#production
        devtool: '#source-map',

        // Gzip off by default as many popular static hosts such as
        // Surge or Netlify already gzip all static assets for you.
        // Before setting to `true`, make sure to:
        // npm install --save-dev compression-webpack-plugin
        productionGzip: process.env.NODE_ENV === 'production',
        productionGzipExtensions: ['js', 'css'],

        // Run the build command with an extra argument to
        // View the bundle analyzer report after build finishes:
        // `npm run build --report`
        // Set to `true` or `false` to always turn it on or off
        bundleAnalyzerReport: process.env.npm_config_report
    }
}
