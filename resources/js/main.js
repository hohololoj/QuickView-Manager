let hotkeyBuffer = [];
class App{
    constructor(){
        this.activeWindows = [];
        this.currentListeningWindow = null;
    }
    async closeApp(){
        await hookInterface.killHook();
        Neutralino.app.exit();
    }
    async crash(title, err, button, icon){
        await Neutralino.os.showMessageBox(title, err, button, icon);
        await hookInterface.killHook();
        Neutralino.app.exit(1);
    }
    async hideInTray(){
        await Neutralino.window.hide();
    }
    async setupTray(){
        await Neutralino.os.setTray({
            icon: '/resources/icons/icon.ico',
            menuItems: [
                {id: 'SHOW', text: 'Показать'},
                {id: 'QUIT', text: 'Закрыть'}
            ]
        })
        Neutralino.events.on('trayMenuItemClicked', (event) => {
            switch(event.detail.id) {
                case 'SHOW':{
                    Neutralino.window.show();
                    Neutralino.window.focus();
                    break;
                }
                case 'QUIT':{
                    app.closeApp();
                    break;
                }
            }
        })
    }
    async initDefaultEvents(){
        Neutralino.init();
        Neutralino.window.setIcon('resources/icons/icon.ico');
        Neutralino.events.on('windowClose', app.hideInTray);
        await settingsController.initSettings();
        await hookInterface.spawnHook();
        uiInterface.initDefault();
        await app.setupTray();
        return Neutralino.events.on('ready', () => {});
    }
    checkHotkey(){
        const hotkey = hotkeyBuffer;
        if(hotkey.length < 2 || hotkey.length > 3){
            hotkeyBuffer = [];
            uiInterface.hotkeyInput.value = state.settings.hotkey.join('+') || ''
            return
        }
        settingsController.updateSettings({hotkey: hotkey})
    }
    setWindow(hwnd, title){
        state.windows[this.currentListeningWindow] = {title, hwnd};
        this.currentListeningWindow = null;
        uiInterface.closeWindowsList();
        const str = `0:${state.windows[0].hwnd}^1:${state.windows[1].hwnd}`;
        hookInterface.HOOK_stdin(`setWindow:${str}`);
    }
    setSettings(){
        const double = state.settings.double ? translateVkCode(state.settings.double) : 255;
        const hotkey_raw = state.settings.hotkey !== null ? hotkeyUniform(state.settings.hotkey) : [255,255,255];
        const hotkey = hotkey_raw.map((key) => {
            if(typeof key === "number"){return key};
            return translateVkCode(key)
        }).join('+');
        const mode = state.settings.mode === 'double' ? 0 : 1;
        const str = `setSettings:${double}^${hotkey}^${mode}`;
        hookInterface.HOOK_stdin(str);
    }
    chmode(mode){
        settingsController.updateSettings({mode: mode});
    }
}

function handleKeyInput(e){
    e.preventDefault();
    const code = e.code;
    if(code !== ''){document.removeEventListener('keydown', handleKeyInput)}
    settingsController.updateSettings({double: code});
}

function handleHotkeyInput(e){
    e.preventDefault();
    const code = e.code;
    if(code !== '' && hotkeyBuffer.length < 3){
        if(hotkeyBuffer.at(-1) !== code){
            hotkeyBuffer.push(code)
            uiInterface.hotkeyInput.value = hotkeyBuffer.map(key => translateName(key)).join('+');
        }
    }
}

function changeDouble(){
    document.addEventListener('keydown', handleKeyInput)
}

function changeHotkey(){
    hotkeyBuffer = [];
    document.addEventListener('keydown', handleHotkeyInput)
    document.addEventListener('keyup', function(){
        document.removeEventListener('keydown', handleHotkeyInput);
        app.checkHotkey();
    }, {once: true})
}

function activateWindow(num){
    app.currentListeningWindow = num;
    hookInterface.HOOK_stdin(`getWindows`, app.showWindowsList);
}

function hotkeyUniform(arr){
    return arr.length === 3 ? arr : [...arr, 255]
}

const app = new App();
app.initDefaultEvents();