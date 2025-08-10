// import NewsSources from './news-sources';
import { ipcMain, shell } from 'electron';
import { newsSourceManager } from './news-sources';

import { settingsManager } from './store';
import { questionsManager } from './question-generator';

function setupAllIPC() {
  newsSourceManager.setup();
  settingsManager.setup();
  questionsManager.setup();
  ipcMain.handle('test', () => {
    return 'Test response';
  });
  ipcMain.handle('open-external-url', async (_event, url: string) => {
    try {
      await shell.openExternal(url);
    } catch (error) {
      console.error('Failed to open external URL:', error);
    }
  });
}
export default setupAllIPC;
