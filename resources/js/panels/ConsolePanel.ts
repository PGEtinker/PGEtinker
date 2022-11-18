import GoldenLayout from "golden-layout";
import { TypeHierarchyPrepareRequest } from "monaco-languageclient/.";
import State from "../State";
import Panel from "./Panel";

export default class ConsolePanel extends Panel
{
    elem!: HTMLDivElement;
    elemNewEntryIndicator!: HTMLDivElement;

    entryBuffer: Array<string>;
    entryInterval: NodeJS.Timer;

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
            this.elem = document.querySelector('#console-panel div') as HTMLDivElement;
            this.elemNewEntryIndicator = document.querySelector('.new-entry-indicator') as HTMLDivElement;

            // hide indicator when auto scrolling
            this.elem.addEventListener('scroll', (event) =>
            {
                if(this.elem.scrollTop + this.elem.offsetHeight >= this.elem.scrollHeight)
                    this.elemNewEntryIndicator.classList.toggle('active', false);
            });
            
            // scroll to bottom and auto scroll when clicking indicator
            this.elemNewEntryIndicator.addEventListener('click', (event) =>
            {
                this.elem.scrollTop = this.elem.scrollHeight;
                this.elemNewEntryIndicator.classList.toggle('active', false);
            })
        });
        
        this.entryBuffer = [];
        
        this.entryInterval = setInterval(() =>
        {
            if(this.entryBuffer.length == 0)
                return;
            
            let shouldScroll = this.elem.scrollTop + this.elem.offsetHeight >= this.elem.scrollHeight;
            
            while(this.entryBuffer.length > 0)
            {
                let entry = document.createElement('div');
                entry.className = 'entry';
                entry.append(document.createTextNode(this.entryBuffer.shift() as string));
                this.elem.appendChild(entry);
            }
    
            if(this.elem.childNodes.length > 1000)
                this.elem.firstChild?.remove();
                

            if(shouldScroll)
            {
                this.elem.scrollTop = this.elem.scrollHeight;
            }
            else
            {
                this.elemNewEntryIndicator.classList.toggle('active', true);
            }
                
        }, 100);
    }

    html() : string
    {
        return `
<div id="console-panel">
    <div class="entry-container"></div>
    <div class="new-entry-indicator">
        New Entries <i class="fa fa-chevron-down" aria-hidden="true"></i>
    </div>
</div>
        `;
    }

    clear()
    {
        this.elem.innerHTML = '';
        this.entryBuffer = [];
    }

    write(text: string)
    {
        this.entryBuffer.push(text);
    }
}
