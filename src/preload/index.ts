import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { ipcRenderer } from 'electron';
import newsAPI from './news';
import settingsAPI from './settings';
import questionsAPI from './questions';

const testAPI = {
  test: async () => {
    return await ipcRenderer.invoke('test');
  }
};

// Custom APIs for renderer
const api = {
  settings: settingsAPI,
  questions: questionsAPI,
  news: newsAPI,
  test: testAPI
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error('Failed to expose APIs to main world:', error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
