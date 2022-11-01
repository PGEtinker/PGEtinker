<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>PGEtinker</title>
        <meta name="description" value="Interactively develop an olc::PixelGameEngine program from your Browser!">

        <meta property="og:title" content="PGEtinker">
        <meta property="og:description" content="Interactively develop an olc::PixelGameEngine program from your Browser!">
        <meta property="og:type" content="website">
        
        
        @if($slug != 'null')
        
        <meta property="og:url" content="{{ env('APP_URL') }}/s/{{ $slug }}">
        
        @else
        
        <meta property="og:url" content="{{ env('APP_URL') }}">

        @endif

        <meta property="og:image" content="{{ env('APP_URL') }}{{ mix('images/PGEtinker-screenshot.png') }}">
        <meta property="og:image:width" content="512">
        <meta property="og:image:height" content="480">
        <meta property="og:image:type" content="image/png">

        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:description" content="Interactively develop an olc::PixelGameEngine program from your Browser!">
        <meta property="twitter:title" content="PGEtinker">
        <meta property="twitter:domain" content="{{ env('APP_URL') }}">        
        <meta property="twitter:url" content="">
        
        <meta property="twitter:image" content="{{ env('APP_URL') }}{{ mix('images/PGEtinker-screenshot.png') }}">
        <meta property="twitter:image:width" content="512">
        <meta property="twitter:image:height" content="480">

        <script type="text/javascript" src="{{ mix('js/jquery.min.js') }}"></script>
        
        <script type="text/javascript" src="{{ mix('js/goldenlayout.min.js') }}"></script>
        <link type="text/css" rel="stylesheet" href="{{ mix('css/goldenlayout-base.css') }}">
        <link id="layout-theme-css" type="text/css" rel="stylesheet" href="{{ mix('css/goldenlayout-dark-theme.css') }}">
    
        <link type="text/css" rel="stylesheet" href="{{ mix('css/app.css') }}">
    </head>
    <body>
        <div id="app">
            <div id="header">
                <a href="/">
                    <img src="{{ mix('images/PGEtinker-logo.png') }}" alt="PGEtinker Logo">
                </a>
                <div class="branding">
                    <a href="https://github.com/OneLoneCoder/olcPixelGameEngine" target="_blank">
                        <img id="olc-brand" src="{{ mix('images/pge-logo.png') }}" alt="OneLoneCoder PixelGameEngine Logo">
                    </a>
                    <a href="https://emscripten.org/" target="_blank">
                        <img id="emscripten-brand" src="{{ mix('images/emscripten-logo.png') }}" alt="Emscripten Logo">
                    </a>
                </div>
            </div>
            <div id="content"></div>
            <div id="footer">
                Haven't quite decided what should go here, probably a copyright notice or perhaps a whitty quote.
            </div>
        </div>
        <script type="text/javascript">let pgeTinkerShareSlug = '{{ $slug }}';</script>
        <script type="text/javascript" src="{{ mix('js/app.js') }}"></script>
    </body>
</html>
