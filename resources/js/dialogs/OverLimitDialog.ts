import State from "../State";
import Dialog from "./Dialog";

export default class OverLimitDialog extends Dialog
{
    constructor(state: State)
    {
        super(
            `Your Code Is Too Big!`,
            `<p>
                You have tried to build or share code that is just too darn big.
                Revise your code to be within the limit of ${state.panel_Editor.max.toLocaleString()}
                characters and try again.
            </p>`,
            () => { this.log('Ok'); },
            undefined,
            document.querySelector('#content') as HTMLElement,
        );

        this.open();
    }
};
