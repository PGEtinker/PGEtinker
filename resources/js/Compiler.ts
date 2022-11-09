import Base from "./Base";
import State from "./State";

import axios from "axios";
import * as monaco from "monaco-editor";

export default class Compiler extends Base
{
    _compiling: boolean;
    state: State;

    constructor(state : State)
    {
        super();
        this.state = state;
        
        this._compiling = false;
    }

    compile()
    {
        this.log('Compile');

        if(this._compiling)
            return;
        
        if(this.state.panel_Editor.length > this.state.panel_Editor.max)
        {
            alert(`I know, I know! You want to compile a big program in this little toy, but treating everybody equally means you're limited to ${this.state.panel_Editor.max.toLocaleString()} characters just like everybody else.`);
            return;
        }

        this._compiling = true;
        this.state.panel_Player.elemStatus!.className = 'compiling';
        this.state.panel_Info.elem.innerHTML = '';

        window.history.replaceState(null, 'PGEtinker', '/');

        this.state.panel_Info.focus();
        this.state.panel_Editor.monacoDecorator = this.state.panel_Editor.monaco!.deltaDecorations(this.state.panel_Editor.monacoDecorator, []);

        axios.post(`/api/compile`, {code: this.state.panel_Editor.monaco!.getModel()!.getValue()})
        .then((response) =>
        {
            this.processCompilerResponse(response);

            if(response.data.success)
            {
                this.state._playerFilename = response.data.filename;
                
                localStorage.setItem('pgeTinkerWasmFilename', this.state._playerFilename);
                this.state.panel_Player.elemFrame!.src = `/player/${this.state._playerFilename}`;
                setTimeout(() =>
                {
                    this.state.panel_Player.elemStatus!.className = '';
                    this.state.panel_Console.focus();
                }, 1000);
            }
        })
        .catch((error) =>
        {
            // act like we care, spoiler alert, we don't
            console.log(error);
        });
            
    }

    share()
    {
        this.log('Share');

        if(this._compiling)
            return;
        
        if(this.state.panel_Editor.length > this.state.panel_Editor.max)
        {
            alert(`I know, I know! You want to compile a big program in this little toy, but treating everybody equally means you're limited to ${this.state.panel_Editor.max.toLocaleString()} characters just like everybody else.`);
            return;
        }

        this._compiling = true;
        this.state.panel_Player.elemStatus!.className = 'compiling';
        this.state.panel_Info.elem.innerHTML = '';

        window.history.replaceState(null, 'PGEtinker', '/editor');

        this.state.panel_Info.focus();
        this.state.panel_Editor.monacoDecorator = this.state.panel_Editor.monaco!.deltaDecorations(this.state.panel_Editor.monacoDecorator, []);

        axios.post(`/api/share`, {code: this.state.panel_Editor.monaco!.getModel()!.getValue()})
        .then((response) =>
        {
            this.processCompilerResponse(response);

            if(response.data.success)
            {
                this.state._playerFilename = response.data.slug;
                
                localStorage.setItem('pgeTinkerWasmFilename', this.state._playerFilename);
                this.state.panel_Player.elemFrame!.src = `/player/${this.state._playerFilename}`;
                setTimeout(() =>
                {
                    this.state.panel_Player.elemStatus!.className = '';
                    this.state.panel_Console.focus();
                }, 1000);
                
                window.history.replaceState(null, 'PGEtinker', response.data.share_url);
            }
        })
        .catch((error) =>
        {
            // act like we care, spoiler alert, we don't
            console.log(error);
        });

    }

    processCompilerResponse(response: any)
    {
        let regExInfo = /(source.cpp|olcPixelGameEngine.h):([0-9]+):([0-9]+): (note|warning|error|fatal error):/g;
        
        if(!response.data.success)
        {
            this.state.panel_Player.elemStatus!.className = 'fail';
        }

        let info = new Array();
        let m    = null;
        
        while((m = regExInfo.exec(response.data.message)) !== null)
        {
            if (m.index === regExInfo.lastIndex)
            {
                regExInfo.lastIndex++;
            }

            info.push({ input: m[0], line: parseInt(m[2]), column: parseInt(m[3]), type: m[4].replace('fatal ', '') });
        }
        
        let out = response.data.message;
        let entries: any = [];
        
        info.forEach(function(item)
        {

            if(item.input.indexOf('source.cpp') === 0)
            {
                out = out.replace(item.input, `<a href="#" onclick="PGEtinker.gotoAndFocus(${item.line}, ${item.column}); return false;">${item.input}</a>`);
                
                // add the decoration
                entries.push({
                    range: new monaco.Range(item.line, 1, item.line, 2),
                    options: {
                        isWholeLine: true,
                        className: 'editor-'+item.type,
                    }
                });
                
            }
                
            if(item.input.indexOf('olcPixelGameEngine.h') === 0)
                out = out.replace(item.input, `<a href="https://github.com/OneLoneCoder/olcPixelGameEngine/blob/develop/olcPixelGameEngine.h#L${item.line}" target="_blank">${item.input}</a>`);
        });
        
        this.state.panel_Info.elem.innerHTML = out;
        this.state.panel_Editor.monacoDecorator = this.state.panel_Editor.monaco!.deltaDecorations([], entries);
        
        this._compiling = false;
    }
}