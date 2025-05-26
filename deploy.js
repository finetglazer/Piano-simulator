// deploy.js - Complete deployment script for Piano Simulator
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎹 Piano Simulator - Deployment Script');
console.log('=====================================\n');

// Configuration
const config = {
    appName: 'Piano Simulator',
    version: '1.0.0',
    platforms: {
        win: { name: 'Windows', cmd: 'dist-win' },
        mac: { name: 'macOS', cmd: 'dist-mac' },
        linux: { name: 'Linux', cmd: 'dist-linux' },
        all: { name: 'All Platforms', cmd: 'dist-all' }
    }
};

// Helper functions
function runCommand(command, description) {
    console.log(`\n⚡ ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completed successfully`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        return false;
    }
}

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${description} found`);
        return true;
    } else {
        console.log(`⚠️  ${description} not found: ${filePath}`);
        return false;
    }
}

function createDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dirPath}`);
    }
}

// Main deployment function
async function deploy(platform = 'win') {
    const startTime = Date.now();

    console.log(`🚀 Starting deployment for ${config.platforms[platform].name}...\n`);

    // Step 1: Check prerequisites
    console.log('📋 Checking prerequisites...');

    const checks = [
        checkFile('package.json', 'Root package.json'),
        checkFile('main.js', 'Main Electron file'),
        checkFile('preload.js', 'Preload script'),
        checkFile('renderer/package.json', 'Renderer package.json'),
        checkFile('renderer/src/App.js', 'React App component')
    ];

    if (!checks.every(check => check)) {
        console.error('❌ Prerequisites check failed. Please ensure all required files exist.');
        process.exit(1);
    }

    // Step 2: Create build resources
    console.log('\n📁 Setting up build resources...');
    createDirectory('build-resources');
    createDirectory('build-resources/icons');
    createDirectory('dist');

    // Step 3: Install dependencies
    console.log('\n📦 Installing dependencies...');
    if (!runCommand('npm install', 'Installing root dependencies')) {
        process.exit(1);
    }

    if (!runCommand('cd renderer && npm install', 'Installing renderer dependencies')) {
        process.exit(1);
    }

    // Step 4: Build React application
    console.log('\n⚛️  Building React application...');
    if (!runCommand('cd renderer && npm run build', 'Building React app')) {
        process.exit(1);
    }

    // Step 5: Prepare resources
    console.log('\n🔧 Preparing resources...');

    // Check for piano samples
    const samplesDir = 'renderer/public/samples';
    if (!fs.existsSync(samplesDir)) {
        console.log('⚠️  Warning: Piano samples directory not found');
        console.log('   The app will work but without piano sounds');
        console.log('   Download Salamander Grand Piano samples to:', samplesDir);
    }

    // Step 6: Build Electron application
    console.log(`\n🔨 Building Electron application for ${config.platforms[platform].name}...`);
    const buildCommand = `npm run ${config.platforms[platform].cmd}`;

    if (!runCommand(buildCommand, `Building ${config.platforms[platform].name} application`)) {
        console.error('❌ Build failed. Check the error messages above.');
        process.exit(1);
    }

    // Step 7: Show results
    console.log('\n🎉 Build completed successfully!');
    console.log('📂 Output files are located in the "dist" directory:');

    try {
        const distFiles = fs.readdirSync('dist');
        distFiles.forEach(file => {
            const filePath = path.join('dist', file);
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`   📄 ${file} (${size} MB)`);
        });
    } catch (error) {
        console.log('   (Could not list output files)');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱️  Total build time: ${duration} seconds`);

    console.log('\n🚀 Your Piano Simulator app is ready to distribute!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the executable in the dist folder');
    console.log('   2. Share the installer with users');
    console.log('   3. Consider code signing for production (optional)');
}

// Command line interface
function showHelp() {
    console.log('Usage: node deploy.js [platform]');
    console.log('\nPlatforms:');
    Object.entries(config.platforms).forEach(([key, value]) => {
        console.log(`  ${key.padEnd(8)} - Build for ${value.name}`);
    });
    console.log('\nExamples:');
    console.log('  node deploy.js win     - Build Windows installer');
    console.log('  node deploy.js mac     - Build macOS DMG');
    console.log('  node deploy.js linux   - Build Linux AppImage');
    console.log('  node deploy.js all     - Build for all platforms');
    console.log('  node deploy.js         - Build for Windows (default)');
}

// Parse command line arguments
const args = process.argv.slice(2);
const platform = args[0] || 'win';

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

if (!config.platforms[platform]) {
    console.error(`❌ Unknown platform: ${platform}`);
    showHelp();
    process.exit(1);
}

// Run deployment
deploy(platform).catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n⏹️  Build cancelled by user');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n⏹️  Build terminated');
    process.exit(1);
});