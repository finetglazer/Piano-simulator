// Create this file as preload-pdf.js in the renderer folder

// This script will be injected into the webview that displays PDFs
window.addEventListener('DOMContentLoaded', () => {
    console.log('PDF viewer preload script loaded');

    // Send message to parent when PDF is loaded
    document.addEventListener('load', () => {
        window.parent.postMessage({ type: 'pdf-loaded' }, '*');
    });

    // Handle errors
    window.addEventListener('error', (error) => {
        window.parent.postMessage({
            type: 'pdf-error',
            error: error.message
        }, '*');
    });
});