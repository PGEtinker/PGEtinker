import Base from "../Base";
import State from "../State";
import GoldenLayout from "golden-layout";

export default class Panel extends Base
{
    state : State;
    _container: GoldenLayout.Container | null;

    constructor(state: State)
    {
        super();
        this.state     = state;
        this._container = null;
    }

    focus()
    {
        if(this._container?.parent.parent.type === 'stack')
        {
            this._container.parent.parent.setActiveContentItem(this._container.parent);
        }
    }
};
