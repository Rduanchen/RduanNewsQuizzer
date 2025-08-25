import { ipcMain, shell } from 'electron';
import BBC from './plugins/bbc_clawer';
import SelfDefine from './plugins/self-define';
import SourcePlugins from './pluginsPrototype';

interface NewsSource {
  name: string;
  index: number;
}

class NewsSourceManager {
  private NEWS_SOURCES: NewsSource[] = [];
  private selectedSource = 0;
  private plugins: SourcePlugins[] = [];

  public async setup() {
    await this.getPlugins().then((plugins) => {
      this.plugins = plugins;
      this.NEWS_SOURCES = this.getPluginSourceNames();
    });
    // 取得新聞來源列表
    ipcMain.handle('news-sources:get', () => {
      let names: string[] = [];
      this.NEWS_SOURCES.forEach((source) => {
        names.push(source.name);
      });
      return names;
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
        const source = this.plugins[this.selectedSource];
        if (!source) {
          return { success: false, error: '無效的新聞來源' };
        }
        const titles = await source.getNewsTitles();
        return { success: true, data: titles };
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

          const source = this.plugins[sourceIndex];
          if (!source) {
            return { success: false, error: '無效的新聞來源' };
          }

          const content = await source.getNewsContent(newsUrl);
          return { success: true, data: content };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : '爬取新聞內容失敗'
          };
        }
      }
    );

    // 打開外部網址
    ipcMain.handle('open-external-url', (_event, url: string) => {
      if (url && typeof url === 'string') {
        shell.openExternal(url);
      }
      return;
    });
  }

  public async getPlugins(): Promise<SourcePlugins[]> {
    const pluginClasses = [BBC, SelfDefine];
    const instances = pluginClasses.map((PluginClass) => new PluginClass());
    instances.forEach((instance) => {
      instance.setup();
    });
    return instances;
  }

  public getPluginSourceNames(): NewsSource[] {
    let names: NewsSource[] = [];
    this.plugins.forEach((plugin, index) => {
      names.push({ name: plugin.getSourceName(), index });
    });
    return names;
  }

  public getNewsSources(): NewsSource[] {
    return [...this.NEWS_SOURCES];
  }
}

export const newsSourceManager = new NewsSourceManager();
