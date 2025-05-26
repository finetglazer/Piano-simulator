import React, { useState, useEffect } from 'react';
import SettingsStore from '../utils/SettingsStore';
import './SettingsPanel.css';

const SettingsPanel = ({ pianoEngine, onSettingsChange, isOpen, onClose }) => {
    const [settings, setSettings] = useState(null);
    const [volumeDisplay, setVolumeDisplay] = useState(75); // For real-time display
    const [showAdvancedVolume, setShowAdvancedVolume] = useState(false);
    const settingsStore = new SettingsStore();

    useEffect(() => {
        if (isOpen) {
            const loadedSettings = settingsStore.loadSettings();
            setSettings(loadedSettings);
            // Initialize volume display
            setVolumeDisplay(Math.round(loadedSettings.volume * 100));

            // Show advanced volume if volume is above 100%
            setShowAdvancedVolume(loadedSettings.volume > 1.0);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (settings) {
            settingsStore.saveSettings(settings);

            // Apply settings to the piano engine if available
            if (pianoEngine) {
                // Let the piano engine handle the settings update entirely
                pianoEngine.updateSettings({
                    volume: settings.volume,
                    reverbWet: settings.reverbAmount,
                });
                console.log('Settings saved and applied to piano engine');
            }

            // Notify parent component
            if (onSettingsChange) {
                onSettingsChange(settings);
            }

            onClose();
        }
    };

    const handleReset = () => {
        const defaultSettings = settingsStore.resetSettings();
        setSettings(defaultSettings);
        // Update volume display
        setVolumeDisplay(Math.round(defaultSettings.volume * 100));
        setShowAdvancedVolume(false);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        // Update settings
        setSettings(prev => ({
            ...prev,
            volume: newVolume
        }));
        // Update display value
        setVolumeDisplay(Math.round(newVolume * 100));

        // Apply volume change immediately for better user experience
        if (pianoEngine) {
            pianoEngine.updateSettings({
                volume: newVolume
            });
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const toggleAdvancedVolume = () => {
        setShowAdvancedVolume(!showAdvancedVolume);
        if (!showAdvancedVolume && settings.volume > 1.0) {
            // Reset to 100% if disabling advanced mode
            handleVolumeChange({ target: { value: '1.0' } });
        }
    };

    // Test volume boost function
    const testVolumeBoost = () => {
        if (pianoEngine && pianoEngine.setTemporaryVolumeBoost) {
            pianoEngine.setTemporaryVolumeBoost(6);
            setTimeout(() => {
                pianoEngine.updateSettings({ volume: settings.volume });
            }, 2000);
        }
    };

    if (!isOpen || !settings) return null;

    const maxVolume = showAdvancedVolume ? 1.5 : 1.0; // 150% max in advanced mode
    const volumeStep = showAdvancedVolume ? 0.01 : 0.01;

    return (
        <div className="settings-overlay">
            <div className="settings-panel">
                <div className="settings-header">
                    <h2>Piano Simulator Settings</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="settings-content">
                    <div className="settings-section">
                        <h3>Sound Settings</h3>

                        <div className="setting-control">
                            <label htmlFor="volume">Master Volume</label>
                            <input
                                id="volume"
                                type="range"
                                min="0"
                                max={maxVolume}
                                step={volumeStep}
                                value={settings.volume}
                                onChange={handleVolumeChange}
                                style={{
                                    background: settings.volume > 1.0
                                        ? 'linear-gradient(to right, #4CAF50 0%, #4CAF50 66%, #FF9800 66%, #FF9800 100%)'
                                        : '#4CAF50'
                                }}
                            />
                            <span style={{
                                color: settings.volume > 1.0 ? '#FF9800' : 'inherit',
                                fontWeight: settings.volume > 1.0 ? 'bold' : 'normal'
                            }}>
                                {volumeDisplay}%
                                {settings.volume > 1.0 && <span title="Amplified"> 🔊</span>}
                            </span>
                        </div>

                        <div className="setting-control checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={showAdvancedVolume}
                                    onChange={toggleAdvancedVolume}
                                />
                                Enable Volume Boost (up to 150%)
                                {showAdvancedVolume && <span style={{color: '#FF9800'}}> - Use carefully!</span>}
                            </label>
                        </div>

                        {pianoEngine && pianoEngine.getCurrentVolumeDb && (
                            <div className="setting-control">
                                <label>Current Volume</label>
                                <span style={{fontFamily: 'monospace', fontSize: '12px'}}>
                                    {pianoEngine.getCurrentVolumeDb()?.toFixed(1) || 'N/A'} dB
                                </span>
                                <button
                                    onClick={testVolumeBoost}
                                    style={{
                                        marginLeft: '10px',
                                        padding: '2px 8px',
                                        fontSize: '12px',
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Test Boost
                                </button>
                            </div>
                        )}

                        <div className="setting-control">
                            <label htmlFor="reverbAmount">Reverb Amount</label>
                            <input
                                id="reverbAmount"
                                type="range"
                                min="0"
                                max="0.8"
                                step="0.01"
                                value={settings.reverbAmount}
                                onChange={(e) => handleChange('reverbAmount', parseFloat(e.target.value))}
                            />
                            <span>{Math.round(settings.reverbAmount * 100)}%</span>
                        </div>

                        {showAdvancedVolume && (
                            <div style={{
                                backgroundColor: '#FFF3E0',
                                border: '1px solid #FFB74D',
                                borderRadius: '4px',
                                padding: '10px',
                                margin: '10px 0',
                                fontSize: '12px',
                                color: '#E65100'
                            }}>
                                <strong>⚠️ Volume Boost Warning:</strong>
                                <br />• High volume may cause audio distortion
                                <br />• May be louder than other system sounds
                                <br />• Protect your hearing and speakers
                            </div>
                        )}
                    </div>

                    <div className="settings-section">
                        <h3>Display Settings</h3>

                        <div className="setting-control">
                            <label>Visualization Mode</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="visualizationMode"
                                        value="staff"
                                        checked={settings.visualizationMode === 'staff'}
                                        onChange={() => handleChange('visualizationMode', 'staff')}
                                    />
                                    Staff Notation
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="visualizationMode"
                                        value="keyboard"
                                        checked={settings.visualizationMode === 'keyboard'}
                                        onChange={() => handleChange('visualizationMode', 'keyboard')}
                                    />
                                    Keyboard
                                </label>
                            </div>
                        </div>

                        <div className="setting-control checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.showNoteLabels}
                                    onChange={(e) => handleChange('showNoteLabels', e.target.checked)}
                                />
                                Show Note Labels
                            </label>
                        </div>

                        <div className="setting-control">
                            <label>Theme</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="theme"
                                        value="light"
                                        checked={settings.theme === 'light'}
                                        onChange={() => handleChange('theme', 'light')}
                                    />
                                    Light
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="theme"
                                        value="dark"
                                        checked={settings.theme === 'dark'}
                                        onChange={() => handleChange('theme', 'dark')}
                                    />
                                    Dark
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="settings-button reset" onClick={handleReset}>Reset to Defaults</button>
                    <button className="settings-button save" onClick={handleSave}>Save Settings</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;