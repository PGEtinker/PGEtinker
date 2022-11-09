import debug from "./debug";

export default class Base
{
    constructor()
    {
    }
    
    log(...args: any[])
    {
        if(debug)
            console.log(`${this.constructor.name}:`, Array.prototype.slice.apply(args).join(' '));
    }    
    
}