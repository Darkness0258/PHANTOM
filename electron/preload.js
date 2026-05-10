const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('phantom', {
  version: '1.0.0',
  platform: process.platform
})