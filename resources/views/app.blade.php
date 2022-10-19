<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>PGEtinker</title>

        <script type="text/javascript" src="{{ mix('js/jquery.min.js') }}"></script>
        
        <script type="text/javascript" src="{{ mix('js/goldenlayout.min.js') }}"></script>
        <link type="text/css" rel="stylesheet" href="{{ mix('css/goldenlayout-base.css') }}">
        <link type="text/css" rel="stylesheet" href="{{ mix('css/goldenlayout-dark-theme.css') }}">
    
        <link type="text/css" rel="stylesheet" href="{{ mix('css/app.css') }}">
    </head>
    <body>
        <div id="defaultCode" style="display:none;">{{ $code }}</div>
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
        <script type="text/javascript" src="{{ mix('js/app.js') }}"></script>
    </body>
</html>
    