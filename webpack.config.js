const path = require('path');
const autoprefixer = require('autoprefixer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const ManifestPlugin = require('webpack-manifest-plugin');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    externals: {
        jquery: 'jQuery'
    },

    /**
     * Entry files - Add more entries if needed.
     */
    entry: {
        'student-react': './source/js/Module/Event/Index.js',
        'student-user-visit': './source/js/front/user-visit.js',
        'student-styles': './source/sass/student-council-protocols.scss',
    },
    
    /**
     * Output files
     */
    output: {
        filename: devMode ? '[name].bundle.js' : '[name].[hash:8].js',
        chunkFilename: devMode ? '[id].js' : '[id].[hash:8].js',
        path: path.resolve(process.cwd(),'dist'),
    },

    module: {
        rules: [

            /**
             * Babel
             */
            {
                test: /\.jsx?/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        // Babel config here
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: [
                            '@babel/plugin-syntax-dynamic-import',
                            '@babel/plugin-proposal-export-default-from',
                            '@babel/plugin-proposal-class-properties',
                            'react-hot-loader/babel',
                        ],
                    },
                },
            },

            /**
             * Compile sass to css
             */
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2, // 0 => no loaders (default); 1 => postcss-loader; 2 => sass-loader
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [autoprefixer],
                        },
                    },
                    'sass-loader',
                ],
            },

            /**
             * Images
             */
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: devMode ? '[name].[ext]' : '[name].[contenthash:8].[ext]',
                        },
                    },
                ],
            },
            /**
             * Fonts
             */
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: devMode ? '[name].[ext]' : '[name].[contenthash:8].[ext]',
                        },
                    },
                ],
            }
        ]
    },

    /**
     * Plugins
     */
    plugins: [
        new CleanWebpackPlugin(),
        new FixStyleOnlyEntriesPlugin(),
        // Minify css and create css file
        new MiniCssExtractPlugin({
            filename: '[name].min.css',
            chunkFilename: '[name].min.css'
        }),
        new ManifestPlugin({
            fileName: 'rev-manifest.json',
            // Filter manifest items
            filter: function(file) {
                // Don't include source maps
                if (file.path.match(/\.(map)$/)) {
                    return false;
                }
                return true;
            },
            // Custom mapping of manifest item goes here
            map: function(file) {
                // Fix incorrect key for fonts
                if (
                    file.isAsset &&
                    file.isModuleAsset &&
                    file.path.match(/\.(woff|woff2|eot|ttf|otf)$/)
                ) {
                    const pathParts = file.path.split('.');
                    const nameParts = file.name.split('.');
    
                    // Compare extensions
                    if (pathParts[pathParts.length - 1] !== nameParts[nameParts.length - 1]) {
                        file.name = pathParts[0].concat('.', pathParts[pathParts.length - 1]);
                    }
                }
                return file;
            },
        })
    ]
};
// "scripts": {
//     "test": "echo \"Error: no test specified\" && exit 1",
//     "build": "webpack --config webpack.config.js"
//   },
//   "devDependencies": {
    // "@babel/core": "^7.3.4",
    // "@babel/plugin-proposal-class-properties": "^7.3.4",
    // "@babel/plugin-proposal-export-default-from": "^7.2.0",
    // "@babel/plugin-syntax-dynamic-import": "^7.2.0",
    // "@babel/preset-env": "^7.3.4",
    // "@babel/preset-react": "^7.0.0",
    // "autoprefixer": "^9.4.10",
    // "babel-eslint": "^10.0.1",
    // "babel-loader": "^8.0.5",
    // "clean-webpack-plugin": "^2.0.0",
    // "cross-env": "^5.2.0",
    // "css-loader": "^2.1.1",
    // "eslint": "^5.15.1",
    // "eslint-config-airbnb": "^17.1.0",
    // "eslint-config-prettier": "^4.1.0",
    // "eslint-plugin-import": "^2.16.0",
    // "eslint-plugin-jsx-a11y": "^6.2.1",
    // "eslint-plugin-prettier": "^3.0.1",
    // "eslint-plugin-react": "^7.12.4",
    // "file-loader": "^3.0.1",
    // "html-webpack-plugin": "^3.2.0",
    // "mini-css-extract-plugin": "^0.5.0",
    // "node-sass": "^4.11.0",
    // "optimize-css-assets-webpack-plugin": "^5.0.1",
    // "postcss-loader": "^3.0.0",
    // "prettier": "^1.16.4",
    // "react": "^16.8.4",
    // "react-dom": "^16.8.4",
    // "react-hot-loader": "^4.8.0",
    // "sass-loader": "^7.1.0",
    // "style-loader": "^0.23.1",
    // "uglifyjs-webpack-plugin": "^2.1.2",
    // "webpack": "^4.29.6",
    // "webpack-cli": "^3.2.3",
    // "webpack-dev-server": "^3.2.1",
    // "webpack-fix-style-only-entries": "^0.2.1",
    // "webpack-manifest-plugin": "^2.0.4",
    // "webpack-merge": "^4.2.1"
//   },