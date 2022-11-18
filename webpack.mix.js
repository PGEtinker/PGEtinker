const mix = require('laravel-mix');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

mix.webpackConfig({
    plugins: [
        new MonacoWebpackPlugin(),
    ],
});

// jquery
mix.copy('node_modules/jquery/dist/jquery.min.js', 'public/js');

// golden layout
mix.copy('node_modules/golden-layout/dist/goldenlayout.min.js', 'public/js');

// golden layout base
mix.copy('node_modules/golden-layout/src/css/goldenlayout-base.css', 'public/css');
mix.copy('node_modules/golden-layout/src/css/goldenlayout-base.css.map', 'public/css');

// golden dark theme
mix.copy('node_modules/golden-layout/src/css/goldenlayout-dark-theme.css', 'public/css');
mix.copy('node_modules/golden-layout/src/css/goldenlayout-dark-theme.css.map', 'public/css');

// golden light theme
mix.copy('node_modules/golden-layout/src/css/goldenlayout-light-theme.css', 'public/css');
mix.copy('node_modules/golden-layout/src/css/goldenlayout-light-theme.css.map', 'public/css');

// font awesome
mix.copy('node_modules/font-awesome/css/font-awesome.min.css', 'public/css');
mix.copy('node_modules/font-awesome/fonts', 'public/fonts');

// images
mix.copy('resources/images', 'public/images');

// app js
mix.ts('resources/js/app.ts', 'public/js');

// app css
mix.css('resources/css/app.css', 'public/css');
