const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let loadURL;
if (!isDev) {
  const serve = require('electron-serve');
  loadURL = serve({ directory: 'out' });
}

let mainWindow;
let prisma;

// Initialize Prisma with proper database path
function initPrisma() {
  try {
    const { PrismaClient } = require('@prisma/client');
    
    // In production, the database will be in the app's userData directory
    // In dev, it uses the default prisma/dev.db
    if (isDev) {
      prisma = new PrismaClient();
    } else {
      const dbPath = path.join(app.getPath('userData'), 'dev.db');
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: `file:${dbPath}`,
          },
        },
      });
    }
    console.log('Prisma Client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    loadURL(mainWindow);
  }

  // Log any renderer errors to the console for debugging
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  initPrisma();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Cleanup Prisma on app quit
app.on('before-quit', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

// IPC Handlers
ipcMain.handle('ping', () => 'pong');

ipcMain.handle('print-pdf', async (event, pdfData) => {
  // Logic to print PDF invisibly or show dialog
  return true;
});

// Database IPC Handlers
ipcMain.handle('db-query', async (event, { model, action, args }) => {
  try {
    if (!prisma) {
      throw new Error('Prisma Client is not initialized. Database is unavailable.');
    }
    if (!prisma[model] || !prisma[model][action]) {
      throw new Error(`Invalid Prisma model or action: ${model}.${action}`);
    }
    const result = await prisma[model][action](args || {});
    return { success: true, data: result };
  } catch (error) {
    console.error(`DB Error (${model}.${action}):`, error);
    return { success: false, error: error.message };
  }
});
