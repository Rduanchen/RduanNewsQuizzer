import { ipcMain, shell } from 'electron';
import BBC from './plugins/bbc_clawer/index';
import SourcePlugins from './pluginsPrototype';
import { PromptFormat, NewsGenerator } from './plugins/news-generator';
import QuestionsManager from '../question-generator/index';

// Import error handling and reply
import { logInfo, logError, StatusCode, Reply } from '../error-handle/index';

interface NewsSource {
  name: string;
  index: number;
}

class NewsSourceManager {
  private NEWS_SOURCES: NewsSource[] = [];
  private selectedSource = 0;
  private plugins: SourcePlugins[] = [];
  private questionsManager = new QuestionsManager();

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
      logInfo(`Fetched news sources: ${names.join(', ')}`, 'NewsSourceManager');
      return {
        statusCode: StatusCode.OK,
        message: '新聞來源列表取得成功',
        data: names
      } as Reply;
    });

    // 選擇新聞來源
    ipcMain.handle('news-sources:select', (_event, source_index: number) => {
      if (source_index >= 0 && source_index < this.NEWS_SOURCES.length) {
        this.selectedSource = source_index;
        logInfo(`Selected news source index: ${source_index}`, 'NewsSourceManager');
        return {
          statusCode: StatusCode.OK,
          message: '新聞來源選擇成功',
          data: source_index
        } as Reply;
      }
      logError(`Invalid news source index: ${source_index}`, 'NewsSourceManager');
      return {
        statusCode: StatusCode.InvalidModelSetting,
        message: '無效的新聞來源索引',
        error: 'Invalid source index'
      } as Reply;
    });

    // 取得新聞標題清單
    ipcMain.handle('news-sources:getHeadlines', async () => {
      try {
        const source = this.plugins[this.selectedSource];
        if (!source) {
          logError('Invalid news source for headlines', 'NewsSourceManager');
          return {
            statusCode: StatusCode.ModelNotFound,
            message: '無效的新聞來源',
            error: 'Invalid news source'
          } as Reply;
        }
        const titles = await source.getNewsTitles();
        logInfo(`Fetched headlines for source ${this.selectedSource}`, 'NewsSourceManager');
        return {
          statusCode: StatusCode.OK,
          message: '新聞標題取得成功',
          data: titles
        } as Reply;
      } catch (error) {
        logError(
          `Failed to get headlines: ${error instanceof Error ? error.message : error}`,
          'NewsSourceManager'
        );
        return {
          statusCode: StatusCode.InternalError,
          message: '無法獲取新聞標題',
          error: error instanceof Error ? error.message : error
        } as Reply;
      }
    });

    // 根據來源與連結爬取新聞內容
    ipcMain.handle('news-sources:getNewsContent', async (_event, newsUrl: string) => {
      let sourceIndex = this.selectedSource;
      try {
        if (!newsUrl || typeof newsUrl !== 'string') {
          logError('Invalid news link', 'NewsSourceManager');
          return {
            statusCode: StatusCode.InvalidModelSetting,
            message: '無效的新聞連結',
            error: 'Invalid news URL'
          } as Reply;
        }

        const source = this.plugins[sourceIndex];
        if (!source) {
          logError('Invalid news source for content', 'NewsSourceManager');
          return {
            statusCode: StatusCode.ModelNotFound,
            message: '無效的新聞來源',
            error: 'Invalid news source'
          } as Reply;
        }

        const content = await source.getNewsContent(newsUrl);
        logInfo(`Fetched news content from source ${sourceIndex}`, 'NewsSourceManager');
        return {
          statusCode: StatusCode.OK,
          message: '新聞內容取得成功',
          data: content
        } as Reply;
      } catch (error) {
        logError(
          `Failed to crawl news content: ${error instanceof Error ? error.message : error}`,
          'NewsSourceManager'
        );
        return {
          statusCode: StatusCode.InternalError,
          message: '爬取新聞內容失敗',
          error: error instanceof Error ? error.message : error
        } as Reply;
      }
    });

    // 自動生成文章內容
    ipcMain.handle(
      'news-sources:generateArticleContent',
      async (_event, articleOptions: PromptFormat) => {
        const newsGenerator = new NewsGenerator();
        newsGenerator.updateSelectedGenerator(
          this.questionsManager.getCurrentLLMOption().data.source
        );
        const reply = await newsGenerator.generateNewsArticle(articleOptions);
        return reply;
      }
    );

    // 打開外部網址
    ipcMain.handle('open-external-url', (_event, url: string) => {
      if (url && typeof url === 'string') {
        shell.openExternal(url);
        logInfo(`Opened external URL: ${url}`, 'NewsSourceManager');
      }
      // This action doesn't need to return a Reply object
      return;
    });
  }

  public async getPlugins(): Promise<SourcePlugins[]> {
    const pluginClasses = [BBC];
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
