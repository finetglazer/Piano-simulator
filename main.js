const { app, BrowserWindow, dialog, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
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
            webSecurity: true, // Keep security on
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load the app
    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000' // Dev server from Create React App
            : `file://${path.join(__dirname, './renderer/build/index.html')}` // Production build
    );

    // Register file protocol to securely access local files
    protocol.registerFileProtocol('local-file', (request, callback) => {
        const url = request.url.replace('local-file://', '');
        try {
            return callback(decodeURIComponent(url));
        } catch (error) {
            console.error(error);
        }
    });

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

// Add handler to check if a file exists
ipcMain.handle('check-file-exists', async (event, filePath) => {
    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
});

// Add handler to read file as buffer
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const buffer = await fs.promises.readFile(filePath);
        return buffer.toString('base64');
    } catch (error) {
        console.error('Error reading file:', error);
        return null;
    }
});

app.on('ready', () => {
    createWindow();

    // Allow loading local PDF files
    protocol.registerFileProtocol('file', (request, callback) => {
        const pathname = decodeURI(request.url.replace('file:///', ''));
        callback(pathname);
    });
});

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