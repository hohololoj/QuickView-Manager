class Settings{
	constructor(){
		this.CONFIG_DIR = ''
		this.SETTINGS = null;
	}
	async loadSysDirs(){
        try{
            this.CONFIG_DIR = await Neutralino.os.getPath('config');
            window.CONFIG_DIR = this.CONFIG_DIR;
        }
        catch(err){
            app.crash('Что-то пошло не так', `Не получается считать системную директорию CONFIG: ${err}`, 'OK', 'ERROR');
        }
    }
	async createDefaultSettings(){
        try{
            await Neutralino.filesystem.createDirectory(`${this.CONFIG_DIR}/QuickViewManager`);
        }
        catch{
            try{
                const baseSettings = {
                    double: null,
                    hotkey: null,
                    mode: 'double'
                }
                await Neutralino.filesystem.writeFile(`${this.CONFIG_DIR}/QuickViewManager/settings.json`, JSON.stringify(baseSettings));
            }
            catch(err){
                app.crash('Что-то пошло не так', 'Не удается сохранить базовые null настройки', 'OK', 'Error');
            }
        }
    }
	async loadSettings(){
        try{
            const settings = await Neutralino.filesystem.readFile(`${this.CONFIG_DIR}/QuickViewManager/settings.json`);
            try{
                const parsedSettings = JSON.parse(settings);
                if(parsedSettings.double === undefined || parsedSettings.hotkey === undefined || parsedSettings.mode === undefined){throw new Error}
                this.SETTINGS = parsedSettings
            }
            catch(err){
                this.createDefaultSettings();
                this.SETTINGS = {
                    double: null,
                    hotkey: null,
                    mode: "double"
                }
            }
            this.applySettings();
        }
        catch(err){
            if(err.code === 'NE_FS_FILRDER'){
                await this.createDefaultSettings();
                this. SETTINGS = {
                    double: null,
                    hotkey: null,
                    mode: "double"
                }
                this.applySettings();
            }
        }
    }
	async updateSettings(setting){
        const newSettings = {...this.SETTINGS, ...setting};
        this.SETTINGS = newSettings;
        state.settings = this.SETTINGS;
        try{
            await Neutralino.filesystem.writeFile(`${this.CONFIG_DIR}/QuickViewManager/settings.json`, JSON.stringify(newSettings));
        }
        catch(err){
            app.crash('Что то пошло не так', `Что то пошло не так при записи новых настроек: ${err}`, 'OK', 'ERROR');
        }
    }
	applySettings(){
        //перезапускать dll здесь
    }
	async initSettings(){
		await this.loadSysDirs();
        await this.loadSettings();
		return
	}
}
const settingsController = new Settings();