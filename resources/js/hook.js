class Hook{
	constructor(){
		this.HOOK_ID = null;
	}
	async HOOK_stdin(char_100){
		if(this.HOOK_ID === null){app.crash('Что-то пошло не так', `HOOK_ID NULL`, 'OK', 'ERROR')}
        await Neutralino.os.updateSpawnedProcess(this.HOOK_ID.id, 'stdIn', (char_100+'\n'));
    }
	parseSTDData(stdout){
        if(stdout.startsWith('wndwslst:')){
            const rawWindowsList = stdout.replace(/^wndwslst:/, '');
            const windowsList = JSON.parse(rawWindowsList);
            uiInterface.showWindowsList(windowsList)
        }
    }
	async spawnHook(){
        console.log(`${NL_PATH}/qvm.exe`);
        try{
            await Neutralino.filesystem.getStats(`${NL_PATH}/qvm.exe`);
        }
        catch(err){
            if(err.code === "NE_FS_NOPATHE"){
                await Neutralino.resources.extractFile('/resources/native/qvm.exe', `${NL_PATH}/qvm.exe`);
            }
        }
        this.HOOK_ID = await Neutralino.os.spawnProcess(`${NL_PATH}/qvm.exe`);
        Neutralino.events.on('spawnedProcess', function(evt){
            const std = evt.detail.data;
            this.parseSTDData(std);
        }.bind(this));
        return new Promise(resolve => setTimeout(resolve, 10))
    }
	async killHook(){
        await Neutralino.os.updateSpawnedProcess(this.HOOK_ID.id, 'exit');
    }
}
const hookInterface = new Hook();