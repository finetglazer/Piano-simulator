// create-build-resources.js - Run this script to set up build resources
const fs = require('fs');
const path = require('path');

const buildResourcesDir = 'build-resources';
const iconsDir = path.join(buildResourcesDir, 'icons');

// Create directories
if (!fs.existsSync(buildResourcesDir)) {
    fs.mkdirSync(buildResourcesDir, { recursive: true });
    console.log('✅ Created build-resources directory');
}

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ Created icons directory');
}

// Create a simple SVG icon for the piano app
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Piano keyboard background -->
  <rect width="512" height="512" fill="#2c3e50" rx="40"/>
  
  <!-- White keys -->
  <rect x="60" y="200" width="40" height="160" fill="white" stroke="#333" stroke-width="2" rx="4"/>
  <rect x="110" y="200" width="40" height="160" fill="white" stroke="#333" stroke-width="2" rx="4"/>
  <rect x="160" y="200" width="40" height="160" fill="white" stroke="#333" stroke-width="2" rx="4"/>
  <rect x="210" y="200" width="40" height="160" fill="white" stroke="#333" stroke-width="2" rx="4"/>
  <rect x="260" y="200" width="40" height="160" fill="white" stroke="#333" stroke-width="2" rx="4"/>
  <rect x="310" y="200" width="40" height="160" fill="white" stroke="#333" stroke-width="2" rx="4"/>
  <rect x="360" y="200" width="40" height="160" fill="white" stroke="#333" stroke-width="2" rx="4"/>
  
  <!-- Black keys -->
  <rect x="85" y="200" width="25" height="100" fill="#222" rx="3"/>
  <rect x="135" y="200" width="25" height="100" fill="#222" rx="3"/>
  <rect x="235" y="200" width="25" height="100" fill="#222" rx="3"/>
  <rect x="285" y="200" width="25" height="100" fill="#222" rx="3"/>
  <rect x="335" y="200" width="25" height="100" fill="#222" rx="3"/>
  
  <!-- Musical note decoration -->
  <circle cx="256" cy="120" r="30" fill="#3498db"/>
  <ellipse cx="246" cy="120" rx="12" ry="18" fill="#2c3e50"/>
  <rect x="258" y="102" width="4" height="40" fill="#2c3e50"/>
  
  <!-- App title -->
  <text x="256" y="450" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="bold">Piano Simulator</text>
</svg>`;

// Save the SVG icon
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), iconSvg);
console.log('✅ Created icon.svg');

// Create a simple PNG icon (base64 encoded 1x1 pixel for demonstration)
// In a real project, you'd want to use proper icon files
console.log('📝 Icon files created. For best results:');
console.log('   1. Replace icon.svg with your custom design');
console.log('   2. Generate icon.ico (Windows), icon.icns (macOS), and icon.png (Linux)');
console.log('   3. Use online converters or tools like electron-icon-maker');

// Create a README for build resources
const readmeContent = `# Build Resources

This directory contains resources needed for building the Piano Simulator application.

## Icons

The following icon files are used for different platforms:

- \`icon.svg\` - Source SVG icon
- \`icon.ico\` - Windows icon (16x16 to 256x256)
- \`icon.icns\` - macOS icon (16x16 to 1024x1024)  
- \`icon.png\` - Linux icon (512x512 recommended)

## Generating Icons

You can use online tools to convert the SVG to other formats:

1. **Online converters:**
   - https://convertio.co/svg-ico/
   - https://cloudconvert.com/svg-to-icns
   - https://favicon.io/favicon-converter/

2. **Command line tools:**
   \`\`\`bash
   npm install -g electron-icon-maker
   electron-icon-maker --input=icon.png --output=./
   \`\`\`

## Notes

- Windows: Requires .ico format with multiple sizes
- macOS: Requires .icns format with retina support
- Linux: Uses .png format, 512x512 recommended
`;

fs.writeFileSync(path.join(buildResourcesDir, 'README.md'), readmeContent);
console.log('✅ Created build resources README');

console.log('\n🎯 Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Install renderer dependencies: cd renderer && npm install');
console.log('3. Generate proper icon files (see README.md)');
console.log('4. Build the application: npm run dist');