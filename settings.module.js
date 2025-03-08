import fs from 'node:fs';
import path from 'node:path';

class settingsManager{
	constructor(){
		this.settings = {};
    }
	writeSettings(settings){
		return new Promise((resolve, reject) => {
			fs.writeFile(path.resolve('settings.json'), JSON.stringify(settings), ()=>{
				resolve()
			})
		})
	}
	getValidSettings(){
		return new Promise((resolve, reject) => {
			fs.readFile(path.resolve('settings.json'), 'utf8', (err, data) => {
				data = JSON.parse(data);
				const defaultSettings = {
					trigger: "double",
					keys: "Alt",
					boot: false,
					windows: []
				}
				if(err){
					console.log('settings file not found');
					this.writeSettings(defaultSettings)
					.then(()=>{
						this.settings = defaultSettings;
						resolve(defaultSettings)
					})
				}
				else{
					if(
						data.trigger !== undefined && data.trigger !== '' && typeof data.trigger === 'string' &&
						data.keys !== undefined && data.keys !== '' && typeof data.keys === 'object' &&
						data.boot !== undefined && typeof data.boot === 'boolean' &&
						data.windows !== undefined && typeof data.windows === 'object'
					){
						console.log('settings valid');
						this.settings = data;
						resolve(data);
					}
					else{	
						console.log('settings not valid');
						this.writeSettings(defaultSettings)
						.then(() => {
							this.settings = defaultSettings;
							resolve(defaultSettings)
						})
					}
				}
			})
		})
	}
	initSettings(){
		this.getValidSettings()
	}

	updateSettings(setting){
		let newSettings = {
			...this.settings,
			...setting
		}
		this.settings = newSettings;
		console.log(newSettings);
		fs.writeFile(path.resolve('settings.json'), JSON.stringify(newSettings), (err) => {
			if(err){
				console.log(err);
			}
		})
	}
	getCurrentSettings(){
		return this.settings;
	}
}

export default new settingsManager();