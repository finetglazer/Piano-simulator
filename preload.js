// Updated preload.js with enhanced PDF handling capabilities
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for PDF handling
contextBridge.exposeInMainWorld('electron', {
    // Select a PDF file using the native dialog
    selectPdf: () => ipcRenderer.invoke('select-pdf'),

    // Check if a file exists at the given path
    fileExists: (path) => ipcRenderer.invoke('check-file-exists', path),

    // Read a file and return its contents as a base64 string
    readFile: (path) => ipcRenderer.invoke('read-file', path),

    // Get app info
    getAppInfo: () => ({
        version: process.env.npm_package_version || '1.0.0',
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
        platform: process.platform
    })
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('Preload script loaded successfully');

    // Replace version info in the UI if present
    const appVersion = document.querySelector('.app-version');
    if (appVersion) {
        const info = window.electron.getAppInfo();
        appVersion.textContent = `Piano Simulator v${info.version}`;
    }
});