import './bootstrap';
import * as monaco from 'monaco-editor';

// retrieve the default code value
let defaultValue = $('#defaultCode').text();
$('#defaultCode').remove();

// default layout config
var config = {
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
                componentState: { label: 'Editor' },
                isClosable: false,
            },{
                type: 'component',
                componentName: 'player',
                componentState: { label: 'Player' },
                isClosable: false,
            }]
        },{
            type: 'component',
            componentName: 'info',
            componentState: { label: 'Error/Warning/Debug Panel' },
            height: 15,
            isClosable: false,
        }]
    }]
};

let myLayout = new GoldenLayout( config, $('#content') );

let monEditor = null;
let monInfo   = null;

// editor component
myLayout.registerComponent( 'editor', function( container, componentState )
{
    container.getElement().html( '<div class="code-editor"></div><button type="button" class="compile-button">Compile</button>' );
    
    container.on('open', function()
    {
        let elemCode    = container.getElement().find('.code-editor')[0];
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
            monInfo.getModel().setValue('');

            axios.post('/api/compile', {code: monEditor.getModel().getValue()})
            .then(function(response)
            {
                if(response.data.success)
                {
                    $('#player')[0].src = '/player';
                }

                monInfo.getModel().setValue(response.data.messages);
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
    container.getElement().html( '<iframe id="player" src="/player"></iframe>' );
    
    container.on('open', function()
    {
        console.log(componentState.label, 'opened');
    });
});

// info component
myLayout.registerComponent( 'info', function( container, componentState ){
    
    container.getElement().html( '<div class="info-editor"></div>' );

    container.on('open', function()
    {
        let elemInfo    = container.getElement().find('.info-editor')[0];

        monInfo = monaco.editor.create(elemInfo, {
            value: '',
            language: 'bash',
            theme: 'vs-dark',

            wordWrap: 'wordWrapColumn',
            // wordWrapColumn: 80,
        });
        
        container.on('resize', function()
        {
            monInfo.layout();
        });

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



