const {state, effect} = window.Reactive;
class UI{
	constructor(){
		this.doubleInput = document.getElementById('double-input');
		this.windowsContainer = document.getElementById('windows-container');
		this.windowsList_modal = document.getElementById('windows-list__modal');
		this.windowsList_closeButton = document.getElementById('windows-list__close-button');
		this.hotkeyInput = document.getElementById('hotkey-input');
        this.listenModeDouble = document.getElementById('listen-mode-double');
        this.listenModeHotkey = document.getElementById('listen-mode-hotkey');
        this.windowSelector1 = document.getElementById('window-selector-1');
        this.windowSelector2 = document.getElementById('window-selector-2');
	}
    reapplySettings(newValue){
        function markActualMode(mode){
            if(mode === 'double'){
                uiInterface.listenModeDouble.style.borderColor = 'var(--accent)';
                uiInterface.listenModeHotkey.style.borderColor = 'var(--inactive)';
            }
            else{
                uiInterface.listenModeDouble.style.borderColor = 'var(--inactive)';
                uiInterface.listenModeHotkey.style.borderColor = 'var(--accent)';
            }
        }
        this.doubleInput.value = newValue.double ? translateName(newValue.double) : '';
        this.hotkeyInput.value = newValue.hotkey ? newValue.hotkey.map(key => translateName(key)).join('+') :  '';
        markActualMode(newValue.mode);
        app.setSettings();
    }
    initSettingsState(){
        state.settings = settingsController.SETTINGS;
        effect('settings', (newValue) => {
            this.reapplySettings(newValue);
        })
    }
    initWindowsState(){
        state.windows = {0: {title: null, hwnd: 0}, 1: {title: null, hwnd: 0}};
        effect('windows.0', (newValue) => {
            uiInterface.windowSelector1.innerText = newValue.title !== null ? newValue.title : 'Окно #1';
        })
        effect('windows.1', (newValue) => {
            uiInterface.windowSelector2.innerText = newValue.title !== null ? newValue.title : 'Окно #2';
        })
    }
    initUIState(){
        this.initSettingsState();
        this.initWindowsState();
    }
	initDefault(){
		this.windowsList_closeButton.addEventListener('click', this.closeWindowsList);
        this.initUIState();
        this.reapplySettings(settingsController.SETTINGS);
	}
	showWindowsList(windowsList){
        this.windowsList_modal.style.display = "flex";
        const html = windowsList.map((window) => {
            return `<div class="text-white cursor-pointer hover:border-b-white border-b-1 border-b-transparent" hwnd="${window.hwnd}">${window.title}</div>`
        }).join('');
        this.windowsContainer.innerHTML = html;
        const divs = this.windowsContainer.getElementsByTagName('div');
        for(let i = 0; i < divs.length; i++){
            divs[i].addEventListener('click', function(){
                app.setWindow(this.getAttribute('hwnd'), this.innerText);
            }, {once: true})
        }
    }
	closeWindowsList(){
        uiInterface.windowsList_modal.style.display = 'none';
    }
}
const uiInterface = new UI();