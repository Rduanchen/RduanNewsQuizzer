import { ipcMain, shell } from 'electron';
import { getBBCNewsTitles, getBBCNewsContent } from './bbc_clawer/';

// 新聞內容格式
export interface NewsContent {
  coverUrl: string | null;
  title: string;
  description: string;
  newsLink: string;
  content: string;
  author?: string;
  date?: string;
}

class NewsSourceManager {
  private NEWS_SOURCES = ['BBC NEWS'];
  private selectedSource = 0;

  public setup() {
    // 取得新聞來源列表
    ipcMain.handle('news-sources:get', () => {
      return this.NEWS_SOURCES;
    });

    // 選擇新聞來源
    ipcMain.handle('news-sources:select', (_event, source_index: number) => {
      if (source_index >= 0 && source_index < this.NEWS_SOURCES.length) {
        this.selectedSource = source_index;
        return { success: true };
      }
      return { success: false, error: '無效的新聞來源索引' };
    });

    // 取得新聞標題清單
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

    // 新增：根據來源與連結爬取新聞內容
    ipcMain.handle(
      'news-sources:getNewsContentBySource',
      async (_event, sourceIndex: number, newsUrl: string) => {
        try {
          if (!newsUrl || typeof newsUrl !== 'string') {
            return { success: false, error: '無效的新聞連結' };
          }

          switch (sourceIndex) {
            case 0: // BBC
              const newsContent = await getBBCNewsContent(newsUrl); // 你需要根據連結爬 BBC 內容
              // 預期 getBBCNewsContent 回傳 NewsContent 格式
              return { success: true, data: newsContent };
            default:
              return { success: false, error: '目前僅支援 BBC' };
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : '爬取新聞內容失敗'
          };
        }
      }
    );

    // 新增：允許自訂文章（可以直接 return，或記錄到 localStorage/db 以利分析）
    ipcMain.handle('news-sources:getCustomArticleContent', (_event, customArticle: string) => {
      if (
        !customArticle ||
        typeof customArticle !== 'string' ||
        customArticle.trim().length === 0
      ) {
        return { success: false, error: '文章內容不可為空' };
      }
      // 前端直接傳遞自訂內容即可
      return {
        success: true,
        data: {
          coverUrl: null,
          title: '自訂文章',
          description: customArticle.substring(0, 50) + '...',
          newsLink: '',
          content: customArticle,
          author: '',
          date: ''
        }
      };
    });

    // 打開外部網址
    ipcMain.handle('open-external-url', (_event, url: string) => {
      if (url && typeof url === 'string') {
        shell.openExternal(url);
      }
      return;
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
