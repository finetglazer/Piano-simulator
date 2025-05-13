import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './SheetMusicViewer.css';

// Set the worker to use the SAME version as the PDF.js API (4.8.69)
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js';

const SheetMusicViewer = ({ isCollapsed, toggleCollapse }) => {
    const [pdfFile, setPdfFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load last session info on component mount
    useEffect(() => {
        const lastPdfPath = localStorage.getItem('lastSheetMusic');
        const lastPage = localStorage.getItem('lastSheetMusicPage');

        if (lastPdfPath) {
            setPdfFile(lastPdfPath);
            if (lastPage) {
                setPageNumber(parseInt(lastPage, 10));
            }
        }
    }, []);

    // Save session info when pdfFile or pageNumber changes
    useEffect(() => {
        if (pdfFile) {
            localStorage.setItem('lastSheetMusic', pdfFile);
            localStorage.setItem('lastSheetMusicPage', pageNumber);
        }
    }, [pdfFile, pageNumber]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only proceed if the sheet music viewer is not collapsed
            if (isCollapsed) return;

            // Ignore key presses when in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'Enter' || e.key === 'ArrowRight') {
                if (pageNumber < numPages) {
                    setPageNumber(pageNumber + 1);
                }
            } else if (e.key === 'ArrowLeft') {
                if (pageNumber > 1) {
                    setPageNumber(pageNumber - 1);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageNumber, numPages, isCollapsed]);

    // Function to handle PDF file selection
    const handleFileSelect = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Call the electron API to open file dialog
            const filePath = await window.electron.selectPdf();

            if (filePath) {
                setPdfFile(filePath);
                setPageNumber(1); // Reset to first page for new document
            }
        } catch (err) {
            console.error('Error selecting PDF:', err);
            setError('Failed to open PDF file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setError(null);
        setIsLoading(false);
    };

    const onDocumentLoadError = (error) => {
        console.error('Error loading PDF:', error);
        setError('Failed to load PDF. The file may be corrupted or not accessible.');
        setIsLoading(false);
    };

    const nextPage = () => {
        if (pageNumber < numPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const prevPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
    const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
    const resetZoom = () => setScale(1.0);

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
                    <>
                        <div className="navigation-controls">
                            <button onClick={prevPage} disabled={pageNumber <= 1 || isLoading}>
                                Previous
                            </button>
                            <span>
                                Page {pageNumber} of {numPages || '?'}
                            </span>
                            <button onClick={nextPage} disabled={pageNumber >= numPages || isLoading}>
                                Next
                            </button>
                        </div>

                        <div className="zoom-controls">
                            <button onClick={zoomOut} disabled={scale <= 0.5 || isLoading}>-</button>
                            <button onClick={resetZoom} disabled={isLoading}>Reset</button>
                            <button onClick={zoomIn} disabled={scale >= 2.0 || isLoading}>+</button>
                            <span>{Math.round(scale * 100)}%</span>
                        </div>
                    </>
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
                    <Document
                        file={pdfFile}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={<div className="loading-indicator">Loading PDF...</div>}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            loading={<div className="loading-indicator">Loading page...</div>}
                        />
                    </Document>
                )}
            </div>

            {pdfFile && (
                <div className="sheet-music-footer">
                    <span className="keyboard-hint">
                        Press Enter or Right Arrow for next page, Left Arrow for previous page
                    </span>
                </div>
            )}
        </div>
    );
};

export default SheetMusicViewer;