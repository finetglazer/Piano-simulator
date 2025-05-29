module.exports = {
  "appId": "com.pianosimulator.app",
  "productName": "Piano Simulator",
  "copyright": "Copyright © 2025",
  "directories": {
    "output": "dist",
    "buildResources": "build-resources"
  },
  "files": [
    "main.js",
    "preload.js",
    "renderer/build/**/*",
    "!**/*.map"
  ],
  "win": {
    "target": [
      {
        "target": "portable",
        "arch": [
          "x64"
        ]
      }
    ],
    "icon": "build-resources/icons/icon.ico"
  },
  "nodeGypRebuild": false,
  "buildDependenciesFromSource": false,
  "publish": null,
  "compression": "store",
  "forceCodeSigning": false,
  "electronDownload": {
    "cache": "D:\\piano-simulator\\node_modules\\electron\\dist"
  }
};