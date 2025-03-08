const { Window } = require('node-window-manager');
const windowManager = require('node-window-manager').windowManager;

class WindowsManager{
	constructor(){
		this.currentTop = 0;
		this.windows = [];
	}
	getWindowsList(){
		const windows = windowManager.getWindows();
		return windows.filter(window => window.isWindow());
	}
	checkWindow(wid){
		const window = new Window(parseInt(wid));
		console.log(window);
	}
	initWindows(windows){
		const arr = [
			new Window(parseInt(windows[0].wid)),
			new Window(parseInt(windows[1].wid))
		];
		this.windows = arr;
	}
	setCurrent(n){
		this.currentTop = n;
	}
	switchWindows(){
		console.log(this.currentTop);
		if(this.currentTop === 0){
			this.setCurrent(1)
			this.windows[this.currentTop].bringToTop();
			return
		}
		if(this.currentTop === 1){
			this.setCurrent(0)
			this.windows[this.currentTop].bringToTop();
			return
		}
	}
}

module.exports = new WindowsManager();