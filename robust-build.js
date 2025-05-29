// robust-build.js - Step-by-step build with error checking
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎹 Piano Simulator - Robust Build Script');
console.log('=========================================\n');

// Set offline environment variables
process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true';
process.env.ELECTRON_SKIP_BINARY_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

function checkStep(stepName, condition) {
    if (condition) {
        console.log(`✅ ${stepName}`);
        return true;
    } else {
        console.log(`❌ ${stepName}`);
        return false;
    }
}

function runCommand(command, description, cwd = process.cwd()) {
    console.log(`\n⚡ ${description}...`);
    console.log(`📁 Working directory: ${cwd}`);
    console.log(`🔧 Command: ${command}\n`);

    try {
        const result = execSync(command, {
            stdio: 'inherit',
            cwd: cwd,
            env: { ...process.env }
        });
        console.log(`✅ ${description} completed\n`);
        return true;
    } catch (error) {
        console.log(`❌ ${description} failed:`);
        console.log(error.message);
        return false;
    }
}

async function main() {
    console.log('🔍 Step 1: Checking prerequisites...\n');

    // Check required files
    const checks = [
        ['package.json exists', fs.existsSync('package.json')],
        ['main.js exists', fs.existsSync('main.js')],
        ['preload.js exists', fs.existsSync('preload.js')],
        ['renderer folder exists', fs.existsSync('renderer')],
        ['renderer/package.json exists', fs.existsSync('renderer/package.json')],
        ['renderer/src exists', fs.existsSync('renderer/src')],
        ['renderer/public exists', fs.existsSync('renderer/public')]
    ];

    let allChecksPassed = true;
    checks.forEach(([name, condition]) => {
        if (!checkStep(name, condition)) {
            allChecksPassed = false;
        }
    });

    if (!allChecksPassed) {
        console.log('\n❌ Prerequisites check failed. Please ensure all required files exist.');
        return;
    }

    console.log('\n🔧 Step 2: Creating build directories...\n');

    // Create necessary directories
    ['dist', 'build-resources', 'build-resources/icons'].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created ${dir}`);
        } else {
            console.log(`✅ ${dir} already exists`);
        }
    });

    console.log('\n📦 Step 3: Installing root dependencies...\n');

    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
        if (!runCommand('npm install --no-audit --no-fund', 'Installing root dependencies')) {
            console.log('❌ Failed to install root dependencies');
            return;
        }
    } else {
        console.log('✅ Root node_modules already exists');
    }

    console.log('\n📦 Step 4: Installing renderer dependencies...\n');

    // Check if renderer node_modules exists
    if (!fs.existsSync('renderer/node_modules')) {
        if (!runCommand('npm install --no-audit --no-fund', 'Installing renderer dependencies', 'renderer')) {
            console.log('❌ Failed to install renderer dependencies');
            return;
        }
    } else {
        console.log('✅ Renderer node_modules already exists');
    }

    console.log('\n⚛️ Step 5: Building React application...\n');

    // Build React app
    if (!runCommand('npm run build', 'Building React application', 'renderer')) {
        console.log('❌ React build failed');
        return;
    }

    // Check if React build was successful
    const buildExists = fs.existsSync('renderer/build') &&
        fs.existsSync('renderer/build/index.html') &&
        fs.existsSync('renderer/build/static');

    if (!checkStep('React build output exists', buildExists)) {
        console.log('❌ React build did not produce expected output');
        return;
    }

    console.log('\n🔨 Step 6: Building Electron application...\n');

    // Create simple electron-builder configuration
    const simpleConfig = {
        appId: "com.pianosimulator.app",
        productName: "Piano Simulator",
        directories: {
            output: "dist"
        },
        files: [
            "main.js",
            "preload.js",
            "renderer/build/**/*"
        ],
        win: {
            target: "portable"
        },
        compression: "store",
        nodeGypRebuild: false,
        buildDependenciesFromSource: false,
        publish: null
    };

    // Save simple config
    fs.writeFileSync('electron-builder.simple.js',
        `module.exports = ${JSON.stringify(simpleConfig, null, 2)};`);

    console.log('✅ Created simple build configuration');

    // Try multiple build approaches
    const buildCommands = [
        'npx electron-builder --config electron-builder.simple.js --publish=never',
        'npx electron-builder --win portable --publish=never --config.compression=store',
        'npx electron-builder --win --publish=never'
    ];

    let buildSucceeded = false;

    for (let i = 0; i < buildCommands.length; i++) {
        console.log(`\n🔨 Attempt ${i + 1}: ${buildCommands[i]}\n`);

        if (runCommand(buildCommands[i], `Electron build attempt ${i + 1}`)) {
            buildSucceeded = true;
            break;
        }

        console.log(`⚠️ Attempt ${i + 1} failed, trying next approach...\n`);
    }

    if (!buildSucceeded) {
        console.log('\n❌ All build attempts failed!');
        console.log('\n🔧 Manual steps to try:');
        console.log('1. Check if you have admin permissions');
        console.log('2. Temporarily disable antivirus');
        console.log('3. Try building with VPN');
        console.log('4. Check available disk space (need ~500MB)');
        return;
    }

    console.log('\n🎉 Step 7: Checking build output...\n');

    // Check what was built
    if (fs.existsSync('dist')) {
        const distFiles = fs.readdirSync('dist');
        console.log('📂 Files in dist folder:');
        distFiles.forEach(file => {
            const filePath = path.join('dist', file);
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`   📄 ${file} (${size} MB)`);
        });

        // Look for executable
        const executable = distFiles.find(file =>
            file.endsWith('.exe') ||
            file.includes('Piano Simulator') ||
            file.includes('piano-simulator')
        );

        if (executable) {
            console.log(`\n✅ SUCCESS! Your app is ready: dist/${executable}`);
            console.log('\n🚀 To run your app:');
            console.log(`   cd dist`);
            console.log(`   "${executable}"`);
        } else {
            console.log('\n⚠️ Build completed but no executable found');
            console.log('📂 Check the dist folder manually');
        }
    } else {
        console.log('❌ No dist folder created');
    }
}

// Run the main function
main().catch(error => {
    console.error('\n💥 Build script crashed:', error);
});