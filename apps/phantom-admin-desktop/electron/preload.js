const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('phantom', {
  version:  process.versions.electron,
  platform: process.platform,
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
})