import GoldenLayout from "golden-layout";
import Panel from "./Panel";
import State from "../State";

import * as monaco from "monaco-editor";
import axios from "axios";

export default class EditorPanel extends Panel
{
    monaco?          : monaco.editor.IStandaloneCodeEditor;
    monacoDecorator  : string[];
    elemEditor!      : HTMLDivElement;
    elemStatus!      : HTMLDivElement;
    length           : Number;
    max              : Number;

    constructor(state: State)
    {
        super(state);
        this.log('constructor');
        
        this.length = 0;
        this.max    = 50000;
        this.monacoDecorator = [];

        this.state.layout.registerComponent( 'editor', (container: GoldenLayout.Container, componentState: any) =>
        {
            this.log('register');
            this._container = container;

            container.getElement().html(this.html());
            container.on('open', () =>
            {
                this.log('open');

            });
            
            container.on('resize', () =>
            {
                this.monaco?.layout();
            });

        });

        this.state.layout.on('initialised', () =>
        {
            this.log('initialised.');
            this.elemEditor = document.querySelector<HTMLDivElement>('#editor-panel .code-editor')!;
            this.elemStatus = document.querySelector<HTMLDivElement>('#editor-panel .status')!;
            
            this.monaco = monaco.editor.create(this.elemEditor, {
                language: 'cpp',
                model   : null,
                theme   : `vs-${this.state._theme}`,
            });
            
            this.monaco.setModel(monaco.editor.createModel('', 'cpp'));
            this.getCode();

            ['olcPixelGameEngine.h','olcPGEX_Graphics2D.h','olcPGEX_Graphics3D.h','olcPGEX_Network.h','olcPGEX_PopUpMenu.h','olcPGEX_QuickGUI.h','olcPGEX_RayCastWorld.h','olcPGEX_SplashScreen.h','olcPGEX_TransformedView.h','olcPGEX_Wireframe.h','olcUTIL_Animate2D.h','olcUTIL_Camera2D.h','olcUTIL_Geometry2D.h','olcUTIL_Palette.h','olcUTIL_QuadTree.h','olcSoundWaveEngine.h',].forEach((header) =>
            {
                this.LoadModel(header);
            });
    
            this.monaco.onDidChangeCursorPosition((event) => 
            {
                this.UpdateStatusIndicators();
            });

            this.monaco.onDidChangeModelContent((event) =>
            {
                this.UpdateStatusIndicators();
                localStorage.setItem('pgeTinkerSourceText', JSON.stringify(this.monaco?.getModel()?.getValue()));
            });

            let compileButton       = document.getElementById('compile') as HTMLElement;
            let defaultCodeButton   = document.getElementById('default-code') as HTMLElement;
            let defaultLayoutButton = document.getElementById('default-layout') as HTMLElement;
            let toggleThemeButton   = document.getElementById('toggle-theme') as HTMLElement;
            let shareButton         = document.getElementById('share') as HTMLElement;

            compileButton.addEventListener('click', (event) =>
            {
                event.preventDefault();
                this.state.compiler.compile();
            });

            defaultCodeButton.addEventListener('click', (event) =>
            {
                event.preventDefault();
                this.getDefaultCode();
            });

            defaultLayoutButton.addEventListener('click', (event) =>
            {
                event.preventDefault();
                localStorage.removeItem('pgeTinkerSavedLayout');
                window.location.reload();
            });

            shareButton.addEventListener('click', (event) =>
            {
                event.preventDefault();
                this.state.compiler.share();
            });
            
            toggleThemeButton.addEventListener('click', (event) =>
            {
                event.preventDefault();
                this.state.toggleTheme();
            });

        });
    }

    UpdateStatusIndicators()
    {
        this.length = new Number(this.monaco?.getModel()?.getValueLength());

        this.elemStatus.classList.toggle('too-fucking-big', (this.length > this.max));
        let characterIndicator = `<span>${this.length.toLocaleString()} / ${this.max.toLocaleString()} characters.</span>`;
        let positionIndicator = `<span>Ln ${this.monaco?.getPosition()?.lineNumber}, Col ${this.monaco?.getPosition()?.column}</span>`;
    
        let left = ``;
        let right = `${characterIndicator}${positionIndicator}`;
    
        this.elemStatus.innerHTML = `<div class="status-left">${left}</div><div class="status-right">${right}</div>`;
    }
        
    getCode()
    {
        if(this.state.pgeTinkerShareSlug !== 'null')
        {
            this.getCodeFromServer(`/api/code/${this.state.pgeTinkerShareSlug}`);
            return;
        }

        let code : string | null = localStorage.getItem('pgeTinkerSourceText');
        
        if(code !== null)
        {
            this.monaco?.getModel()?.setValue(JSON.parse(code!));
            this.UpdateStatusIndicators();
            return;
        }

        this.getDefaultCode();
    }

    getDefaultCode()
    {
        this.getCodeFromServer('/api/default-code');
    }

    
    getCodeFromServer(path: string)
    {
        axios.get(path)
        .then((response) =>
        {
            if(response.data.success)
                this.monaco?.getModel()?.setValue(response.data.code);
            
            this.UpdateStatusIndicators();
        })
        .catch((error) =>
        {
            this.log(error);
        });
    }

    LoadModel(fileName: string)
    {
        axios.get(`/api/monaco-model/${fileName}`).then(function(response)
        {
            if(response.data.success)
            {
                monaco.editor.createModel(response.data.code, 'cpp');
            }
        })
        .catch(function (error)
        {
            console.log(error);
        });
    }    
    
    html() : string
    {
        return `
<div id="editor-panel">
    <div class="menu">
        <ul class="editor-menu">
            <li><button type="button" id="default-code">Default Code</button></li>
            <li class="separator"></li>
            <li><button type="button" id="toggle-theme">Toggle Theme</button></li>
            <li><button type="button" id="default-layout">Default Layout</button></li>
        </ul>
        <ul class="build-menu">
            <li><button type="button" id="share">Share</button></li>
            <li><button type="button" id="compile">Build &amp; Run</button></li>
            <!--<li><button type="button" id="refresh-player">Refresh Player</button></li>-->
        </ul>
    </div>
    <div class="code-editor"></div>
    <div class="status">Loading</div>
</div>
        `;
    }
    
    setTheme(theme: string)
    {
        // ensure valid theme
        if(theme !== 'light' && theme !== 'dark')
            theme = 'dark';
        
        this.monaco?.updateOptions({ theme: `vs-${theme}`});
    }

    gotoAndFocus(line: number, column: number)
    {
        this.monaco!.setPosition({ lineNumber: line, column: column });
        this.monaco!.revealPositionInCenter({ lineNumber: line, column: column });
        this.monaco!.focus();
    }    
}
