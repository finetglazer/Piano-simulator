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
        "!**/*.map"
    ],

    win: {
        target: ["nsis"],
        icon: "build-resources/icons/icon.ico"
    },

    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: "Piano Simulator"
    }
};