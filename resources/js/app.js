import './bootstrap';
import * as monaco from 'monaco-editor';

// retrieve the default code value
let defaultValue = $('#defaultCode').text();
$('#defaultCode').remove();

// Editor Panel
window.monEditor = null;
window.monDecorator = null;

// Information Panel
window.monInfo = null;
let elemInfo  = null;
let regExInfo = /(source.cpp|olcPixelGameEngine.h):([0-9]+):([0-9]+): ([a-zA-Z0-9]+):/g; 

// Console Panel
let elemConsole = null;

String.prototype.toHtmlEntities = function() {
    return this.replace(/./gm, function(s) {
        // return "&#" + s.charCodeAt(0) + ";";
        return (s.match(/[a-z0-9\s]+/i)) ? s : "&#" + s.charCodeAt(0) + ";";
    });
};

// Golden Layout
let myLayout = new GoldenLayout({
    settings: {
        showPopoutIcon: false,
    },
    content: [{
        type: 'column',
        content: [{
            type: 'row',
            content: [{
                type: 'component',
                componentName: 'editor',
                componentState: { label: 'Editor Panel' },
                isClosable: false,
            },{
                type: 'component',
                componentName: 'player',
                componentState: { label: 'Player Panel' },
                isClosable: false,
            }]
        },{
            type: 'stack',
            height: 15,
            activeItemIndex: 1,
            content: [{
                type: 'component',
                componentName: 'info',
                componentState: { label: 'Info Panel' },
                isClosable: false,
            },{
                type: 'component',
                componentName: 'console',
                componentState: { label: 'Console Panel' },
                isClosable: false,
            }]
        }]
    }]
}, $('#content'));

// editor component
myLayout.registerComponent( 'editor', function( container, componentState )
{
    container.getElement().html( '<div id="editor-panel"><div class="code-editor"></div><button type="button" class="compile-button">Compile</button></div>' );
    
    container.on('open', function()
    {
        let elemCode    = $('#editor-panel .code-editor')[0];
        let elemCompile = container.getElement().find('.compile-button');

        window.monEditor = monaco.editor.create(elemCode, {
            value: defaultValue,
            language: 'cpp',
            theme: 'vs-dark',
        });

        window.monDecorator = monEditor.deltaDecorations([], []);

        container.on('resize', function()
        {
            monEditor.layout();
        });

        elemCompile.on('click', function()
        {
            let status = $('#player-panel div')[0];
            
            status.className = 'compiling';
            elemInfo.innerHTML = '';
            
            window.monDecorator = monEditor.deltaDecorations(monDecorator, []);
            
            axios.post('/api/compile', {code: monEditor.getModel().getValue()})
            .then(function(response)
            {
                if(response.data.success)
                {
                    $('#player-panel iframe')[0].src = '/player';
                    setTimeout(function() { status.className = ''; }, 1000);
                }
                else
                {
                    status.className = 'fail';
                }

                let info = new Array();
                let m    = null;
                
                while((m = regExInfo.exec(response.data.messages)) !== null)
                {
                    if (m.index === regExInfo.lastIndex)
                    {
                        re.lastIndex++;
                    }

                    info.push({ input: m[0], line: parseInt(m[2]), column: parseInt(m[3]), type: m[4] });
                }
                
                let out = response.data.messages;
                var entries = [];
                
                info.forEach(function(item)
                {

                    if(item.input.indexOf('source.cpp') === 0)
                    {
                        out = out.replace(item.input, `<a href="#" onclick="monEditor.setPosition({ lineNumber: ${item.line}, column: ${item.column} }); monEditor.revealPositionInCenter({ lineNumber: ${item.line}, column: ${item.column} }); monEditor.focus(); return false;">${item.input}</a>`);
                        
                        // add the decoration
                        entries.push({
                            range: new monaco.Range(item.line, 1, item.line, 2),
                            options: {
                                isWholeLine: true,
                                className: 'editor-'+item.type,
                            }
                        });
                        
                    }
                        
                    if(item.input.indexOf('olcPixelGameEngine.h') === 0)
                        out = out.replace(item.input, `<a href="https://github.com/OneLoneCoder/olcPixelGameEngine/blob/develop/olcPixelGameEngine.h#L${item.line}" target="_blank">${item.input}</a>`);
                });
                
                elemInfo.innerHTML = out;
                window.monDecorator = monEditor.deltaDecorations([], entries);
            })
            .catch(function(error)
            {
                console.log(error);
            });
    
        });
    });
});

// player component
myLayout.registerComponent( 'player', function( container, componentState )
{
    container.getElement().html( '<div id="player-panel"><iframe src="/player"></iframe><div></div></div>' );
    
    container.on('open', function()
    {
        console.log(componentState.label, 'opened');
    });
});

// info component
myLayout.registerComponent( 'info', function( container, componentState )
{
    container.getElement().html( '<div id="info-panel" data-type="text/css"></div>' );

    container.on('open', function()
    {
        elemInfo    = $('#info-panel')[0];
    });
});

myLayout.registerComponent( 'console', function( container, componentState )
{
    container.getElement().html( '<div id="console-panel"><div></div></div>' );
    
    container.on('open', function()
    {
        elemConsole = $('#console-panel div')[0];
    });
});


myLayout.on('initialised', function()
{
    window.addEventListener('resize', function(e)
    {
        myLayout.updateSize();
    });

    // force empty console
    elemConsole.innerHTML = '';

    // handle console clearing. 'pgetinker:console-clear' event dispatched from player iframe
    window.addEventListener('pgetinker:console-clear', function(e)
    {
        elemConsole.innerHTML = '';
    });

    // handle console writing. 'pgetinker:console-write' event dispatched from player iframe
    window.addEventListener('pgetinker:console-write',function(e)
    {
        elemConsole.innerHTML += e.detail.toHtmlEntities() + '<br>';
        elemConsole.scrollTop = elemConsole.scrollHeight;
    });    
});

// initialize the layout
myLayout.init();
