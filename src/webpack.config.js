const webpack = require('webpack');

module.exports = {
    resolve: {
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            // url: require.resolve('url/'),
            url: false,
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.NormalModuleReplacementPlugin(
            /node:crypto/,
            require.resolve('crypto-browserify')
        ),
        new webpack.DefinePlugin({
            global: 'globalThis',
        }),
    ],
};
