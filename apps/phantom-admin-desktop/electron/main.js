const { app, BrowserWindow, Tray, Menu, nativeImage, shell, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow = null
let tray       = null
let isDev      = !app.isPackaged

function createWindow() {
  mainWindow = new BrowserWindow({
    width:           1280,
    height:          800,
    minWidth:        900,
    minHeight:       600,
    titleBarStyle:   'hidden',
    titleBarOverlay: {
      color:        '#070a10',
      symbolColor:  '#00e5ff',
      height:       32,
    },
    backgroundColor: '#070a10',
    webPreferences: {
      nodeIntegration:     false,
      contextIsolation:    true,
      preload:             path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png')
  tray = new Tray(iconPath)

  const menu = Menu.buildFromTemplate([
    { label: 'PHANTOM Admin', enabled: false },
    { type:  'separator' },
    { label: 'Open Dashboard', click: () => { mainWindow.show(); mainWindow.focus() } },
    { label: 'Open in Browser', click: () => shell.openExternal('http://localhost:5173') },
    { type:  'separator' },
    { label: 'Core API',  click: () => shell.openExternal('http://localhost:8000/health') },
    { label: 'AI Service', click: () => shell.openExternal('http://localhost:8001/health') },
    { type:  'separator' },
    { label: 'Quit PHANTOM', click: () => { app.isQuitting = true; app.quit() } },
  ])

  tray.setToolTip('PHANTOM Network Guardian')
  tray.setContextMenu(menu)
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus() })
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  app.isQuitting = true
})