<!doctype html>
<html lang="en-us">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>No Program To Run</title>
    <style>
        html,
        body {
            font-family: "Droid Sans Mono", "monospace", monospace;
            font-weight: normal;
            font-size: 14px;
            margin: 0;
            padding: 1rem;
        }

        body {
            background: #222;
            color: #ded;
        }

        body.light {
            background: #fff;
            color: #000;
        }
    </style>
</head>

<body>
    <h1>Welcome to PGEtinker</h1>
    <p>Inspiring Quote? Instructions? Who needs 'em!</p>
    <p>Let's just jump into some code and read the docs later!</p>
    <p>What do you mean? There's no docs?.... Hmmm interesting.</p>
    <script>
    window.parent.postMessage({
        event: 'pgetinker:no-player',
    }, '{{ env('APP_URL') }}');
    
    window.addEventListener('message', function(e) {
            
            if(e.data.theme === undefined)
                return;
            
            if(e.data.theme === 'light')
            {
                document.querySelector('body').className = 'light';
                return;
            }
            
            document.querySelector('body').className = '';
        });
    </script>
</body>
</html>
       
