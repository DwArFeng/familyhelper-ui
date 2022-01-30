/* eslint-env node */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: path.resolve(__dirname, 'src', 'iconfont.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'iconfont.js',
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {from: path.resolve(__dirname, 'src')},
            ],
        }),
    ]
};
