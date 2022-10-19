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

// Player Panel
let elemPlayerIframe = null;

String.prototype.toHtmlEntities = function() {
    return this.replace(/./gm, function(s) {
        // return "&#" + s.charCodeAt(0) + ";";
        return (s.match(/[a-z0-9\s]+/i)) ? s : "&#" + s.charCodeAt(0) + ";";
    });
};


let pgeTinkerSavedLayout = window.localStorage.getItem('pgeTinkerSavedLayout');
let layoutConfig = null;

if(pgeTinkerSavedLayout === null)
{
    // set the default layout
    layoutConfig = {
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
    };
}
else
{
    layoutConfig = JSON.parse(pgeTinkerSavedLayout);
}

// Golden Layout
let pgeLayout = new GoldenLayout(layoutConfig, $('#content'));

// Compile Code
window.Compile = function()
{
    let status = document.querySelector('#player-panel div');
    
    status.className = 'compiling';
    elemInfo.innerHTML = '';
    
    window.monDecorator = monEditor.deltaDecorations(monDecorator, []);
    
    axios.post('/api/compile', {code: monEditor.getModel().getValue()})
    .then(function(response)
    {
        if(response.data.success)
        {
            elemPlayerIframe.src = '/player';
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

}

window.RefreshPlayer = function()
{
    let status = document.querySelector('#player-panel div');
    status.className = 'loading';
    
    elemInfo.innerHTML = '';
    elemPlayerIframe.src = '/player';
    setTimeout(function() { status.className = ''; }, 1000);
}

window.ResetLayout = function()
{
    window.localStorage.removeItem('pgeTinkerSavedLayout');
    window.location.reload();
}

// editor component
pgeLayout.registerComponent( 'editor', function( container, componentState )
{
    container.getElement().html(`
<div id="editor-panel">
    <div class="menu">
        <ul>
            <li><button type="button" onclick="ResetLayout(); return false;">Reset Layout</button></li>
            <li><button type="button" onclick="Compile(); return false;">Build &amp; Run</button></li>
            <li><button type="button" onclick="RefreshPlayer(); return false;">Refresh Player</button></li>
        </ul>
    </div>
    <div class="code-editor"></div>
</div>`);
    
    container.on('open', function()
    {
        let elemCode    = document.querySelector('#editor-panel .code-editor');
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

    });
});

// player component
pgeLayout.registerComponent( 'player', function( container, componentState )
{
    container.getElement().html( '<div id="player-panel"><iframe sandbox="allow-scripts" src="/player"></iframe><div></div></div>' );
    container.on('open', function()
    {
        elemPlayerIframe = document.querySelector('#player-panel iframe');
    });
});

// info component
pgeLayout.registerComponent( 'info', function( container, componentState )
{
    container.getElement().html( '<div id="info-panel" data-type="text/css"></div>' );

    container.on('open', function()
    {
        elemInfo = document.querySelector('#info-panel');
    });
});

pgeLayout.registerComponent( 'console', function( container, componentState )
{
    container.getElement().html( '<div id="console-panel"><div></div></div>' );
    
    container.on('open', function()
    {
        elemConsole = document.querySelector('#console-panel div');
    });
});

// stuff that needs to happen when the layout has been initialised.
pgeLayout.on('initialised', function()
{
    window.addEventListener('resize', function(e)
    {
        pgeLayout.updateSize();
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

// save the state
pgeLayout.on( 'stateChanged', function()
{
    var state = JSON.stringify( pgeLayout.toConfig() );
    localStorage.setItem( 'pgeTinkerSavedLayout', state );
});

// initialize the layout
pgeLayout.init();
