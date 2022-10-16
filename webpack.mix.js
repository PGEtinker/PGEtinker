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

// dark theme
mix.copy('node_modules/golden-layout/src/css/goldenlayout-dark-theme.css', 'public/css');
mix.copy('node_modules/golden-layout/src/css/goldenlayout-dark-theme.css.map', 'public/css');

// light theme
mix.copy('node_modules/golden-layout/src/css/goldenlayout-light-theme.css', 'public/css');
mix.copy('node_modules/golden-layout/src/css/goldenlayout-light-theme.css.map', 'public/css');

// soda theme
mix.copy('node_modules/golden-layout/src/css/goldenlayout-soda-theme.css', 'public/css');
mix.copy('node_modules/golden-layout/src/css/goldenlayout-soda-theme.css.map', 'public/css');

// translucent theme
mix.copy('node_modules/golden-layout/src/css/goldenlayout-translucent-theme.css', 'public/css');
mix.copy('node_modules/golden-layout/src/css/goldenlayout-translucent-theme.css.map', 'public/css');


// app js
mix.js('resources/js/app.js', 'public/js');

// app css
mix.css('resources/css/app.css', 'public/css');
