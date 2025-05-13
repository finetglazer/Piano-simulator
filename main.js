// Electron main process file with added PDF selection dialog
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load the app
    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000' // Dev server from Create React App
            : `file://${path.join(__dirname, './renderer/build/index.html')}` // Production build
    );

    // Open DevTools in development mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Add file selection dialog handler
ipcMain.handle('select-pdf', async () => {
    if (!mainWindow) {
        return null;
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Sheet Music PDF',
        properties: ['openFile'],
        filters: [
            { name: 'PDF Files', extensions: ['pdf'] }
        ]
    });

    if (canceled || filePaths.length === 0) {
        return null;
    }

    return filePaths[0];
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});