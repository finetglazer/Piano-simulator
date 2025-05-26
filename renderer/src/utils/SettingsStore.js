// Enhanced SettingsStore.js with extended volume range support
class SettingsStore {
    constructor() {
        this.storageKey = 'piano-simulator-settings';
        this.defaultSettings = {
            volume: 0.85, // Slightly higher default (85% instead of 75%)
            reverbAmount: 0.2,
            keyboardMapping: 'standard', // 'standard' or 'custom'
            visualizationMode: 'staff', // 'staff' or 'keyboard'
            showNoteLabels: true,
            theme: 'light', // 'light' or 'dark'
            // New volume-related settings
            volumeBoostEnabled: false, // Whether user has enabled volume boost
            maxVolumeUsed: 0.85, // Track highest volume user has used
            audioWarningShown: false // Whether we've shown the volume warning
        };
    }

    // Load settings from localStorage with validation
    loadSettings() {
        try {
            const storedSettings = localStorage.getItem(this.storageKey);
            if (storedSettings) {
                const parsed = JSON.parse(storedSettings);

                // Validate and sanitize volume settings
                const sanitized = this._sanitizeSettings(parsed);
                return { ...this.defaultSettings, ...sanitized };
            }
            return { ...this.defaultSettings };
        } catch (error) {
            console.error('Error loading settings:', error);
            return { ...this.defaultSettings };
        }
    }

    // Sanitize settings to ensure safe volume levels
    _sanitizeSettings(settings) {
        const sanitized = { ...settings };

        // Ensure volume is within safe bounds (0 to 1.5 max)
        if (sanitized.volume !== undefined) {
            sanitized.volume = Math.max(0, Math.min(1.5, sanitized.volume));
        }

        // Cap reverb amount
        if (sanitized.reverbAmount !== undefined) {
            sanitized.reverbAmount = Math.max(0, Math.min(1, sanitized.reverbAmount));
        }

        // Ensure boolean settings
        if (typeof sanitized.volumeBoostEnabled !== 'boolean') {
            sanitized.volumeBoostEnabled = false;
        }

        if (typeof sanitized.audioWarningShown !== 'boolean') {
            sanitized.audioWarningShown = false;
        }

        // Track max volume used
        if (sanitized.maxVolumeUsed !== undefined) {
            sanitized.maxVolumeUsed = Math.max(sanitized.maxVolumeUsed || 0, sanitized.volume || 0);
        }

        return sanitized;
    }

    // Save settings to localStorage with validation
    saveSettings(settings) {
        try {
            const sanitized = this._sanitizeSettings(settings);
            const merged = { ...this.defaultSettings, ...sanitized };

            // Log volume changes for debugging
            if (settings.volume !== undefined) {
                const volumePercent = Math.round(settings.volume * 100);
                console.log(`Volume setting saved: ${volumePercent}%${settings.volume > 1.0 ? ' (BOOSTED)' : ''}`);

                // Show warning for first-time volume boost
                if (settings.volume > 1.0 && !merged.audioWarningShown) {
                    merged.audioWarningShown = true;
                    this._showVolumeBoostWarning();
                }

                // Update max volume tracking
                merged.maxVolumeUsed = Math.max(merged.maxVolumeUsed || 0, settings.volume);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(merged));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    // Show warning when user first enables volume boost
    _showVolumeBoostWarning() {
        if (typeof window !== 'undefined' && window.confirm) {
            const message =
                "⚠️ VOLUME BOOST ENABLED ⚠️\n\n" +
                "You've enabled volume boost above 100%.\n\n" +
                "Please be aware:\n" +
                "• High volumes may cause audio distortion\n" +
                "• This may be louder than other applications\n" +
                "• Protect your hearing and speakers\n" +
                "• Start with lower settings and adjust gradually\n\n" +
                "Continue with volume boost?";

            return window.confirm(message);
        }
        return true;
    }

    // Update a single setting with validation
    updateSetting(key, value) {
        const current = this.loadSettings();

        // Special handling for volume changes
        if (key === 'volume') {
            value = Math.max(0, Math.min(1.5, value)); // Clamp to safe range

            // Auto-enable volume boost if needed
            if (value > 1.0) {
                current.volumeBoostEnabled = true;
            }
        }

        current[key] = value;
        return this.saveSettings(current);
    }

    // Reset settings to defaults
    resetSettings() {
        localStorage.removeItem(this.storageKey);
        console.log('Settings reset to defaults');
        return { ...this.defaultSettings };
    }

    // Get volume statistics for debugging
    getVolumeStats() {
        const settings = this.loadSettings();
        return {
            currentVolume: settings.volume,
            currentVolumePercent: Math.round(settings.volume * 100),
            maxVolumeUsed: settings.maxVolumeUsed,
            maxVolumeUsedPercent: Math.round((settings.maxVolumeUsed || 0) * 100),
            isBoostEnabled: settings.volumeBoostEnabled,
            isBoosted: settings.volume > 1.0,
            warningShown: settings.audioWarningShown
        };
    }

    // Export settings for backup
    exportSettings() {
        const settings = this.loadSettings();
        const exportData = {
            ...settings,
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0'
        };

        return JSON.stringify(exportData, null, 2);
    }

    // Import settings from backup
    importSettings(settingsJson) {
        try {
            const imported = JSON.parse(settingsJson);
            delete imported.exportDate; // Remove metadata
            delete imported.appVersion;

            const sanitized = this._sanitizeSettings(imported);
            return this.saveSettings(sanitized);
        } catch (error) {
            console.error('Error importing settings:', error);
            return false;
        }
    }

    // Check if current volume is safe
    isVolumeSafe(volume = null) {
        const checkVolume = volume ?? this.loadSettings().volume;
        return checkVolume <= 1.0;
    }

    // Get recommended volume level based on usage
    getRecommendedVolume() {
        const stats = this.getVolumeStats();

        // If user has used high volumes before, suggest a moderate boost
        if (stats.maxVolumeUsed > 1.0) {
            return Math.min(1.1, stats.maxVolumeUsed * 0.9);
        }

        // Otherwise suggest standard level
        return 0.85;
    }
}

export default SettingsStore;