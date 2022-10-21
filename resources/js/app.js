import './bootstrap';
import version from './version';

import * as monaco from 'monaco-editor';
import axios from 'axios';

console.log(`PGEtinker v${version}`);

let PGEtinker = function()
{
    // handle version changes
    if(localStorage.getItem('pgeTinkerVersion') != version)
    {
        localStorage.removeItem('pgeTinkerSavedLayout');
        localStorage.removeItem('pgeTinkerTheme');
        
        // update the version
        localStorage.setItem('pgeTinkerVersion', version);
    }

    // shim String to convert html entities
    String.prototype.toHtmlEntities = function() { return this.replace(/./gm, function(s) { return (s.match(/[a-z0-9\s]+/i)) ? s : "&#" + s.charCodeAt(0) + ";"; }); };
    
    // Editor Panel
    let monaco_Editor          = null;
    let monaco_EditorDecorator = null;
    let elem_Editor            = null;
    let container_Editor       = null;

    // Information Panel
    let elem_Information      = null;
    let container_Information = null;
    let regExInfo = /(source.cpp|olcPixelGameEngine.h):([0-9]+):([0-9]+): (note|warning|error|fatal error):/g;     

    // Console Panel
    let elem_Console      = null;
    let container_Console = null;

    // Player Panel
    let elem_PlayerFrame  = null;
    let elem_PlayerStatus = null;
    let container_Player  = null;
    
    //  default to dark theme
    if(!localStorage.getItem('pgeTinkerTheme'))
    {
        localStorage.setItem('pgeTinkerTheme', 'dark');
    }
    
    let theme = localStorage.getItem('pgeTinkerTheme');
    
    /*************************************************************************
     * LAYOUT CONFIGURATION
     *************************************************************************/
    if(!localStorage.getItem('pgeTinkerSavedLayout'))
    {
        localStorage.setItem('pgeTinkerSavedLayout', JSON.stringify({
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
                        title: 'C++ Editor',
                    },{
                        type: 'component',
                        componentName: 'player',
                        componentState: { label: 'Player Panel' },
                        isClosable: false,
                        title: 'Emscripten Player',
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
                        title: 'Compiler Information',
                    },{
                        type: 'component',
                        componentName: 'console',
                        componentState: { label: 'Console Panel' },
                        isClosable: false,
                        title: 'Console Output',
                    }]
                }]
            }]
        })); // setItem(JSON.stringify(stuff))
    }
    
    // Golden Layout
    let goldenLayout_PGEtinker = new GoldenLayout(JSON.parse(localStorage.getItem('pgeTinkerSavedLayout')), $('#content'));

    /*************************************************************************
     * LAYOUT COMPONENTS
     *************************************************************************/
    
    // Component: console panel
    goldenLayout_PGEtinker.registerComponent( 'console', function( container, componentState )
    {
        container.getElement().html( '<div id="console-panel"><div></div></div>' );
        container.on('open', function()
        {
            container_Console = container.parent;
        });
    });

    // Component: editor panel 
    goldenLayout_PGEtinker.registerComponent( 'editor', function( container, componentState )
    {
        container.getElement().html(`<div id="editor-panel"><div class="menu"><ul><li><button type="button" onclick="PGEtinker.ToggleTheme(); return false;">Toggle Theme</button></li><li><button type="button" onclick="PGEtinker.Share(); return false;">Share</button></li><li class="separator"></li><li><button type="button" onclick="PGEtinker.ResetLayout(); return false;">Reset Layout</button></li><li><button type="button" onclick="PGEtinker.Compile(); return false;">Build &amp; Run</button></li><li><button type="button" onclick="PGEtinker.RefreshPlayer(); return false;">Refresh Player</button></li></ul></div><div class="code-editor"></div></div>`);
        
        container.on('open', function()
        {
            container_Editor = container.parent;
        });
        
        container.on('resize', function()
        {
            if(monaco_Editor !== null)
                monaco_Editor.layout();
        });
    });

    // Component: information panel
    goldenLayout_PGEtinker.registerComponent( 'info', function( container, componentState )
    {
        container.getElement().html( '<div id="info-panel" data-type="text/css"></div>' );
        container.on('open', function()
        {
            container_Information = container.parent;
        });
    });

    // Component: player panel
    goldenLayout_PGEtinker.registerComponent( 'player', function( container, componentState )
    {
        container.getElement().html( '<div id="player-panel"><iframe sandbox="allow-scripts" src="/player"></iframe><div></div></div>' );
        container.on('open', function()
        {
            container_Player = container.parent;
        });
    });

    /*************************************************************************
     * LAYOUT INITIALIZAION
     *************************************************************************/
    goldenLayout_PGEtinker.on('initialised', function()
    {
        // populate elements
        elem_Editor       = document.querySelector('#editor-panel .code-editor');
        elem_Information  = document.querySelector('#info-panel');
        elem_Console      = document.querySelector('#console-panel div');
        elem_PlayerFrame  = document.querySelector('#player-panel iframe');
        elem_PlayerStatus = document.querySelector('#player-panel div');
    
        // create code editor
        monaco_Editor = monaco.editor.create(elem_Editor, {
            value: $('#defaultCode').text(),
            language: 'cpp',
        });
        
        SetTheme();

        $('#defaultCode').remove();

        // initialize code editor's decorations
        monaco_EditorDecorator = monaco_Editor.deltaDecorations([], []);
        
        // handle resizing
        window.addEventListener('resize', function(e)
        {
            goldenLayout_PGEtinker.updateSize();
        });

        // handle postMessage, specifically from the player iframe
        window.addEventListener('message', function(e)
        {
            // guarantee we're processing a message coming from the player frame
            if(!(e.origin === 'null' && e.source === elem_PlayerFrame.contentWindow))
                return;
            
            // sanity check, is event set?
            if(e.data.event === undefined)
                return;
            
            // send back theme
            e.source.postMessage({theme: theme}, "*");
            
            // handle console clearing. 'pgetinker:console-clear' event dispatched from player iframe
            if(e.data.event === 'pgetinker:console-clear')
            {
                elem_Console.innerHTML = '';
                return;
            }
            
            // handle console writing. 'pgetinker:console-write' event dispatched from player iframe
            if(e.data.event === 'pgetinker:console-write')
            {
                elem_Console.innerHTML += e.data.text.toHtmlEntities() + '<br>';
                elem_Console.scrollTop = elem_Console.scrollHeight;
                return;
            }
        });
    });

    // save the state
    goldenLayout_PGEtinker.on('stateChanged', function()
    {
        var state = JSON.stringify( goldenLayout_PGEtinker.toConfig() );
        localStorage.setItem( 'pgeTinkerSavedLayout', state );
    });

    // initialize the layout
    goldenLayout_PGEtinker.init();

    function FocusContainer(container)
    {
        if(container.parent.type === 'stack')
        {
            container.parent.setActiveContentItem(container);
        }
    }
    
    /*************************************************************************
     * API FUNCTIONS
     *************************************************************************/
    
    function Compile()
    {
        elem_PlayerStatus.className = 'compiling';
        elem_Information.innerHTML = '';
        
        // switch to information panel
        FocusContainer(container_Information);
        
        monaco_EditorDecorator = monaco_Editor.deltaDecorations(monaco_EditorDecorator, []);
        
        axios.post('/api/compile', {code: monaco_Editor.getModel().getValue()})
        .then(function(response)
        {
            if(response.data.success)
            {
                elem_PlayerFrame.src = '/player';
                setTimeout(function()
                {
                    elem_PlayerStatus.className = '';
                    FocusContainer(container_Console);
                }, 1000);
            }
            else
            {
                elem_PlayerStatus.className = 'fail';
            }
            
    
            let info = new Array();
            let m    = null;
            
            while((m = regExInfo.exec(response.data.messages)) !== null)
            {
                if (m.index === regExInfo.lastIndex)
                {
                    re.lastIndex++;
                }
    
                info.push({ input: m[0], line: parseInt(m[2]), column: parseInt(m[3]), type: m[4].replace('fatal ', '') });
            }
            
            let out = response.data.messages;
            var entries = [];
            
            info.forEach(function(item)
            {
    
                if(item.input.indexOf('source.cpp') === 0)
                {
                    out = out.replace(item.input, `<a href="#" onclick="PGEtinker.GotoAndFocus(${item.line}, ${item.column}); return false;">${item.input}</a>`);
                    
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
            
            elem_Information.innerHTML = out;
            monaco_EditorDecorator = monaco_Editor.deltaDecorations([], entries);
        })
        .catch(function(error)
        {
            // act like we care, spoiler alert, we don't
            console.log(error);
        });
    
    }

    function RefreshPlayer()
    {
        elem_PlayerStatus.className = 'loading';
        
        elem_Information.innerHTML = '';
        elem_PlayerFrame.src = '/player';
        setTimeout(function() { elem_PlayerStatus.className = ''; }, 1000);
    }

    function ResetLayout()
    {
        window.localStorage.removeItem('pgeTinkerSavedLayout');
        window.location.reload();
    }
    
    function Share()
    {
        axios.post('/api/share')
        .then(function(response)
        {
            console.log(response.data);
        })
        .catch(function(error)
        {
            // act like we care, spoiler alert, we don't
            console.log(error);
        });
    }

    function ToggleTheme()
    {
        if(theme === 'light')
            SetTheme('dark');
        else    
            SetTheme('light');
            
    }
    
    function SetTheme(t)
    {
        t = (t !== undefined) ? t : theme;
        
        // paranoia or preparation?
        if(t !== 'light' && t !== 'dark')
            t = 'dark'; // dark is default

        $('#layout-theme-css')[0].href= `/css/goldenlayout-${t}-theme.css`;
        monaco_Editor.updateOptions({ theme: `vs-${t}` });
        
        // HACKABLE, but with limited payoff and scope, still.. look for better way
        elem_PlayerFrame.contentWindow.postMessage({theme: t}, "*");
        
        // update storage
        localStorage.setItem('pgeTinkerTheme', t);
        
        // update app state
        theme = t;
        document.querySelector('body').className = (theme == 'light') ? 'light' : '';
    }

    function GotoAndFocus(line, column)
    {
        monaco_Editor.setPosition({ lineNumber: line, column: column });
        monaco_Editor.revealPositionInCenter({ lineNumber: line, column: column });
        monaco_Editor.focus();        
    }

    // Expose API functions
    return {
        Compile: Compile,
        GotoAndFocus: GotoAndFocus,
        RefreshPlayer: RefreshPlayer,
        ResetLayout: ResetLayout,
        Share: Share,
        ToggleTheme: ToggleTheme,
    }

}(); // PGEtinker

window.PGEtinker = PGEtinker;
