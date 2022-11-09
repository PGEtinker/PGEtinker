import './bootstrap';
import State from './State';

declare global {
    interface Window { PGEtinker: State; }
};

let state = new State();
state.layout.init();

window.PGEtinker = state;
