import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
var fs = require('fs');
const path = require('path');
// import log from 'electron-log';
// require('@electron/remote/main').initialize()
// log.initialize({ preload: true });
const { Menu } = require('electron')

Menu.setApplicationMenu(null)

// log.info('Log from the main process');
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')
async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    width: 1200, height: 960,
    backgroundColor: "#f0f2f5",
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: true,
      nodeIntegrationInWorker: true
      // enableRemoteModule:true

    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
    // win.webContents.openDevTools()

  }


  // log.info('process argv', process.argv)
  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })


}


async function handleSetDir(event, { dir: dir, type: type }) {
  // log.info('handlesetdir',dir,type)
  if (type == 'init') {
    dir = process.argv[1]
  }
  try {
    const stats = fs.statSync(dir);
    if (stats.isDirectory()) {
      const filenames = fs.readdirSync(dir)
      const fullnames = filenames
        .filter(value => value.toLowerCase().endsWith('.npy'))
        .map(filename => join(dir, filename).replace(/\\/g, '/'))
      if (fullnames.length == 0) {
        return "enputy dir"
      }
      return { dir: dir, index: 0, fullnames: fullnames }
    } else {
      const forder_dir = path.dirname(dir)
      const basename = path.basename(dir)
      const filenames = fs.readdirSync(forder_dir)
        .filter(value => value.toLowerCase().endsWith('.npy'))
      const index = filenames.indexOf(basename)
      const fullnames = filenames
        .map(filename => join(forder_dir, filename).replace(/\\/g, '/'))
      return { dir: forder_dir, index: index, fullnames: fullnames }
    }
  } catch (err) {
    console.error(err);
  }

}
app.whenReady().then(() => {
  ipcMain.handle('set-dir', handleSetDir)
  createWindow()

  // win.webContents.postMessage('main-world-port', null, [port1])

})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})




app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
