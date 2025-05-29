module.exports = {
    appId: "com.pianosimulator.app",
    productName: "Piano Simulator",
    copyright: `Copyright © ${new Date().getFullYear()}`,

    directories: {
        output: "dist",
        buildResources: "build-resources"
    },

    files: [
        "main.js",
        "preload.js",
        "renderer/build/**/*",
        "!**/*.map",
        "!**/node_modules/*",
        "!**/*.ts"
    ],

    extraFiles: [
        {
            "from": "renderer/public/samples",
            "to": "samples",
            "filter": ["**/*"]
        }
    ],

    win: {
        target: [
            {
                target: "nsis",
                arch: ["x64"]
            },
            {
                target: "portable",
                arch: ["x64"]
            }
        ],
        icon: "build-resources/icons/icon.ico",
        publisherName: "Piano Simulator"
    },

    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        allowElevation: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: "Piano Simulator",
        installerIcon: "build-resources/icons/icon.ico",
        uninstallerIcon: "build-resources/icons/icon.ico"
    },

    mac: {
        target: [
            {
                target: "dmg",
                arch: ["x64", "arm64"]
            }
        ],
        icon: "build-resources/icons/icon.icns",
        category: "public.app-category.music"
    },

    linux: {
        target: [
            {
                target: "AppImage",
                arch: ["x64"]
            },
            {
                target: "deb",
                arch: ["x64"]
            }
        ],
        icon: "build-resources/icons/icon.png",
        category: "Audio"
    },

    compression: "normal",
    
    // Add this to help with build issues
    nodeGypRebuild: false,
    buildDependenciesFromSource: false
};