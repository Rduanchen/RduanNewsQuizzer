// import NewsSources from './news-sources';
import { ipcMain } from 'electron';
import { newsSourceManager } from './news-sources';
import questionsManager from './question-generator';

function setupAllIPC() {
  newsSourceManager.setup();
  const QuestionsManager = new questionsManager();
  QuestionsManager.setup();
  ipcMain.handle('test', () => {
    return 'Test response';
  });
}
export default setupAllIPC;
