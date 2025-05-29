// Enhanced preload.js with comprehensive PDF handling capabilities
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for PDF handling and file management
contextBridge.exposeInMainWorld('electron', {
    // Select a PDF file using the native dialog
    selectPdf: () => ipcRenderer.invoke('select-pdf'),

    // Check if a file exists at the given path (returns detailed info)
    fileExists: (path) => ipcRenderer.invoke('check-file-exists', path),

    // Read a file and return its contents as a base64 string
    readFile: (path) => ipcRenderer.invoke('read-file', path),

    // Open file in external application (like Adobe Reader)
    openExternal: (path) => ipcRenderer.invoke('open-external', path),

    // Show file in folder/explorer
    showInFolder: (path) => ipcRenderer.invoke('show-in-folder', path),

    // Get detailed file information
    getFileInfo: (path) => ipcRenderer.invoke('get-file-info', path),

    // Get app info
    getAppInfo: () => ({
        version: process.env.npm_package_version || '1.0.0',
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
        platform: process.platform
    }),

    // Utility functions for PDF handling
    pdf: {
        // Create a local file URL for PDF viewing
        createFileUrl: (filePath) => {
            // Convert Windows backslashes to forward slashes
            const normalizedPath = filePath.replace(/\\/g, '/');
            return `file:///${normalizedPath}`;
        },

        // Create a custom PDF viewer URL
        createPdfViewerUrl: (filePath) => {
            const normalizedPath = encodeURIComponent(filePath);
            return `pdf-viewer://${normalizedPath}`;
        },

        // Validate PDF file
        isValidPdf: (filePath) => {
            const extension = filePath.toLowerCase().split('.').pop();
            return extension === 'pdf';
        }
    },

    // Debug utilities
    debug: {
        log: (message, ...args) => {
            console.log('[Renderer]', message, ...args);
        },
        error: (message, ...args) => {
            console.error('[Renderer]', message, ...args);
        }
    }
});

// Enhanced DOM content loaded handler
window.addEventListener('DOMContentLoaded', () => {
    console.log('Enhanced preload script loaded successfully');

    // Replace version info in the UI if present
    const appVersion = document.querySelector('.app-version');
    if (appVersion) {
        const info = window.electron.getAppInfo();
        appVersion.textContent = `Piano Simulator v${info.version} (Electron ${info.electron})`;
    }

    // Add PDF debugging capabilities in development
    if (process.env.NODE_ENV === 'development') {
        window.pdfDebug = {
            testFileAccess: async (filePath) => {
                console.log('Testing file access:', filePath);
                const exists = await window.electron.fileExists(filePath);
                console.log('File exists result:', exists);
                return exists;
            },

            testFileRead: async (filePath) => {
                console.log('Testing file read:', filePath);
                const data = await window.electron.readFile(filePath);
                console.log('File read result:', data ? `${data.length} bytes` : 'null');
                return data;
            },

            testExternalOpen: async (filePath) => {
                console.log('Testing external open:', filePath);
                const result = await window.electron.openExternal(filePath);
                console.log('External open result:', result);
                return result;
            }
        };

        console.log('PDF debugging tools available at window.pdfDebug');
    }
});

// Error handling for IPC communication
process.on('uncaughtException', (error) => {
    console.error('Preload uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Preload unhandled rejection at:', promise, 'reason:', reason);
});