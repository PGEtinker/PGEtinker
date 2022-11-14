import GoldenLayout from "golden-layout";
import State from "../State";
import Panel from "./Panel";

export default class PlayerPanel extends Panel
{
    elemFrame  : HTMLIFrameElement | null;
    elemStatus : HTMLDivElement | null;

    constructor(state: State)
    {
        super(state);
        this.log('constructor');

        this.elemFrame = null;
        this.elemStatus = null;

        this.state.layout.registerComponent( 'player', (container: GoldenLayout.Container, componentState: any) =>
        {
            this.log('register');
            this._container = container;

            container.getElement().html(this.html());
            container.on('open', () =>
            {
                this.log('open');
                this.setTheme(this.state._theme);
            });
        });

        this.state.layout.on('initialised', () =>
        {
            this.log('initialised.');
            
            this.elemFrame  = document.querySelector<HTMLIFrameElement>('#player-panel iframe');
            this.elemStatus = document.querySelector<HTMLDivElement>('#player-panel div');

            window.addEventListener('message', (event) =>
            {
                
                if(!(event.origin === 'null' && event.source === (this.elemFrame as HTMLIFrameElement).contentWindow))
                    return;
                
                if(event.data.event === undefined)
                    return;
                
                // send the theme back
                event.source!.postMessage({event: 'pgetinker:set-theme', theme: this.state._theme}, "*");

                if(event.data.event === 'pgetinker:console-clear')
                {
                    this.state.panel_Console.clear();
                    return;
                }

                if(event.data.event === 'pgetinker:console-write')
                {
                    this.state.panel_Console.write(event.data.text);
                    return;
                }

                if(event.data.event === 'pgetinker:ready')
                {
                    (this.elemStatus as HTMLDivElement).className = '';
                    this.state.panel_Console.focus();
                    return;
                }

                if(event.data.event === 'pgetinker:not-ready')
                {
                    (this.elemStatus as HTMLDivElement).className = 'loading';
                    this.state.panel_Console.clear();
                    return;
                }

            });
        });
    }

    html() : string
    {
        return `
<div id="player-panel">
    <iframe sandbox="allow-scripts" src="/player${(this.state._playerFilename != '') ? '/'+this.state._playerFilename : ''}"></iframe>
    <div></div>
</div>
        `;
    }

    frame() : HTMLIFrameElement | null
    {
        return this.elemFrame;
    }
    
    setTheme(theme: string)
    {
        if(this.elemFrame === null)
            return;

        // ensure valid theme
        if(theme !== 'light' && theme !== 'dark')
            theme = 'dark';
        
        this.elemFrame.contentWindow!.postMessage({event: 'pgetinker:set-theme', theme: theme}, "*");
    }
}
