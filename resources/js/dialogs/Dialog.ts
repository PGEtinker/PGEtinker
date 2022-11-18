import Base from "../Base";

interface DialogEvent
{
    (): void;
};

export default class Dialog extends Base
{
    // container element
    parentElem: HTMLElement;
    
    // 
    title?: string;
    template?: string;
    
    // event handlers
    ok?: DialogEvent;
    cancel?: DialogEvent;

    constructor(title?: string, template?: string, ok?: DialogEvent, cancel?: DialogEvent, container?: HTMLElement | string)
    {
        super();
        
        let parent = document.querySelector('body') as HTMLElement;

        if(typeof container === 'object')
            parent = container as HTMLElement;
    
        if(typeof container === 'string')
            parent = document.querySelector(container) as HTMLElement;
        
        this.parentElem = parent;
        this.title = title;
        this.template = template;
        this.ok = ok;
        this.cancel = cancel;
    }
    
    open()
    {
        let title   : string = (this?.title !== undefined)        ? this.title        : '';
        let template: string = (this?.template !== undefined) ? this.template : '';
        
        let window : HTMLDivElement = document.createElement('div');
        window.className = 'window';
        
        let header : HTMLDivElement = document.createElement('div');
        header.className = 'header';
        header.append(document.createTextNode(title));

        let content: HTMLDivElement = document.createElement('div');
        content.className = 'content';
        // content.appendChild(template);
        content.innerHTML = template;

        let footer : HTMLDivElement = document.createElement('div');
        footer.className = 'footer';
        
        let dialog: HTMLDivElement = document.createElement('div');
        dialog.className = "dialog";

        let footerFlag: boolean = false;

        if(this?.cancel !== undefined)
        {
            let cancelButton: HTMLButtonElement = document.createElement('button');
            cancelButton.className = 'cancel';
            cancelButton.setAttribute('type', 'button');
            cancelButton.append(document.createTextNode('Cancel'));
            cancelButton.addEventListener('click', (event) => { event.preventDefault(); this.onCancel(); });
            footer.appendChild(cancelButton);
            footerFlag = true;
        }

        if(this?.ok !== undefined)
        {
            let okButton: HTMLButtonElement = document.createElement('button');
            okButton.className = 'ok';
            okButton.setAttribute('type', 'button');
            okButton.append(document.createTextNode('OK'));
            okButton.addEventListener('click', (event) => { event.preventDefault(); this.onOk(); });
            footer.appendChild(okButton);
            footerFlag = true;
        }

        window.appendChild(header);
        window.appendChild(content);
        
        if(footerFlag)
            window.appendChild(footer);
        
        dialog.appendChild(window);
        this.parentElem.appendChild(dialog);
        
    }

    close()
    {
        this.parentElem.querySelector('.dialog')?.remove();
    }

    onOk()
    {
        if(this?.ok !== undefined)
            this.ok();
        
        this.close();
    }

    onCancel()
    {
        if(this?.cancel !== undefined)
            this.cancel();
        
        this.close();
    }
};
