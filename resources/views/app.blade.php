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
                <span id="main-brand">PGEtinker Logo</span>
                <span id="olc-brand">OneLoneCoder Logo</span>
                <span id="emscripten-brand">Emscripten Logo</span>
            </div>
            <div id="content"></div>
            <div id="footer">
                PGEtinker is released under the MIT license. 
            </div>
        </div>
        <script type="text/javascript" src="{{ mix('js/app.js') }}"></script>
    </body>
</html>
    