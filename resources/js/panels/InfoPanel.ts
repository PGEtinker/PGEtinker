import GoldenLayout from "golden-layout";
import State from "../State";
import Panel from "./Panel";

export default class InfoPanel extends Panel
{
    elem! : HTMLDivElement;

    constructor(state: State)
    {
        super(state);
        this.log('constructor');
        
        this.state.layout.registerComponent( 'info', (container: GoldenLayout.Container, componentState: any) =>
        {
            this.log('register');
            this._container = container;

            container.getElement().html(this.html());
            container.on('open', () =>
            {
                this.log('open');
            });
        });
        
        this.state.layout.on('initialised', () =>
        {
            this.log('initialised.');
            this.elem = document.querySelector<HTMLDivElement>('#info-panel div')!;
        });
    }

    html() : string
    {
        return `<div id="info-panel"><div></div></div>`;
    }
}
