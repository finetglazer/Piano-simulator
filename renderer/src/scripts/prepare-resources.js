// scripts/prepare-resources.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create necessary directories
const buildResourcesDir = path.join(__dirname, '../build-resources');
const iconsDir = path.join(buildResourcesDir, 'icons');

if (!fs.existsSync(buildResourcesDir)) {
    fs.mkdirSync(buildResourcesDir, { recursive: true });
    console.log('✅ Created build-resources directory');
}

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ Created icons directory');
}

// Function to copy files with logging
function copyFile(source, destination) {
    try {
        fs.copyFileSync(source, destination);
        console.log(`✅ Copied ${path.basename(source)} to ${destination}`);
    } catch (error) {
        console.error(`❌ Error copying ${source}: ${error.message}`);
    }
}

// Update package.json if needed
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

if (!packageJson.build.directories) {
    packageJson.build.directories = { buildResources: 'build-resources' };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json build configuration');
}

// Check for renderer build directory
const rendererBuildDir = path.join(__dirname, '../renderer/build');
if (!fs.existsSync(rendererBuildDir)) {
    console.log('⚠️ Renderer build directory not found. You may need to run: npm run react-build');
}

// Check for sample files
const samplesDir = path.join(__dirname, '../renderer/public/samples');
if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
    console.log('✅ Created samples directory');
    console.log('⚠️ Piano samples not found. Download Salamander Grand Piano samples and place them in renderer/public/samples/');
}

// Print completion message with next steps
console.log('\n==== Resource Preparation Complete ====');
console.log('Next steps:');
console.log('1. Make sure piano samples are in renderer/public/samples/');
console.log('2. Build the application with: npm run build');
console.log('3. Find the packaged application in the dist/ directory');