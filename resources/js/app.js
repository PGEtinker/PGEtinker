import './bootstrap';
import * as monaco from 'monaco-editor';

// retrieve the default code value
let defaultValue = $('#defaultCode').text();
$('#defaultCode').remove();

// Editor Panel
window.monEditor = null;

//  Information Panel
window.monInfo = null;
let elemInfo  = null;
let regExInfo = /(source.cpp|olcPixelGameEngine.h):([0-9]+):([0-9]+)/g; 

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
        content:[{
            type: 'row',
            content:[{
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
            type: 'component',
            componentName: 'info',
            componentState: { label: 'Info Panel' },
            height: 15,
            isClosable: false,
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

        monEditor = monaco.editor.create(elemCode, {
            value: defaultValue,
            language: 'cpp',
            theme: 'vs-dark',
        });

        container.on('resize', function()
        {
            monEditor.layout();
        });

        elemCompile.on('click', function()
        {
            let status = $('#player-panel div')[0];
            
            status.className = 'compiling';
            elemInfo.innerHTML = '';

            axios.post('/api/compile', {code: monEditor.getModel().getValue()})
            .then(function(response)
            {
                if(response.data.success)
                {
                    $('#player')[0].src = '/player';
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

                    info.push({ input: m[0], line: m[2], column: m[3] });
                }
                
                let out = response.data.messages;
                info.forEach(function(item)
                {
                    if(item.input.indexOf('source.cpp') === 0)
                    {
                        out = out.replace(item.input, `<a href="#" onclick="monEditor.revealPositionInCenter({ lineNumber: ${item.line}, column: ${item.column} }); return false;">${item.input}</a>`);
                    }
                        
                    
                    if(item.input.indexOf('olcPixelGameEngine.h') === 0)
                        out = out.replace(item.input, `<a href="https://github.com/OneLoneCoder/olcPixelGameEngine/blob/develop/olcPixelGameEngine.h#L${item.line}" target="_blank">${item.input}</a>`);
                });
                
                elemInfo.innerHTML = out;
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
myLayout.registerComponent( 'info', function( container, componentState ){
    
    container.getElement().html( '<div id="info-panel" data-type="text/css"></div>' );

    container.on('open', function()
    {
        elemInfo    = $('#info-panel')[0];

        // monInfo = monaco.editor.create(elemInfo, {
        //     value: '',
        //     language: 'bash',
        //     theme: 'vs-dark',

        //     wordWrap: 'on',
        // });
        
        // container.on('resize', function()
        // {
        //     monInfo.layout();
        // });
    });
});

myLayout.on('initialised', function()
{
    window.addEventListener('resize', function(e)
    {
        myLayout.updateSize();
    });
})

// initialize the layout
myLayout.init();



