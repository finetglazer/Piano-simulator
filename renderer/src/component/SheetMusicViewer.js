// SheetMusicViewer.js - Fixed PDF loading implementation
import React, { useState, useEffect, useRef } from 'react';
import './SheetMusicViewer.css';

// Fixed implementation that properly loads local PDF files
const SheetMusicViewer = ({ isCollapsed, toggleCollapse }) => {
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfData, setPdfData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pdfContainerRef = useRef(null);

    // Load last session info on component mount
    useEffect(() => {
        const savedZoom = localStorage.getItem('sheetMusicZoom');
        if (savedZoom) {
            setZoom(parseInt(savedZoom, 10));
        }

        const savedPage = localStorage.getItem('sheetMusicPage');
        if (savedPage) {
            setCurrentPage(parseInt(savedPage, 10));
        }
    }, []);

    // Save zoom level and current page when they change
    useEffect(() => {
        localStorage.setItem('sheetMusicZoom', zoom.toString());
        localStorage.setItem('sheetMusicPage', currentPage.toString());
    }, [zoom, currentPage]);

    // Function to handle PDF file selection
    const handleFileSelect = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Call the electron API to open file dialog
            if (window.electron && window.electron.selectPdf) {
                const filePath = await window.electron.selectPdf();

                if (filePath) {
                    setPdfFile(filePath);

                    try {
                        // IMPORTANT: Instead of using fetch, use the electron IPC bridge
                        // to read the file through the main process
                        const base64Data = await window.electron.readFile(filePath);

                        if (base64Data) {
                            // Create a data URL from the base64 string
                            const dataUrl = `data:application/pdf;base64,${base64Data}`;
                            setPdfData(dataUrl);
                        } else {
                            throw new Error('Failed to read PDF file');
                        }
                    } catch (readError) {
                        console.error('Error reading PDF:', readError);
                        setError('Failed to read PDF file. Please try again.');

                        // If all else fails, try opening in external application
                        try {
                            // This might also fail due to security restrictions
                            window.open(`file://${filePath}`, '_blank');
                            setError('PDF opened in external viewer.');
                        } catch (e) {
                            console.error('Failed to open PDF externally:', e);
                        }
                    }
                }
            } else {
                // Fallback method for testing in browser or when electron API is not available
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/pdf';

                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        setPdfFile(file.name);
                        const url = URL.createObjectURL(file);
                        setPdfData(url);
                    }
                };

                input.click();
            }
        } catch (err) {
            console.error('Error selecting PDF:', err);
            setError('Failed to open PDF file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Navigation functions
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const zoomIn = () => setZoom(Math.min(zoom + 10, 200));
    const zoomOut = () => setZoom(Math.max(zoom - 10, 50));
    const resetZoom = () => setZoom(100);

    // Keyboard navigation handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle keys when sheet music is open and not collapsed
            if (isCollapsed || !pdfData) return;

            // Ignore if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'ArrowRight':
                case 'Enter':
                    goToNextPage();
                    break;
                case 'ArrowLeft':
                    goToPrevPage();
                    break;
                case '+':
                case '=':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        zoomIn();
                    }
                    break;
                case '-':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        zoomOut();
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCollapsed, pdfData, currentPage, totalPages, zoom]);

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

                {pdfData && (
                    <>
                        <div className="navigation-controls">
                            <button onClick={goToPrevPage} disabled={currentPage <= 1}>
                                Previous
                            </button>
                            <span>{currentPage} / {totalPages}</span>
                            <button onClick={goToNextPage} disabled={currentPage >= totalPages}>
                                Next
                            </button>
                        </div>

                        <div className="zoom-controls">
                            <button onClick={zoomOut} disabled={zoom <= 50}>-</button>
                            <button onClick={resetZoom}>Reset</button>
                            <button onClick={zoomIn} disabled={zoom >= 200}>+</button>
                            <span>{zoom}%</span>
                        </div>
                    </>
                )}
            </div>

            <div className="sheet-music-content" ref={pdfContainerRef}>
                {error && <div className="error-message">{error}</div>}

                {isLoading && <div className="loading-indicator">Loading sheet music...</div>}

                {!pdfData && !isLoading && !error && (
                    <div className="no-pdf-message">
                        No sheet music selected. Click "Open Sheet Music" to choose a PDF file.
                    </div>
                )}

                {pdfData && (
                    <div className="pdf-container" style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top center' }}>
                        <iframe
                            src={`${pdfData}#page=${currentPage}`}
                            title="Sheet Music"
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            onLoad={(e) => {
                                try {
                                    // Set a reasonable default for total pages
                                    setTotalPages(Math.max(totalPages, 20));
                                } catch (err) {
                                    console.error('Error handling PDF load:', err);
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {pdfData && (
                <div className="sheet-music-footer">
                    <span className="keyboard-hint">
                        Use arrow keys to navigate pages. Ctrl+/- to zoom.
                    </span>
                </div>
            )}
        </div>
    );
};

export default SheetMusicViewer;