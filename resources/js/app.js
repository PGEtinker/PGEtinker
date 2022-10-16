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
        type: 'row',
        content:[{
            type: 'column',
            content:[{
                type: 'component',
                componentName: 'editor',
                componentState: { label: 'Editor' },
                isClosable: false,
            },{
                type: 'component',
                componentName: 'info',
                componentState: { label: 'Error/Warning/Debug Panel' },
                height: 15,
                isClosable: false,
            }]
        },{
            type: 'component',
            componentName: 'player',
            componentState: { label: 'Player' },
            isClosable: false,
        }]
    }]
};

let myLayout = new GoldenLayout( config, $('#content') );

// editor component
myLayout.registerComponent( 'editor', function( container, componentState )
{
    container.getElement().html( '<div class="code-editor"></div><button type="button" class="compile-button">Compile</button>' );
    
    container.on('open', function()
    {
        let elemCode = container.getElement().find('.code-editor')[0];
        let elemCompile = container.getElement().find('.compile-button');

        let editor = monaco.editor.create(elemCode, {
            value: defaultValue,
            language: 'cpp',
            theme: 'vs-dark',
        });

        container.on('resize', function()
        {
            editor.layout();
        });

        elemCompile.on('click', function()
        {
            axios.post('/api/compile', {code: editor.getValue()})
            .then(function(response)
            {
                if(response.data.success)
                {
                    $('#player')[0].src = '/player';
                }
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
    
    // container.getElement().html( '<h2>' + componentState.label + '</h2>' );

    container.on('open', function()
    {
        console.log(componentState.label, 'opened');
    });

    
});

// initialize the layout
myLayout.init();
