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
        
        <meta property="og:url" content="{{ env('APP_URL') }}/s/{{ $slug }}">
        <meta property="og:image" content="{{ env('APP_URL') }}/data/{{ $slug }}.png">
        <meta property="og:image:width" content="800">
        <meta property="og:image:height" content="600">
        <meta property="og:image:type" content="image/png">

        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:description" content="Interactively develop an olc::PixelGameEngine program from your Browser!">
        <meta property="twitter:title" content="PGEtinker">
        <meta property="twitter:domain" content="{{ env('APP_URL') }}">        
        <meta property="twitter:url" content="">
        
        <meta property="og:image" content="{{ env('APP_URL') }}/data/{{ $slug }}.png">
        <meta property="twitter:image:width" content="800">
        <meta property="twitter:image:height" content="600">
        <style>
html, body { height: 100%; width: 100%; margin: 0; padding: 0; }
iframe {border: none; width: 100%; height: 100%; margin: 0; padding: 0; }
        </style>
    </head>
    <body>
        <iframe sandbox="allow-scripts" src="/player/{{ $slug }}"><iframe>
    </body>
</html>
    