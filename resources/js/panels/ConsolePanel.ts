import GoldenLayout from "golden-layout";
import State from "../State";
import Panel from "./Panel";

export default class ConsolePanel extends Panel
{
    elem!: HTMLDivElement;

    constructor(state: State)
    {
        super(state);
        this.log('constructor');
        
        this.state.layout.registerComponent( 'console', (container: GoldenLayout.Container, componentState: any) =>
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
            this.elem = document!.querySelector<HTMLDivElement>('#console-panel div')!;
        });
    }

    html() : string
    {
        return `<div id="console-panel"><div></div></div>`;
    }

    clear()
    {
        this.elem.innerHTML = '';
    }

    write(text: string)
    {
        this.elem.innerHTML += text + '<br>';
        this.elem.scrollTop = this.elem.scrollHeight;
    }
}
