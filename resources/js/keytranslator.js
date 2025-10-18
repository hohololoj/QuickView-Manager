const keys = {
	ControlLeft: ['LCTRL', 162],
	ControlRight: ['RCTRL', 163],
	ShiftLeft: ['LShift', 160],
	ShiftRight: ['RShift', 161],
	AltLeft: ['LAlt', 164],
	AltRight: ['RAlt', 165],
	MetaLeft: ['LWin', 91],
	MetaRight: ['RWin', 92],
	ArrowUp: ['↑', 38],
	ArrowDown: ['↓', 40],
	ArrowLeft: ['←', 37],
	ArrowRight: ['→', 39],
	PageUp: ['PgUp', 33],
	PageDown: ['PgDn', 34],
	Escape: ['Esc', 27],
	Enter: ['Enter', 13],
	Tab: ['Tab', 9],
	CapsLock: ['CapsLock', 20],
	Backspace: ['Backspace', 8],
	Space: ['Space', 32],
	Delete: ['Del', 46],
	Insert: ['Ins', 45],
	PrintScreen: ['PrtSc', 44],
	ScrollLock: ['Scroll', 145],
	Pause: ['Pause', 19],
	ContextMenu: ['Menu', 93],
	NumpadEnter: ['NumpadEnter', 13],
	NumpadAdd: ['Numpad+', 107],
	NumpadSubtract: ['Numpad-', 109],
	NumpadMultiply: ['Numpad*', 106],
	NumpadDivide: ['Numpad/', 111],
	NumpadDecimal: ['Numpad.', 110],
	Backquote: ['`', 192],
	Minus: ['-', 189],
	Equal: ['=', 187],
	BracketLeft: ['[', 219],
	BracketRight: [']', 221],
	Backslash: ['\\', 220],
	Semicolon: [';', 186],
	Quote: ["'", 222],
	Comma: [',', 188],
	Period: ['.', 190],
	Slash: ['/', 191],
	IntlBackslash: ['\\', 226],
	MediaPlayPause: ['Play/Pause', 179],
	MediaStop: ['Stop', 178],
	MediaPrevious: ['Prev', 177],
	MediaNext: ['Next', 176],
	VolumeUp: ['Vol+', 175],
	VolumeDown: ['Vol-', 174],
	VolumeMute: ['Mute', 173],
	NumLock: ['NumLock', 144],
	Home: ['Home', 36],
	End: ['End', 35],
}
function translateName(name) {
	if (keys[name] && keys[name][0] !== undefined) { return keys[name][0] }
	if (name.startsWith('Digit')) {
		return name.replace('Digit', '');
	}
	if (name.startsWith('Key')) {
		return name.replace('Key', '');
	}
	return name
}
function translateVkCode(key) {
	if (keys[key] && keys[key][1] !== undefined) { return keys[key][1] }
	if (key.startsWith('Digit')) {
		const digit = parseInt(key.replace('Digit', ''));
		return 48 + digit;
	}
	if (key.startsWith('Key')) {
		const letter = key.replace('Key', '');
		return letter.charCodeAt(0);
	}
	if (key.startsWith('F') && !isNaN(parseInt(key.slice(1)))) {
		const fNum = parseInt(key.slice(1));
		return 111 + fNum;
	}
	if (key.startsWith('Numpad') && !isNaN(parseInt(key.replace('Numpad', '')))) {
		const num = parseInt(key.replace('Numpad', ''));
		return 96 + num;
	}
	return 255;
}