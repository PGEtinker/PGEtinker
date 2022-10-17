<!doctype html>
<html lang="en-us">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Use Whole Page Test</title>
    <style>
        html,
        body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: arial;
            background: #222;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-items: center;
            justify-content: center;
        }

        #canvas {
            border: 0px none;
            background-color: black;
        }
    </style>
</head>

<body>

    <canvas id="canvas" oncontextmenu="event.preventDefault()" tabindex=-1></canvas>
    <script type='text/javascript'>
        var Module = {
            preRun: [],
            postRun: [],
            print: (function () {
                return function (text) {
                    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
                    
                    // send to the top window as an event
                    window.top.dispatchEvent(new CustomEvent('pgetinker:console-write', { detail: text }));
                };
            })(),
            canvas: (function () {
                var canvas = document.getElementById('canvas');

                // As a default initial behavior, pop up an alert when webgl context is lost. To make your
                // application robust, you may want to override this behavior before shipping!
                // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
                canvas.addEventListener("webglcontextlost", function (e) { alert('WebGL context lost. You will need to reload the page.'); e.preventDefault(); }, false);

                return canvas;
            })(),
            setStatus: function (text) {
            },
            totalDependencies: 0,
            monitorRunDependencies: function (left) {
            }
        };
        Module.setStatus('Downloading...');
        window.onerror = function (event) {
            // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
            Module.setStatus('Exception thrown, see JavaScript console');

            Module.setStatus = function (text) {
                if (text) console.error('[post-exception status] ' + text);
            };
        };
        // clear the console in top window
        window.top.dispatchEvent(new CustomEvent('pgetinker:console-clear'));
    </script>
    
    <script async type="text/javascript" src="data/{{ $pgeTinkerFilename }}.js"></script>
</body>

</html>
       
