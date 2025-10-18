const SETTINGS = {

}

class App{
    async closeApp(){
        Neutralino.app.exit();
    }
    async initDefaultEvents(){
        Neutralino.init();
        Neutralino.events.on('windowClose', this.closeApp)
        return Neutralino.events.on('ready', () => {});
    }
}
const app = new App();
app.initDefaultEvents();