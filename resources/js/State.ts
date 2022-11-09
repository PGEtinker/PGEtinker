import Base from "./Base";

// Golden Layout
import GoldenLayout from 'golden-layout';

// Panels
import ConsolePanel from "./panels/ConsolePanel";
import EditorPanel from "./panels/EditorPanel";
import InfoPanel from "./panels/InfoPanel";
import PlayerPanel from "./panels/PlayerPanel";

// Compiler
import Compiler from "./Compiler";
import version from "./version";

declare const pgeTinkerShareSlug: string;

export default class State extends Base
{
    _layout         : GoldenLayout;
    _playerFilename : string;
    _theme          : string;
    _version        : string;

    panel_Console : ConsolePanel;
    panel_Editor  : EditorPanel;
    panel_Info    : InfoPanel;
    panel_Player  : PlayerPanel;
    
    compiler      : Compiler;
    
    pgeTinkerShareSlug : string;

    constructor()
    {
        // Call the base constructor
        super();

        // version
        this._version = version;
        
        // handle version changes
        let pgeTinkerVersion : string | null = localStorage.getItem('pgeTinkerVersion');
        if(pgeTinkerVersion !== this.version)
        {
            for(let i = 0; i < localStorage.length; i++)
            {
                let key : string | null = localStorage.key(i);
                
                if(key === null)
                    continue;
                
                if(key.indexOf('pgeTinker') === 0)
                    localStorage.removeItem(key);
            }
            localStorage.setItem('pgeTinkerVersion', this.version);
        }
        
        this.pgeTinkerShareSlug = pgeTinkerShareSlug;

        // determine player file name
        let playerFilename : string | null = localStorage.getItem('pgeTinkerWasmFilename');
        if(pgeTinkerShareSlug !== 'null') playerFilename = pgeTinkerShareSlug;
        this._playerFilename = String(playerFilename);
        
        // determine the theme
        let theme : string | null = localStorage.getItem('pgeTinkerTheme');
        if(theme === null) theme = 'dark';
        this._theme = theme;
        
        // the layout
        this._layout = new GoldenLayout(this.layoutConfig(), document.querySelector('#content'));
        
        this.layout.on('initialised', () =>
        {
            this.log('initialised');

            this.setTheme(this._theme);
            
            window.addEventListener('resize', (e) =>
            {
                this.layout.updateSize();
            });
        });
        
        // save the state
        this.layout.on('stateChanged', () =>
        {
            localStorage.setItem('pgeTinkerSavedLayout', JSON.stringify(this.layout.toConfig()));
        });
        
        this.compiler      = new Compiler(this);

        // initialise panels
        this.panel_Console = new ConsolePanel(this);
        this.panel_Editor  = new EditorPanel(this);
        this.panel_Info    = new InfoPanel(this);
        this.panel_Player  = new PlayerPanel(this);
    }
    
    /**
     * layoutConfig()
     * 
     * checks localStorage for a persistent configuration, returns if found.
     * otherwise return a default configuration.
     * 
     * @returns GoldenLayout.Config
     */
    layoutConfig() : GoldenLayout.Config
    {
        let config: string | null = localStorage.getItem('pgeTinkerSavedLayout');
        
        if(config != null)
            return JSON.parse(config);
        
        return {
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
        };
    }
    
    gotoAndFocus(line: number, column: number)
    {
        this.panel_Editor.gotoAndFocus(line, column);
    }

    toggleTheme()
    {
        if(this._theme === 'dark')
        {
            this.setTheme('light');
            return;
        }
            
        this.setTheme('dark');
    }

    /**
     * setTheme()
     * 
     * @param theme: string
     * valid themes 'light' or 'dark' (default)
     */
    setTheme(theme: string)
    {
        this.log('set theme', theme);

        // ensure valid theme
        if(theme !== 'light' && theme !== 'dark')
            theme = 'dark';
        
        document!.querySelector<HTMLLinkElement>('#layout-theme-css')!.href = `/css/goldenlayout-${theme}-theme.css`;;
        document!.querySelector<HTMLBodyElement>('body')!.className = theme;
        
        this.panel_Editor.setTheme(theme);
        this.panel_Player.setTheme(theme);
        
        localStorage.setItem('pgeTinkerTheme', theme);
        this._theme = theme;
    }
    
    // getters and setters
    get layout() : GoldenLayout { return this._layout; }
    get version() : string      { return this._version; }
};