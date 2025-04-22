// Electron main process file
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
        nodeIntegration: true,
                contextIsolation: false,
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