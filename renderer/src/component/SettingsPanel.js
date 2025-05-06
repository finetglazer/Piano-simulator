import React, { useState, useEffect } from 'react';
import SettingsStore from '../utils/SettingsStore';
import './SettingsPanel.css';

const SettingsPanel = ({ pianoEngine, onSettingsChange, isOpen, onClose }) => {
    const [settings, setSettings] = useState(null);
    const settingsStore = new SettingsStore();

    useEffect(() => {
        if (isOpen) {
            const loadedSettings = settingsStore.loadSettings();
            setSettings(loadedSettings);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (settings) {
            settingsStore.saveSettings(settings);

            // Apply settings to the piano engine if available
            if (pianoEngine) {
                // Update reverb
                if (pianoEngine.reverb) {
                    pianoEngine.reverb.wet.value = settings.reverbAmount;
                }

                // Update volume (we'd need to add a master volume to the piano engine)
                if (pianoEngine.sampler) {
                    pianoEngine.sampler.volume.value = Math.log10(settings.volume) * 20; // Convert to decibels
                }
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
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (!isOpen || !settings) return null;

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
                                max="1"
                                step="0.01"
                                value={settings.volume}
                                onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
                            />
                            <span>{Math.round(settings.volume * 100)}%</span>
                        </div>

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