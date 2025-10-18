#include <windows.h>
#include <stdio.h>

#define DP 0 // double press
#define HK 1 // hotkey
#define DP_LATENCY 500 // задержка между нажатиями для прослушивания двойного нажатия

typedef struct {
	HWND hwnd;
	char title[256];
} WindowInfo;

// mode - режим слушания. 0 - двойное нажатие, 1 - сочетание клавиш
// lDoubleKey - код кнопки для которой слушать двойное нажатие
int mode = DP;
int lDoubleKey = 255;
int lHotkey[3] = {255,255,255};
char buffer[100];
WindowInfo windows[100];
int windowCounter = 0;

void changeMode(int setMode){
	mode = setMode;
}
void changeLDoubleKey(int setDoubleKey){
	lDoubleKey = setDoubleKey;
}
void changeLHotKey(int hotkey[3]){
	lHotkey[0] = hotkey[0];
	lHotkey[1] = hotkey[1];
	lHotkey[2] = hotkey[2];
}

int stack[3] = {0};
int keyStates[256] = {0};
int lastms = 0;
HWND currentWindow[2] = {0};
int windowSwitch = 0;

void push(int key){
	stack[0] = stack[1];
	stack[1] = stack[2];
	stack[2] = key;
}
void clearStack(){
	stack[0] = 0;
	stack[1] = 0;
	stack[2] = 0;
}
int hasStdinData() {
    HANDLE stdinHandle = GetStdHandle(STD_INPUT_HANDLE);
    DWORD bytesAvailable;
    PeekNamedPipe(stdinHandle, NULL, 0, NULL, &bytesAvailable, NULL);
    return bytesAvailable > 0;
}

void switchWindowCounter(){
	windowSwitch = !windowSwitch;
}
void changeWindow(){
	HWND target = currentWindow[windowSwitch];
	if(target != 0){
		
		HWND hCurWnd = GetForegroundWindow();
        DWORD dwMyID = GetCurrentThreadId();
        DWORD dwCurID = GetWindowThreadProcessId(hCurWnd, NULL);
        
        AttachThreadInput(dwCurID, dwMyID, TRUE);
        SetWindowPos(target, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE);
        SetWindowPos(target, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE);
        SetForegroundWindow(target);
        AttachThreadInput(dwCurID, dwMyID, FALSE);
        SetFocus(target);
        SetActiveWindow(target);
		
		switchWindowCounter();
	}
}

void readDouble(int vkCode){
	push(vkCode);
	Sleep(1);
	const int ms = GetTickCount64();
	int equal = 0;
	if((ms-lastms < DP_LATENCY) && stack[1] == stack[2] && vkCode == lDoubleKey){
		clearStack();
		changeWindow();
	}
	lastms = ms;
}

void readHotkey(int vkCode){
	push(vkCode);
	
	if(lHotkey[2] == 255){
		if(stack[0] == lHotkey[0] && stack[1] == lHotkey[1]){
			if(keyStates[lHotkey[0]] && keyStates[lHotkey[1]]){
				clearStack();
				changeWindow();
			}
		}
		if((stack[1] == lHotkey[0] && stack[2] == lHotkey[1])){
			if(keyStates[lHotkey[0]] && keyStates[lHotkey[1]]){
				clearStack();
				changeWindow();
			}
		}
	}
	else{
		if(stack[0] == lHotkey[0] && stack[1] == lHotkey[1] && stack[2] == lHotkey[2]){
			if(keyStates[lHotkey[0]] && keyStates[lHotkey[1]] && keyStates[lHotkey[2]]){
				clearStack();
				changeWindow();
			}
		}
	}

}

