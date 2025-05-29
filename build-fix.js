// build-fix.js - Script to fix common build issues
const fs = require('fs');
const path = require('path');

console.log('🔧 Piano Simulator Build Fix Script');
console.log('===================================');

// 1. Create missing build resources
const buildResourcesDir = 'build-resources';
const iconsDir = path.join(buildResourcesDir, 'icons');

if (!fs.existsSync(buildResourcesDir)) {
    fs.mkdirSync(buildResourcesDir, { recursive: true });
    console.log('✅ Created build-resources directory');
}

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ Created icons directory');
}

// 2. Create a simple default icon for Windows
const createSimpleIcon = () => {
    console.log('🎨 Creating default app icon...');

    // Create a simple SVG icon
    const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="#2c3e50" rx="20"/>
  <rect x="40" y="120" width="20" height="80" fill="white" stroke="#333" rx="2"/>
  <rect x="65" y="120" width="20" height="80" fill="white" stroke="#333" rx="2"/>
  <rect x="90" y="120" width="20" height="80" fill="white" stroke="#333" rx="2"/>
  <rect x="115" y="120" width="20" height="80" fill="white" stroke="#333" rx="2"/>
  <rect x="140" y="120" width="20" height="80" fill="white" stroke="#333" rx="2"/>
  <rect x="165" y="120" width="20" height="80" fill="white" stroke="#333" rx="2"/>
  <rect x="190" y="120" width="20" height="80" fill="white" stroke="#333" rx="2"/>
  <rect x="52" y="120" width="13" height="50" fill="#222" rx="1"/>
  <rect x="77" y="120" width="13" height="50" fill="#222" rx="1"/>
  <rect x="127" y="120" width="13" height="50" fill="#222" rx="1"/>
  <rect x="152" y="120" width="13" height="50" fill="#222" rx="1"/>
  <rect x="177" y="120" width="13" height="50" fill="#222" rx="1"/>
  <text x="128" y="90" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">🎹</text>
</svg>`;

    // Save SVG
    fs.writeFileSync(path.join(iconsDir, 'icon.svg'), iconSvg);
    console.log('✅ Created icon.svg');

    // Create a simple PNG (base64) - This is a minimal 256x256 PNG
    const simplePngBase64 = `iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGQSURBVHic7dUxAQAACAMgtX+kJlCBGwIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC+BjvAIggAATAAAmAABIAAEAADIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAHwA1BaA37QAAAA`;

    const pngBuffer = Buffer.from(simplePngBase64, 'base64');
    fs.writeFileSync(path.join(iconsDir, 'icon.png'), pngBuffer);
    console.log('✅ Created icon.png');

    // Create Windows ICO (simple method - just copy PNG with ico extension)
    fs.writeFileSync(path.join(iconsDir, 'icon.ico'), pngBuffer);
    console.log('✅ Created icon.ico');
};

// 3. Update electron-builder config to handle missing icons gracefully
const updateElectronBuilderConfig = () => {
    const configPath = 'electron-builder.js';

    const newConfig = `module.exports = {
    appId: "com.pianosimulator.app",
    productName: "Piano Simulator",
    copyright: \`Copyright © \${new Date().getFullYear()}\`,

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
};`;

    fs.writeFileSync(configPath, newConfig);
    console.log('✅ Updated electron-builder.js configuration');
};

// 4. Check package.json configuration
const checkPackageJson = () => {
    const packagePath = 'package.json';

    if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        // Ensure scripts are correct
        const requiredScripts = {
            "react-build": "cd renderer && npm run build",
            "build:win": "npm run react-build && electron-builder --config electron-builder.js --win",
            "build:mac": "npm run react-build && electron-builder --config electron-builder.js --mac",
            "build:linux": "npm run react-build && electron-builder --config electron-builder.js --linux",
            "dist": "npm run react-build && electron-builder --config electron-builder.js"
        };

        let modified = false;
        for (const [script, command] of Object.entries(requiredScripts)) {
            if (packageData.scripts[script] !== command) {
                packageData.scripts[script] = command;
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
            console.log('✅ Updated package.json scripts');
        } else {
            console.log('✅ Package.json scripts are correct');
        }
    }
};

// Run all fixes
console.log('\n🚀 Running build fixes...\n');

try {
    createSimpleIcon();
    updateElectronBuilderConfig();
    checkPackageJson();

    console.log('\n✅ All fixes applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run build:win');
    console.log('2. Or try: npm run dist');
    console.log('3. Check the dist/ folder for your built app');

} catch (error) {
    console.error('❌ Error applying fixes:', error);
}