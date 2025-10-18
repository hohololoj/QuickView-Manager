import * as fs from "node:fs";

const file = await fs.promises.readFile('./resources/index.html', 'utf-8');
const classList = file.match(/(?<=class=")[^"]+(?=")/gim);
const classSet = new Set();
classList.map((classString) => {
	const classes = classString.split(' ');
	for(let i = 0; i < classes.length; i++){
		classSet.add(classes[i])
	}
})
const classArr = Array.from(classSet);
let classStr = '';
for(let i = 0; i < classArr.length; i++){
	classStr += `.${classArr[i]}{}\n`;
}
await fs.promises.writeFile('./resources/s.css', classStr)