char* wideToUTF8(const wchar_t* wide_str) {
    int size = WideCharToMultiByte(CP_UTF8, 0, wide_str, -1, NULL, 0, NULL, NULL);
    char* utf8_str = malloc(size);
    WideCharToMultiByte(CP_UTF8, 0, wide_str, -1, utf8_str, size, NULL, NULL);
    return utf8_str;
}
BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam){
	if(!IsWindowVisible(hwnd)){return 1;}

	wchar_t wide_title[256];
	GetWindowTextW(hwnd, wide_title, 256);
	if(wcslen(wide_title) == 0){return 1;}

	if(windowCounter < 100){
		windows[windowCounter].hwnd = hwnd;
		char* title_utf8 = wideToUTF8(wide_title);
		strcpy_s(windows[windowCounter].title, sizeof(windows[windowCounter].title), title_utf8);
		windowCounter++;
	}
	return 1;
}
void escjson(const char* str) {
    for(const char* p = str; *p; p++) {
        if(*p == '"' || *p == '\\') {
            putchar('\\');
        }
        putchar(*p);
    }
}
void parseWindowsList(){
    printf("wndwslst:[");
    
    for(int i = 0; i < windowCounter; i++){
        if(i > 0) printf(",");
        
        uintptr_t hwnd_value = (uintptr_t)windows[i].hwnd;
        
        printf("{\"hwnd\":%llu,", (unsigned long long)hwnd_value);
        printf("\"title\":\"");
        escjson(windows[i].title);
        printf("\"}");
    }
    
    printf("]");
    fflush(stdout);
}
void getWindows(void){
	windowCounter = 0;
	EnumWindows(EnumWindowsProc, 0);
	parseWindowsList();
}
void parseCommand(void){
	char* cmnd = buffer;
	for(int i = 0; buffer[i]; i++) {
        if(buffer[i] == '\n') buffer[i] = '\0';
    }
	if(strcmp(buffer, "getWindows") == 0){
		getWindows();
	}
	else if(strncmp(buffer, "setWindow:", 10) == 0){
		char* hwnd_str = buffer+10;
		char* part1 = strtok(buffer+10, "^");
		char* hwnd1_str = part1 + 2;
		char* part2 = strtok(NULL, "^");
		char* hwnd2_str = part2 + 2;
		HWND hwnd1 = (HWND)strtoull(hwnd1_str, NULL, 10);
		HWND hwnd2 = (HWND)strtoull(hwnd2_str, NULL, 10);
		currentWindow[0] = hwnd1;
		currentWindow[1] = hwnd2;

		printf("Windows parsed:\n");
		printf("  hwnd1_str: %s\n", hwnd1_str);
		printf("  hwnd2_str: %s\n", hwnd2_str);
		printf("  currentWindow[0]: %p\n", currentWindow[0]);
		printf("  currentWindow[1]: %p\n", currentWindow[1]);
		printf("  hwnd1: %llu\n", (unsigned long long)hwnd1);
		printf("  hwnd2: %llu\n", (unsigned long long)hwnd2);
		fflush(stdout);

	}
	else if(strncmp(buffer, "setSettings:", 12) == 0){
		char* settings = buffer + 12;
		char* dbl = strtok(settings, "^");
		char* hotkey = strtok(NULL, "^");
		char* mode_str = strtok(NULL, "^");
		lDoubleKey = strtoul(dbl, NULL, 10);
		char* hotkey_key1 = strtok(hotkey, "+"); 
		char* hotkey_key2 = strtok(NULL, "+"); 
		char* hotkey_key3 = strtok(NULL, "+"); 
		lHotkey[0] = strtoul(hotkey_key1, NULL, 10);
		lHotkey[1] = strtoul(hotkey_key2, NULL, 10);
		lHotkey[2] = strtoul(hotkey_key3, NULL, 10);
		mode = strtoul(mode_str, NULL, 10);

		printf("Settings parsed:\n");
    	printf("  DoubleKey: %lu\n", lDoubleKey);
    	printf("  Hotkey: [%lu, %lu, %lu]\n", lHotkey[0], lHotkey[1], lHotkey[2]);
    	printf("  Mode: %lu\n", mode);
    	fflush(stdout);
	}
}

int main(void) {
    while (1) {
        for (int vkCode = 1; vkCode < 256; vkCode++) {
			if(vkCode == 18 || vkCode == 17 || vkCode == 16){continue;}
            SHORT state = GetAsyncKeyState(vkCode);
            if ((state & 0x8000) && !keyStates[vkCode]) {
                keyStates[vkCode] = 1;
				fflush(stdout);
				if(mode == DP){readDouble(vkCode);}
				else{readHotkey(vkCode);}
            }
            if (!(state & 0x8000) && keyStates[vkCode]) {
                keyStates[vkCode] = 0;
            }
        }
        if(hasStdinData()){
			fgets(buffer, sizeof(buffer), stdin);
			parseCommand();
		}
		Sleep(30);
    }
    return 0;
}