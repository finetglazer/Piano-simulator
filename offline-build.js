// offline-build.js - Build script that works without network access
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔌 Piano Simulator Offline Build');
console.log('=================================');

// Set environment variables to disable network features
process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true';
process.env.ELECTRON_SKIP_BINARY_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = 'true';

// Create offline electron-builder config
const offlineConfig = {
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
        target: [
            {
                target: "portable",
                arch: ["x64"]
            }
        ],
        // Use default icon if custom icon fails
        icon: fs.existsSync("build-resources/icons/icon.ico") ?
            "build-resources/icons/icon.ico" : undefined
    },

    // Disable all network-dependent features
    nodeGypRebuild: false,
    buildDependenciesFromSource: false,

    // Disable auto-updater to prevent network calls
    publish: null,

    // Use store compression (faster, no network)
    compression: "store",

    // Disable signing (requires network for timestamp)
    forceCodeSigning: false,

    // Disable all external downloads
    electronDownload: {
        cache: path.join(__dirname, 'node_modules', 'electron', 'dist')
    }
};

// Save offline config
fs.writeFileSync('electron-builder.offline.js',
    `module.exports = ${JSON.stringify(offlineConfig, null, 2)};`);

console.log('✅ Created offline build configuration');

function runOfflineBuild() {
    try {
        console.log('\n📦 Building React app...');
        execSync('cd renderer && npm run build', { stdio: 'inherit' });

        console.log('\n🔌 Building Electron app (offline mode)...');
        execSync('npx electron-builder --config electron-builder.offline.js --publish=never',
            { stdio: 'inherit' });

        console.log('\n✅ Offline build completed successfully!');
        console.log('📂 Check the dist/ folder for Piano Simulator.exe');

    } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        console.log('\n🔧 Trying alternative approach...');

        // Try even simpler build
        try {
            execSync('npx electron-builder --win portable --publish=never --config.compression=store --config.nodeGypRebuild=false',
                { stdio: 'inherit' });
            console.log('✅ Alternative build succeeded!');
        } catch (altError) {
            console.error('❌ Alternative build also failed:', altError.message);
        }
    }
}

runOfflineBuild();