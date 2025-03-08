import electron from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import settingsManager from './settings.module.js';
import { GlobalKeyboardListener } from 'node-global-key-listener';
import windowsManager from './cjs/windowsManager.js';
import fs from 'node:fs';
const { app, BrowserWindow, ipcMain, Tray, nativeImage, Menu, globalShortcut } = electron;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const trayIcon = nativeImage.createFromPath('./l32.png');
const mainIcon = nativeImage.createFromPath('./l256.png');

const createWindow = () => {
	
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		icon: mainIcon,
		frame: false,
		webPreferences:{
			preload: path.join(__dirname, 'preloader.js'),
		}
	})

	ipcMain.on('sysCall', (e, args)=>{
		console.log(args.action);
		switch(args.action){
			case 'closeApp':{
				hideInTray()
				win.hide();
				break;
			}
			case 'getSettings':{
				e.reply('sysCallResponse', settingsManager.settings)
				break;
			}
			case 'saveSettings':{
				const setting = args.setting;
				settingsManager.updateSettings(setting);
				break;
			}
			case 'getCurrentWindows':{
				let windows = windowsManager.getWindowsList().filter((window) => {
					const bounds = window.getBounds();
					return bounds.height !== 0 && bounds.width !== 0;
				});
				windows = windows.filter((window) => {
					return window.getTitle() !== '';
				})
				const windowsList = windows.map((window) => {
					return {
						name: window.getTitle(),
						pid: window.processId,
						id: window.id
					};
				})
				e.reply('sysCallResponse',windowsList);
				break;
			}
		}
	})

	let appIcon = null;

	function hideInTray(){

		if(appIcon !== null){
			return;
		}

		appIcon = new Tray(trayIcon);
	
		const contextMenu = Menu.buildFromTemplate([
			{
			  label: 'Показать окно',
			  click: () => {
				win.show();
			  }
			},
			{
			  label: 'Выход',
			  click: () => {
				app.quit();
			  }
			}
		  ]);
		  
		appIcon.setContextMenu(contextMenu);
	}

	win.loadFile('./window/index.html')
}

function checkWindows(){
	const windows = settingsManager.settings.windows;
	if(windows[0] !== undefined && windows[1] !== undefined){
		return true;
	}
	else{
		return false;
	}
}

function handleShortCut(){
	console.log('activated');
}
function handleDouble(){
	if(checkWindows()){
		windowsManager.initWindows(settingsManager.settings.windows);
		windowsManager.switchWindows()
	}
	console.log('activated');

}

function normalizeKeyName(name){
	switch(name.toLowerCase()){
		case 'left ctrl':
		case 'right ctrl':
		case 'ctrl':{
			return 'Control';
		}
		case 'left shift':
		case 'right shift':
		case 'shift':{
			return 'Shift';
		}
		case 'left alt':
		case 'right alt':
		case 'alt':{
			return 'Alt';
		}
		case 'return':{
			return 'Enter';
		}
		case 'left arrow':{
			return 'ArrowLeft';
		}
		case 'right arrow':{
			return 'ArrowRight';
		}
		case 'up arrow':{
			return 'ArrowUp';
		}
		case 'down arrow':{
			return 'ArrowDown';
		}
		case 'Numpad clear':{
			return 'Clear';
		}
		case 'numpad divide':{
			return '/';
		}
		case 'numpad multiply':{
			return '*'
		}
		case 'numpad minus':{
			return '-'
		}
		case 'numpad plus':{
			return '+';
		}
		case 'ins':{
			return 'Insert';
		}

		default:{
			if(/^[a-z]$/i.test(name)){
				console.log('is letter');
				return name.toLowerCase();
			}
			name = name.toLowerCase();
			name = name.split(' ');
			name = name.map((nameItem) => {
				nameItem = nameItem.split('');
				nameItem[0] = nameItem[0].toUpperCase();
				return nameItem.join('');
			})
			name = name.join('');
			return name
		}
	}
}

function registerShortCut(){
	const v = new GlobalKeyboardListener();
	if(Object.keys(settingsManager.settings).length !== 0){
		if(settingsManager.settings.trigger === 'double'){
			let timing = null;
			v.addListener((e, down) => {
				if(e.state === 'UP'){
					if(normalizeKeyName(e.name) === settingsManager.settings.keys[0] && timing === null){
						timing = Date.now()
					}
					else if(normalizeKeyName(e.name) === settingsManager.settings.keys[0] && timing !== null){
						const timeDiff = Date.now() - timing;
                        if(timeDiff < 300){
                            handleDouble();
							timing = null;
                        }
						else{
							timing = null;
						}
					}
				}
			})
		}
		if(settingsManager.settings.trigger === 'shortcut'){
			
			v.addListener((e, down) => {
				console.log(e.state);
				if(e.state === 'DOWN'){
					console.log('raw: ', e.name);
					console.log(normalizeKeyName(e.name));
				}
			})
		}
	}
	else{
		setTimeout(() => {
			registerShortCut()
		}, 500);
	}
}

app.whenReady().then(() => {
	settingsManager.initSettings();
	registerShortCut()
	createWindow()
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})