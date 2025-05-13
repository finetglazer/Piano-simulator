// SheetMusicViewer.js - Using Electron's built-in webview for PDF viewing

import React, { useState, useEffect } from 'react';
import './SheetMusicViewer.css';

const SheetMusicViewer = ({ isCollapsed, toggleCollapse }) => {
    const [pdfFile, setPdfFile] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [zoom, setZoom] = useState(100);

    // Load last session info on component mount
    useEffect(() => {
        const lastPdfPath = localStorage.getItem('lastSheetMusic');
        if (lastPdfPath) {
            setPdfFile(lastPdfPath);
        }

        const savedZoom = localStorage.getItem('sheetMusicZoom');
        if (savedZoom) {
            setZoom(parseInt(savedZoom, 10));
        }
    }, []);

    // Save session info when pdfFile changes
    useEffect(() => {
        if (pdfFile) {
            localStorage.setItem('lastSheetMusic', pdfFile);
        }
    }, [pdfFile]);

    // Save zoom level when it changes
    useEffect(() => {
        localStorage.setItem('sheetMusicZoom', zoom.toString());
    }, [zoom]);

    // Function to handle PDF file selection
    const handleFileSelect = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Call the electron API to open file dialog
            const filePath = await window.electron.selectPdf();

            if (filePath) {
                setPdfFile(filePath);
            }
        } catch (err) {
            console.error('Error selecting PDF:', err);
            setError('Failed to open PDF file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const zoomIn = () => setZoom(Math.min(zoom + 10, 200));
    const zoomOut = () => setZoom(Math.max(zoom - 10, 50));
    const resetZoom = () => setZoom(100);

    if (isCollapsed) {
        return (
            <div className="sheet-music-collapsed">
                <button className="expand-button" onClick={toggleCollapse}>
                    Show Sheet Music
                </button>
            </div>
        );
    }

    return (
        <div className="sheet-music-viewer">
            <div className="sheet-music-controls">
                <div className="file-controls">
                    <button onClick={handleFileSelect} disabled={isLoading}>
                        {pdfFile ? 'Change Sheet Music' : 'Open Sheet Music'}
                    </button>
                    <button onClick={toggleCollapse} className="collapse-button">
                        Hide
                    </button>
                </div>

                {pdfFile && (
                    <div className="zoom-controls">
                        <button onClick={zoomOut} disabled={zoom <= 50}>-</button>
                        <button onClick={resetZoom}>Reset</button>
                        <button onClick={zoomIn} disabled={zoom >= 200}>+</button>
                        <span>{zoom}%</span>
                    </div>
                )}
            </div>

            <div className="sheet-music-content">
                {error && <div className="error-message">{error}</div>}

                {isLoading && <div className="loading-indicator">Loading sheet music...</div>}

                {!pdfFile && !isLoading && !error && (
                    <div className="no-pdf-message">
                        No sheet music selected. Click "Open Sheet Music" to choose a PDF file.
                    </div>
                )}

                {pdfFile && (
                    <webview
                        src={`file://${pdfFile}`}
                        plugins="true"
                        preload="./preload-pdf.js"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            zoom: `${zoom}%`
                        }}
                    />
                )}
            </div>

            {pdfFile && (
                <div className="sheet-music-footer">
                    <span className="keyboard-hint">
                        Use +/- buttons to adjust zoom, or press Ctrl+/- on your keyboard
                    </span>
                </div>
            )}
        </div>
    );
};

export default SheetMusicViewer;