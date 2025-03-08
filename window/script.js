const closeAppButton = document.getElementsByClassName('button-close')[0];
const shortCutSwitchers = document.getElementsByClassName('shortcut-setting__item__header');
const bootSettingSwitcher = document.getElementsByClassName('body-container__boot-setting__container')[0];
const menuItems = document.getElementsByClassName('body-container__menu__item');
const settingsDoublePressInterface = document.getElementById('setting-doublePress-interface');
const settingsShortCutInterface = document.getElementById('setting-shortcut-interface');
const windowInputs = document.getElementsByClassName('body-container__window-selector');
const modalInputWindow = document.getElementsByClassName('modal-input-window')[0];
const processList = document.getElementsByClassName('modal-input-window__process-list')[0];
const processSearch = document.getElementById('input-window-process');
let settings = localStorage.getItem('settings');

let bootSetting = false;

for(let i = 0; i < menuItems.length; i++){
    menuItems[i].addEventListener('click', () => {
        const setting = menuItems[i].getAttribute('group');
        const currentActiveWindow = document.getElementsByClassName('body-container__window_active')[0];
        const windowToActivate = document.getElementsByClassName(`body-container__window-${setting}`)[0];
        currentActiveWindow.classList.remove('body-container__window_active');
        windowToActivate.classList.add('body-container__window_active');
    })
}

processSearch.addEventListener('input', function(e){
    const value = this.value;
    const regex = new RegExp(value,'i');
    const innerItems = processList.getElementsByClassName('process-list__item');
    for(let i = 0; i < innerItems.length; i++){
        if(!regex.test(innerItems[i].getAttribute('name'))){
            innerItems[i].style.display = 'none';
        }
        else{
            innerItems[i].style.display = 'block';
        }
    }
})

for(let i = 0; i < windowInputs.length; i++){
    windowInputs[i].addEventListener('click', function(e){
        const index = i;
        modalInputWindow.classList.add('modal_active');
        document.addEventListener('keyup', function(e){
            if(e.key === 'Escape'){
                modalInputWindow.classList.remove('modal_active');
            }
        }, {once: true})
        window.electronAPI.sysCall({action: 'getCurrentWindows'}, (windows) => {
            const html = windows.map((window) => {
                return `<div class="process-list__item" pid=${window.pid} wid=${window.id} name="${window.name}">${window.name}</div>`
            })
            processList.innerHTML = html;
            const els = processList.getElementsByClassName('process-list__item');
            
            for(let j = 0; j < els.length; j++){
                els[j].addEventListener('click', function(e){
                    const currentSettings = JSON.parse(localStorage.getItem('settings'));
                    const currentWindows = currentSettings.windows;
                    currentWindows[i] = {
                        pid: this.getAttribute('pid'),
                        wid: this.getAttribute('wid'),
                        name: this.getAttribute('name')
                    }
                    console.log(index);
                    const placeholder = windowInputs[index].getElementsByClassName('window-selector__text')[0];
                    placeholder.innerText = currentWindows[index].name;
                    modalInputWindow.classList.remove('modal_active');
                    saveSettings({windows: currentWindows});
                }, {once: true})
            }
        })
    })
}

bootSettingSwitcher.addEventListener('click', () => {
    const bootSetting = !(JSON.parse(localStorage.getItem('settings')).boot)
    if(bootSetting){
        bootSettingSwitcher.classList.add('body-container__boot-setting__container_active');
        saveSettings({boot: true})
    }
    else{
        saveSettings({boot: false})
        bootSettingSwitcher.classList.remove('body-container__boot-setting__container_active');
    }
})

for(let i = 0; i < shortCutSwitchers.length; i++){
    shortCutSwitchers[i].addEventListener('click', (e) => {

        const shortcutSetting = (JSON.parse(localStorage.getItem('settings'))).trigger;

        const setting = e.target.closest('.shortcut-setting__item__header').getAttribute('setting');

        if(setting === shortcutSetting){return;}
        else{
            const currentActive = document.getElementsByClassName('body-container__shortcut-setting__item_active')[0];
            currentActive.classList.remove('body-container__shortcut-setting__item_active');
    
            if(setting === 'doublePress'){
                saveSettings({trigger: 'double', keys: ''})
                document.getElementById('setting-doublePress').classList.add('body-container__shortcut-setting__item_active');
                settingsShortCutInterface.innerText = 'Нажмите для ввода сочетания';
            }
            else{
                saveSettings({trigger: 'shortcut', keys: ''})
                document.getElementById('setting-shortcut').classList.add('body-container__shortcut-setting__item_active')
                settingsDoublePressInterface.innerText = 'Нажмите для ввода клавиши';
            }

            shortcutSetting = setting;
        }
    })
}

closeAppButton.addEventListener('click', () => {
    window.electronAPI.sysCall({action: 'closeApp'});
});

if(settings === null){
    window.electronAPI.sysCall({action: 'getSettings'}, (Lsettings) => {
        localStorage.setItem('settings', JSON.stringify(Lsettings));
        settings = Lsettings;
        applySettingsToUI();
    });
}
else{
    settings = JSON.parse(settings);
    applySettingsToUI()
}

settingsDoublePressInterface.addEventListener('click', () => {
    settingsDoublePressInterface.classList.add('shortcut-setting__item__body_active');
    let key;
    document.addEventListener('keydown', (e) => {
        key = [e.key];
        settingsDoublePressInterface.innerText = key;
        settingsDoublePressInterface.classList.remove('shortcut-setting__item__body_active');
        saveSettings({keys: key});
    }, {once: true})
})
settingsShortCutInterface.addEventListener('click', () => {
    settingsShortCutInterface.classList.add('shortcut-setting__item__body_active');
    let keys = [];
    let counter = 0;

    function handleKeyDown(e){
        if(counter < 3 && !keys.includes(e.key)){
            keys.push(e.key)
            settingsShortCutInterface.innerText = keys.join('+');
            counter++;
        }
        if(counter > 2){
            summarize();
        }
    }

    function summarize(){
        document.removeEventListener("keydown", handleKeyDown);
        settingsShortCutInterface.classList.remove('shortcut-setting__item__body_active');
        saveSettings({keys: keys});
    }

    document.addEventListener('keydown', handleKeyDown)

    document.addEventListener('keyup', (e) => {
        summarize();
    }, {once: true})
})

function applySettingsToUI(){
    //Применение настроек клавиш
    const settingsShortCut = document.getElementById('setting-shortcut');
    const settingsDoublePress = document.getElementById('setting-doublePress');
    if(settings.trigger === 'double'){
        settingsDoublePress.classList.add('body-container__shortcut-setting__item_active');
        settingsDoublePressInterface.innerText = settings.keys !== '' ? settings.keys : 'Нажмите для ввода клавиши';
    }
    if(settings.trigger === 'shortcut'){
        settingsShortCut.classList.add('body-container__shortcut-setting__item_active');
        settingsShortCutInterface.innerText = settings.keys !== '' ? settings.keys.join('+') : 'Нажмите для ввода сочетания';
    }

    //Применение настроек окон

    //Применение настроек автозагрузки
    const settingsBootInterface = document.getElementById('setting-boot-interface');
    if(settings.boot){
        settingsBootInterface.classList.add('body-container__boot-setting__container_active');
    }
}

function saveSettings(setting){
    let settings = JSON.parse(localStorage.getItem('settings'));
    settings = {...settings, ...setting}
    localStorage.setItem('settings', JSON.stringify(settings));
    window.electronAPI.sysCall({action: 'saveSettings', setting: setting})
}