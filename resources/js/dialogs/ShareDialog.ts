import State from "../State";
import Dialog from "./Dialog";

export default class ShareDialog extends Dialog
{
    shareUrl: string;
    embedUrl: string;

    constructor(state: State, shareUrl: string, embedUrl: string, imageUrl: string)
    {
        super(
            `Your Tinker is ready to Share!`,
            `<div class="share-dialog">
                <img src="${imageUrl}" alt="Screenshot of PGEtinker share">
                <div class="links">
                    <div class="input-group">
                        <label for="share-url">Share:</label>
                        <input type="text" id="share-url" value="${shareUrl}" readonly="">
                        <button type="button" id="copy-share-url">Copy</button>
                    </div>
                    <div class="input-group">
                        <label for="embed-url">Embed:</label>
                        <input type="text" id="embed-url" value="${embedUrl}" readonly="">
                        <button type="button" id="copy-embed-url">Copy</button>
                    </div>
                </div>
            </div>`,
            () => { this.log('Ok'); },
            undefined,
            document.querySelector('#content') as HTMLElement,
        );
        this.shareUrl = shareUrl;
        this.embedUrl = embedUrl;
        this.open();
    }

    open()
    {
        super.open();
        
        let copyShareUrlButton = document.querySelector('#copy-share-url');
        copyShareUrlButton?.addEventListener('click', async (event) =>
        {
            event.preventDefault();
            await navigator.clipboard.writeText(this.shareUrl);
            (event?.target as HTMLElement).innerHTML = 'Copied!';
        });
        
        let copyEmbedUrlButton = document.querySelector('#copy-embed-url');
        copyEmbedUrlButton?.addEventListener('click', async (event) =>
        {
            event.preventDefault();
            await navigator.clipboard.writeText(this.embedUrl);
            (event?.target as HTMLElement).innerHTML = 'Copied!';
            
        });
    }
};
