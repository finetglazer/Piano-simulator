// electron-builder.js
const path = require('path');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
    appId: "com.pianosimulator.app",
    productName: "Piano Simulator",
    copyright: `Copyright © ${new Date().getFullYear()}`,

    // Directories
    directories: {
        output: "dist",
        buildResources: "build-resources"
    },

    // Files to include
    files: [
        "main.js",
        "preload.js",
        {
            from: "renderer/build",
            to: "renderer/build"
        },
        "!**/*.map" // Exclude source maps in production
    ],

    // Extra resources to copy
    extraResources: [
        {
            from: "renderer/public/samples",
            to: "samples",
            filter: ["**/*"]
        }
    ],

    // Windows specific configuration
    win: {
        target: ["nsis"],
        icon: "build-resources/icons/icon.ico"
    },

    // macOS specific configuration
    mac: {
        target: ["dmg"],
        icon: "build-resources/icons/icon.icns",
        category: "public.app-category.music",
        darkModeSupport: true
    },

    // Linux specific configuration
    linux: {
        target: ["AppImage", "deb"],
        icon: "build-resources/icons/icon.png",
        category: "Audio;Music"
    },

    // NSIS configuration for Windows installer
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: "Piano Simulator"
    },

    // DMG configuration for macOS
    dmg: {
        contents: [
            {
                x: 130,
                y: 220
            },
            {
                x: 410,
                y: 220,
                type: "link",
                path: "/Applications"
            }
        ]
    },

    // Publish options (for auto-updates if implemented later)
    publish: {
        provider: "github",
        releaseType: "release"
    }
};

module.exports = config;