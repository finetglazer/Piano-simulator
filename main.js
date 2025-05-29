const { app, BrowserWindow, dialog, ipcMain, protocol, shell } = require('electron');
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
            webSecurity: false, // Allow loading local files for PDF viewing
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

// Enhanced file selection dialog handler with better file type filtering
ipcMain.handle('select-pdf', async () => {
    if (!mainWindow) {
        return null;
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Sheet Music PDF',
        properties: ['openFile'],
        filters: [
            { name: 'PDF Files', extensions: ['pdf'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        defaultPath: app.getPath('documents')
    });

    if (canceled || filePaths.length === 0) {
        return null;
    }

    const filePath = filePaths[0];
    console.log('Selected PDF file:', filePath);

    // Validate that the file exists and is readable
    try {
        await fs.promises.access(filePath, fs.constants.R_OK);
        return filePath;
    } catch (error) {
        console.error('Cannot access selected file:', error);
        return null;
    }
});

// Enhanced handler to check if a file exists
ipcMain.handle('check-file-exists', async (event, filePath) => {
    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        const stats = await fs.promises.stat(filePath);
        return {
            exists: true,
            isFile: stats.isFile(),
            size: stats.size,
            modified: stats.mtime
        };
    } catch (error) {
        console.log('File does not exist or cannot be accessed:', filePath);
        return {
            exists: false,
            error: error.message
        };
    }
});

// Enhanced handler to read file as buffer with error handling
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        console.log('Reading file:', filePath);

        // Check if file exists first
        const fileInfo = await fs.promises.stat(filePath);
        console.log('File size:', fileInfo.size, 'bytes');

        // Read the file
        const buffer = await fs.promises.readFile(filePath);
        const base64 = buffer.toString('base64');

        console.log('File read successfully, base64 length:', base64.length);
        return base64;
    } catch (error) {
        console.error('Error reading file:', error);
        return null;
    }
});

// Handler to open file in external application
ipcMain.handle('open-external', async (event, filePath) => {
    try {
        console.log('Opening external file:', filePath);
        await shell.openPath(filePath);
        return true;
    } catch (error) {
        console.error('Error opening external file:', error);
        return false;
    }
});

// Handler to show file in folder
ipcMain.handle('show-in-folder', async (event, filePath) => {
    try {
        shell.showItemInFolder(filePath);
        return true;
    } catch (error) {
        console.error('Error showing file in folder:', error);
        return false;
    }
});

// Handler to get file info
ipcMain.handle('get-file-info', async (event, filePath) => {
    try {
        const stats = await fs.promises.stat(filePath);
        return {
            name: path.basename(filePath),
            path: filePath,
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime,
            isFile: stats.isFile(),
            extension: path.extname(filePath).toLowerCase()
        };
    } catch (error) {
        console.error('Error getting file info:', error);
        return null;
    }
});

app.on('ready', () => {
    // Register file protocol to handle local files securely
    protocol.registerFileProtocol('local-file', (request, callback) => {
        const url = request.url.replace('local-file://', '');
        try {
            const decodedPath = decodeURIComponent(url);
            console.log('Serving local file:', decodedPath);
            return callback(decodedPath);
        } catch (error) {
            console.error('Error serving local file:', error);
            return callback(null);
        }
    });

    // Enhanced file protocol registration for better PDF handling
    protocol.registerFileProtocol('file', (request, callback) => {
        const pathname = decodeURI(request.url.replace('file:///', ''));
        console.log('File protocol request:', pathname);

        // Ensure the path is absolute
        const fullPath = path.isAbsolute(pathname) ? pathname : path.resolve(pathname);

        try {
            // Check if file exists before serving
            if (fs.existsSync(fullPath)) {
                callback(fullPath);
            } else {
                console.error('File not found:', fullPath);
                callback(null);
            }
        } catch (error) {
            console.error('Error in file protocol:', error);
            callback(null);
        }
    });

    createWindow();
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

// Security: Prevent new window creation with insecure settings
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        // Prevent opening new windows
        event.preventDefault();

        // Optionally open in external browser
        shell.openExternal(navigationUrl);
    });
});

// Handle protocol for PDF files specifically
app.on('ready', () => {
    // Register a custom protocol for PDF handling if needed
    protocol.registerFileProtocol('pdf-viewer', (request, callback) => {
        const url = request.url.replace('pdf-viewer://', '');
        const filePath = decodeURIComponent(url);

        console.log('PDF viewer protocol request:', filePath);

        try {
            if (fs.existsSync(filePath) && path.extname(filePath).toLowerCase() === '.pdf') {
                callback(filePath);
            } else {
                console.error('PDF file not found or invalid:', filePath);
                callback(null);
            }
        } catch (error) {
            console.error('Error in PDF protocol:', error);
            callback(null);
        }
    });
});