// renderer/src/utils/SettingsStore.js
// This class handles saving and loading application settings using localStorage

class SettingsStore {
    constructor() {
        this.storageKey = 'piano-simulator-settings';
        this.defaultSettings = {
            volume: 0.75,
            reverbAmount: 0.2,
            keyboardMapping: 'standard', // 'standard' or 'custom'
            visualizationMode: 'staff', // 'staff' or 'keyboard'
            showNoteLabels: true,
            theme: 'light' // 'light' or 'dark'
        };
    }

    // Load settings from localStorage
    loadSettings() {
        try {
            const storedSettings = localStorage.getItem(this.storageKey);
            if (storedSettings) {
                return { ...this.defaultSettings, ...JSON.parse(storedSettings) };
            }
            return { ...this.defaultSettings };
        } catch (error) {
            console.error('Error loading settings:', error);
            return { ...this.defaultSettings };
        }
    }

    // Save settings to localStorage
    saveSettings(settings) {
        try {
            const merged = { ...this.defaultSettings, ...settings };
            localStorage.setItem(this.storageKey, JSON.stringify(merged));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    // Update a single setting
    updateSetting(key, value) {
        const current = this.loadSettings();
        current[key] = value;
        return this.saveSettings(current);
    }

    // Reset settings to defaults
    resetSettings() {
        localStorage.removeItem(this.storageKey);
        return { ...this.defaultSettings };
    }
}

export default SettingsStore;