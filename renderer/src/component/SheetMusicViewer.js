// Enhanced SheetMusicViewer.js - Fixed PDF loading with better error handling
import React, { useState, useEffect, useRef } from 'react';
import './SheetMusicViewer.css';

const SheetMusicViewer = ({ isCollapsed, toggleCollapse }) => {
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfData, setPdfData] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [displayMethod, setDisplayMethod] = useState('iframe');
    const [debugInfo, setDebugInfo] = useState('');
    const pdfContainerRef = useRef(null);
    const iframeRef = useRef(null);

    // Load last session info
    useEffect(() => {
        const savedZoom = localStorage.getItem('sheetMusicZoom');
        if (savedZoom) setZoom(parseInt(savedZoom, 10));

        const savedPage = localStorage.getItem('sheetMusicPage');
        if (savedPage) setCurrentPage(parseInt(savedPage, 10));

        const savedFile = localStorage.getItem('lastPdfFile');
        if (savedFile) {
            console.log('Attempting to reload last PDF:', savedFile);
            loadPdfFile(savedFile);
        }
    }, []);

    // Save settings when they change
    useEffect(() => {
        localStorage.setItem('sheetMusicZoom', zoom.toString());
        localStorage.setItem('sheetMusicPage', currentPage.toString());
        if (pdfFile) {
            localStorage.setItem('lastPdfFile', pdfFile);
        }
    }, [zoom, currentPage, pdfFile]);

    // Enhanced PDF loading with comprehensive error handling
    const loadPdfFile = async (filePath) => {
        try {
            setIsLoading(true);
            setError(null);
            setDebugInfo(`Loading PDF: ${filePath}`);

            console.log('🔄 Loading PDF file:', filePath);

            // Clean up previous URLs
            if (pdfUrl && pdfUrl.startsWith('blob:')) {
                URL.revokeObjectURL(pdfUrl);
            }
            setPdfData(null);
            setPdfUrl(null);

            // Method 1: Direct file URL (works best in Electron)
            try {
                setDebugInfo('Trying Method 1: Direct file URL...');

                // Check if file exists first
                const fileInfo = await window.electron.fileExists(filePath);
                console.log('📁 File exists check:', fileInfo);

                if (fileInfo && fileInfo.exists) {
                    // Create proper file URL
                    const fileUrl = filePath.startsWith('file://')
                        ? filePath
                        : `file:///${filePath.replace(/\\/g, '/')}`;

                    console.log('🔗 Created file URL:', fileUrl);

                    setPdfUrl(fileUrl);
                    setPdfData(fileUrl);
                    setDisplayMethod('iframe');
                    setDebugInfo(`Method 1 Success: ${fileInfo.size} bytes`);
                    setIsLoading(false);
                    return true;
                }

                throw new Error('File does not exist or cannot be accessed');

            } catch (err) {
                console.log('❌ Method 1 failed:', err.message);
                setDebugInfo(`Method 1 failed: ${err.message}`);
            }

            // Method 2: Read file as base64 and create data URL
            try {
                setDebugInfo('Trying Method 2: Base64 data URL...');

                const base64Data = await window.electron.readFile(filePath);
                console.log('📄 Base64 data length:', base64Data ? base64Data.length : 'null');

                if (base64Data && base64Data.length > 0) {
                    const dataUrl = `data:application/pdf;base64,${base64Data}`;

                    setPdfData(dataUrl);
                    setPdfUrl(dataUrl);
                    setDisplayMethod('embed');
                    setDebugInfo(`Method 2 Success: ${base64Data.length} chars`);
                    setIsLoading(false);
                    return true;
                }

                throw new Error('Failed to read file as base64');

            } catch (err) {
                console.log('❌ Method 2 failed:', err.message);
                setDebugInfo(`Method 2 failed: ${err.message}`);
            }

            // Method 3: Create blob URL from base64
            try {
                setDebugInfo('Trying Method 3: Blob URL...');

                const base64Data = await window.electron.readFile(filePath);

                if (base64Data && base64Data.length > 0) {
                    // Convert base64 to blob
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);

                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(blob);

                    console.log('🧩 Created blob URL:', blobUrl);

                    setPdfData(blobUrl);
                    setPdfUrl(blobUrl);
                    setDisplayMethod('object');
                    setDebugInfo(`Method 3 Success: ${blob.size} bytes`);
                    setIsLoading(false);
                    return true;
                }

                throw new Error('Failed to create blob from base64');

            } catch (err) {
                console.log('❌ Method 3 failed:', err.message);
                setDebugInfo(`Method 3 failed: ${err.message}`);
            }

            // Method 4: Open in external viewer
            try {
                setDebugInfo('Trying Method 4: External viewer...');

                const opened = await window.electron.openExternal(filePath);
                if (opened) {
                    setError(`PDF opened in external viewer: ${filePath.split(/[/\\]/).pop()}`);
                    setDebugInfo('Method 4 Success: External viewer opened');
                    return true;
                }

                throw new Error('Failed to open in external viewer');

            } catch (err) {
                console.log('❌ Method 4 failed:', err.message);
                setDebugInfo(`Method 4 failed: ${err.message}`);
            }

            // All methods failed
            throw new Error('All PDF loading methods failed');

        } catch (err) {
            console.error('💥 PDF loading completely failed:', err);
            setError(`Failed to load PDF: ${err.message}\n\nFile: ${filePath}`);
            setDebugInfo(`All methods failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle PDF file selection
    const handleFileSelect = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setDebugInfo('Opening file dialog...');

            if (window.electron && window.electron.selectPdf) {
                const filePath = await window.electron.selectPdf();

                if (filePath) {
                    console.log('📂 Selected file:', filePath);
                    setPdfFile(filePath);
                    await loadPdfFile(filePath);
                } else {
                    setDebugInfo('No file selected');
                }
            } else {
                // Browser fallback
                setDebugInfo('Using browser file picker...');
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/pdf';

                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        setPdfFile(file.name);
                        const url = URL.createObjectURL(file);
                        setPdfData(url);
                        setPdfUrl(url);
                        setDisplayMethod('iframe');
                        setDebugInfo(`Browser file: ${file.size} bytes`);
                    }
                };

                input.click();
            }
        } catch (err) {
            console.error('💥 File selection failed:', err);
            setError(`File selection failed: ${err.message}`);
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

    // Try different display methods
    const tryDifferentMethod = () => {
        const methods = ['iframe', 'embed', 'object', 'external'];
        const currentIndex = methods.indexOf(displayMethod);
        const nextMethod = methods[(currentIndex + 1) % methods.length];

        console.log('🔄 Switching display method:', displayMethod, '→', nextMethod);
        setDisplayMethod(nextMethod);
        setDebugInfo(`Switched to method: ${nextMethod}`);

        if (nextMethod === 'external' && pdfFile) {
            window.electron.openExternal(pdfFile);
            setError('PDF opened in external viewer.');
        }
    };

    // Open in external viewer
    const openExternal = () => {
        if (pdfFile && window.electron) {
            window.electron.openExternal(pdfFile);
            setError('PDF opened in external viewer.');
        }
    };

    // Show debug info
    const showDebugInfo = () => {
        const info = {
            pdfFile,
            pdfUrl: pdfUrl ? pdfUrl.substring(0, 100) + '...' : null,
            displayMethod,
            hasElectron: !!window.electron,
            debugInfo
        };

        console.log('🐛 Debug Info:', info);
        alert(`Debug Info:\n${JSON.stringify(info, null, 2)}`);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isCollapsed || !pdfData) return;
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

    // Cleanup blob URLs
    useEffect(() => {
        return () => {
            if (pdfUrl && pdfUrl.startsWith('blob:')) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    if (isCollapsed) {
        return (
            <div className="sheet-music-collapsed">
                <button className="expand-button" onClick={toggleCollapse}>
                    Show Sheet Music {pdfFile && `(${pdfFile.split(/[/\\]/).pop()})`}
                </button>
            </div>
        );
    }

    // Render PDF content with enhanced error handling
    const renderPdfContent = () => {
        if (!pdfData) return null;

        const pdfSrc = `${pdfData}#page=${currentPage}&zoom=${zoom}`;

        console.log('🖼️ Rendering PDF with method:', displayMethod, 'URL:', pdfSrc.substring(0, 100));

        const commonProps = {
            width: "100%",
            height: "100%",
            onLoad: () => {
                console.log('✅ PDF loaded successfully');
                setTotalPages(Math.max(totalPages, 20));
                setError(null);
            },
            onError: (e) => {
                console.log('❌ PDF loading error:', e);
                setError(`PDF display error with method: ${displayMethod}`);
            }
        };

        switch (displayMethod) {
            case 'iframe':
                return (
                    <iframe
                        ref={iframeRef}
                        src={pdfSrc}
                        title="Sheet Music"
                        style={{ border: 'none' }}
                        {...commonProps}
                    />
                );

            case 'embed':
                return (
                    <embed
                        src={pdfSrc}
                        type="application/pdf"
                        style={{ border: 'none' }}
                        {...commonProps}
                    />
                );

            case 'object':
                return (
                    <object
                        data={pdfSrc}
                        type="application/pdf"
                        style={{ border: 'none' }}
                        {...commonProps}
                    >
                        <p>
                            Your browser cannot display PDF files.
                            <button onClick={openExternal} style={{ marginLeft: '10px' }}>
                                Open Externally
                            </button>
                        </p>
                    </object>
                );

            default:
                return (
                    <div className="pdf-fallback">
                        <p>PDF cannot be displayed in browser.</p>
                        <button onClick={tryDifferentMethod}>Try Different Method</button>
                        <button onClick={openExternal}>Open in External Viewer</button>
                        {pdfFile && <p>File: {pdfFile}</p>}
                    </div>
                );
        }
    };

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
                    {pdfData && (
                        <>
                            <button onClick={tryDifferentMethod} className="method-button" title="Try different display method">
                                Method: {displayMethod}
                            </button>
                            <button onClick={openExternal} title="Open in external PDF viewer">
                                External
                            </button>
                            <button onClick={showDebugInfo} title="Show debug information" style={{fontSize: '11px', padding: '4px 6px'}}>
                                Debug
                            </button>
                        </>
                    )}
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
                {error && (
                    <div className="error-message">
                        <div>{error}</div>
                        {pdfData && (
                            <div style={{ marginTop: '10px' }}>
                                <button onClick={tryDifferentMethod}>Try Different Method</button>
                                <button onClick={openExternal} style={{ marginLeft: '10px' }}>
                                    Open Externally
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {isLoading && (
                    <div className="loading-indicator">
                        Loading sheet music...
                        {debugInfo && <div style={{ fontSize: '12px', marginTop: '10px' }}>{debugInfo}</div>}
                    </div>
                )}

                {!pdfData && !isLoading && !error && (
                    <div className="no-pdf-message">
                        No sheet music selected. Click "Open Sheet Music" to choose a PDF file.
                    </div>
                )}

                {pdfData && (
                    <div
                        className="pdf-container"
                        style={{
                            transform: `scale(${zoom/100})`,
                            transformOrigin: 'top center',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        {renderPdfContent()}
                    </div>
                )}
            </div>

            {pdfData && (
                <div className="sheet-music-footer">
                    <span className="keyboard-hint">
                        Use arrow keys to navigate pages. Ctrl+/- to zoom.
                    </span>
                    <span className="method-hint">
                        Display method: {displayMethod}. {debugInfo}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SheetMusicViewer;