# 🎹 Piano Simulator - Deployment Guide

This guide will help you create a standalone executable app that can run without any development environment.

## 📋 Prerequisites

Before building, make sure you have:

1. **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Git** (optional, for version control)

### Check if you have them:
```bash
node --version    # Should show v16.0.0 or higher
npm --version     # Should show version number
```

## 🚀 Quick Start (Easiest Method)

### For Windows Users:
1. Double-click `build.bat`
2. Wait for the build to complete
3. Find your app in the `dist` folder

### For Mac/Linux Users:
1. Make the script executable: `chmod +x build.sh`
2. Run: `./build.sh`
3. Find your app in the `dist` folder

## 🔧 Manual Build Process

If you prefer to run commands manually:

### Step 1: Install Dependencies
```bash
# Install main dependencies
npm install

# Install React dependencies
cd renderer
npm install
cd ..
```

### Step 2: Build the Application
```bash
# Build React frontend
cd renderer
npm run build
cd ..

# Build for your platform
npm run dist-win     # Windows
npm run dist-mac     # macOS
npm run dist-linux   # Linux
npm run dist-all     # All platforms
```

## 📦 Build Output

After building, you'll find these files in the `dist` folder:

### Windows:
- `Piano Simulator Setup 1.0.0.exe` - Installer
- `Piano Simulator 1.0.0.exe` - Portable version

### macOS:
- `Piano Simulator-1.0.0.dmg` - DMG installer
- `Piano Simulator-1.0.0-mac.zip` - App bundle

### Linux:
- `Piano Simulator-1.0.0.AppImage` - Portable Linux app
- `piano-simulator_1.0.0_amd64.deb` - Debian package

## 🎵 Adding Piano Samples

**Important:** Your app needs piano sound samples to work properly.

1. Download **Salamander Grand Piano** samples:
    - Visit: https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html
    - Download the FLAC or MP3 version

2. Extract and place samples in:
   ```
   renderer/public/samples/SalamanderGrandPiano-SFZ+FLAC-V3+20200602/
   ```

3. The samples will be automatically included in your built app

## 🛠️ Advanced Build Options

### Custom Icons
1. Create your icon files:
    - `build-resources/icons/icon.ico` (Windows)
    - `build-resources/icons/icon.icns` (macOS)
    - `build-resources/icons/icon.png` (Linux)

2. Use online converters or tools like `electron-icon-maker`:
   ```bash
   npm install -g electron-icon-maker
   electron-icon-maker --input=my-icon.png --output=build-resources/icons/
   ```

### Build for Specific Architecture
```bash
# 64-bit only
npm run dist-win -- --x64

# 32-bit only
npm run dist-win -- --ia32

# Apple Silicon (M1/M2)
npm run dist-mac -- --arm64

# Intel Mac
npm run dist-mac -- --x64
```

### Debug Build Issues
```bash
# Build with verbose output
npm run dist -- --publish=never --config.compression=normal

# Skip code signing (macOS)
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run dist-mac
```

## 📊 Build Sizes

Typical build sizes:
- **Windows installer**: ~150-200 MB
- **macOS DMG**: ~150-200 MB
- **Linux AppImage**: ~150-200 MB
- **With piano samples**: +500-800 MB

## 🔍 Troubleshooting

### Common Issues:

#### "Node.js not found"
- Install Node.js from nodejs.org
- Restart your terminal/command prompt

#### "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules renderer/node_modules
npm install
cd renderer && npm install
```

#### "React build fails"
```bash
# Check for syntax errors in your code
cd renderer
npm run build
```

#### "Electron build fails"
```bash
# Install electron-builder globally
npm install -g electron-builder

# Try building again
npm run dist
```

#### "App won't start"
- Check that all dependencies are installed
- Verify the main.js and preload.js files exist
- Look for error messages in the console

#### "No piano sounds"
- Make sure piano samples are in `renderer/public/samples/`
- Check the file paths in `PianoSampleLoader.js`
- Verify samples are included in the build

### macOS Specific:

#### "App is damaged and can't be opened"
```bash
# Allow unsigned apps (for testing)
sudo spctl --master-disable

# Or sign your app (for distribution)
codesign --force --deep --sign - "dist/mac/Piano Simulator.app"
```

### Windows Specific:

#### "Windows Defender blocks the app"
- This is normal for unsigned apps
- Users can click "More info" → "Run anyway"
- For production, consider code signing

## 🚀 Distribution

### For Personal Use:
- Use the portable versions (no installation required)
- Share the executable files directly

### For Public Distribution:
1. **Code Signing** (recommended):
    - Windows: Get a code signing certificate
    - macOS: Join Apple Developer Program
    - Linux: Not required

2. **Auto-Updates** (optional):
    - Configure GitHub releases in `package.json`
    - Enable auto-updater in the app

3. **File Hosting**:
    - GitHub Releases (free)
    - Your own website
    - App stores (requires additional setup)

## 📝 Build Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build React app only |
| `npm run pack` | Package without creating installer |
| `npm run dist` | Build installer for current platform |
| `npm run dist-win` | Build Windows installer |
| `npm run dist-mac` | Build macOS DMG |
| `npm run dist-linux` | Build Linux packages |
| `npm run dist-all` | Build for all platforms |

## 🎯 Final Checklist

Before distributing your app:

- [ ] ✅ App builds successfully
- [ ] ✅ App starts and loads correctly
- [ ] ✅ Piano sounds work
- [ ] ✅ Sheet music viewer functions
- [ ] ✅ Recording feature works
- [ ] ✅ Settings are saved
- [ ] ✅ All features tested on target platform
- [ ] ✅ App icon appears correctly
- [ ] ✅ Installer works (if using installer)

## 🆘 Need Help?

If you encounter issues:

1. Check the error messages carefully
2. Look in the `dist` folder for build logs
3. Try building on a fresh system
4. Search for specific error messages online
5. Check Electron and electron-builder documentation

## 🎉 Success!

Once built successfully, your Piano Simulator app is ready to share! Users can simply:

1. Download your installer or portable app
2. Run it directly (no setup required)
3. Enjoy playing piano!

The app will work completely offline and doesn't require any development tools or internet connection.