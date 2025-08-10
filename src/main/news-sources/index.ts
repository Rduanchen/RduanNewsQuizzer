import { ipcMain } from 'electron';
import { getBBCNewsTitles } from './bbc_clawer/';

class NewsSourceManager {
  private NEWS_SOURCES = ['BBC NEWS'];
  private selectedSource = 0;

  public setup() {
    ipcMain.handle('news-sources:get', () => {
      return this.NEWS_SOURCES;
    });

    ipcMain.handle('news-sources:select', (_event, source_index: number) => {
      if (source_index >= 0 && source_index < this.NEWS_SOURCES.length) {
        this.selectedSource = source_index;
        return { success: true };
      }
      return { success: false, error: '無效的新聞來源索引' };
    });

    ipcMain.handle('news-sources:getHeadlines', async () => {
      try {
        switch (this.selectedSource) {
          case 0:
            const headlines = await getBBCNewsTitles();
            return { success: true, data: headlines };
          default:
            return { success: true, data: [] };
        }
      } catch (error) {
        console.error('Failed to get headlines:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '無法獲取新聞標題'
        };
      }
    });
  }

  public getSelectedSource(): number {
    return this.selectedSource;
  }

  public getNewsSources(): string[] {
    return [...this.NEWS_SOURCES];
  }
}

export const newsSourceManager = new NewsSourceManager();
