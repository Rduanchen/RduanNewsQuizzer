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
  questions: questionsAPI, // 修正命名一致性
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
    console.log('API exposed:', api);

    // 移除重複的 test API，因為已經在 api 中包含了
    // contextBridge.exposeInMainWorld('test', {
    //   test: async () => {
    //     return await ipcRenderer.invoke('test');
    //   }
    // });
  } catch (error) {
    console.error('Failed to expose APIs to main world:', error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
