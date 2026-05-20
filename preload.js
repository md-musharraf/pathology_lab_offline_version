const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  printPdf: (pdfData) => ipcRenderer.invoke('print-pdf', pdfData),
  // DB Methods via IPC
  dbQuery: (args) => ipcRenderer.invoke('db-query', args),
});
