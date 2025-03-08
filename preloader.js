const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
	sysCall: (args, callback) => {
		ipcRenderer.send('sysCall', args);
		ipcRenderer.on('sysCallResponse', (e, result) => {
			if(callback !== undefined){
				callback(result)
			}
		})
	}
})