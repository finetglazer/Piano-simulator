module.exports = {
  "appId": "com.pianosimulator.app",
  "productName": "Piano Simulator",
  "directories": {
    "output": "dist"
  },
  "files": [
    "main.js",
    "preload.js",
    "renderer/build/**/*"
  ],
  "win": {
    "target": "portable"
  },
  "compression": "store",
  "nodeGypRebuild": false,
  "buildDependenciesFromSource": false,
  "publish": null
};