import { ipcRenderer } from 'electron';
import { Reply } from '../main/error-handle/index';

const newsAPI = {
  // 獲取新聞來源列表
  getSources: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('news-sources:get');
  },

  // 選擇新聞來源
  selectSource: async (sourceIndex: number): Promise<Reply> => {
    return await ipcRenderer.invoke('news-sources:select', sourceIndex);
  },

  // 獲取新聞標題列表
  getHeadlines: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('news-sources:getHeadlines');
  },

  // 根據來源與連結爬取新聞內容
  getNewsContentBySource: async (sourceIndex: number, newsUrl: string): Promise<Reply> => {
    return await ipcRenderer.invoke('news-sources:getNewsContentBySource', sourceIndex, newsUrl);
  },

  // 自動生成文章內容
  generateArticleContent: async (articleOptions: any): Promise<Reply> => {
    return await ipcRenderer.invoke('news-sources:generateArticleContent', articleOptions);
  },

  // 取得自訂文章內容（其實前端直接送也可以）
  getCustomArticleContent: async (customArticle: string): Promise<Reply> => {
    return await ipcRenderer.invoke('news-sources:getCustomArticleContent', customArticle);
  },

  // 打開外部連結
  openExternalUrl: async (url: string): Promise<void> => {
    return await ipcRenderer.invoke('open-external-url', url);
  }
};

export default newsAPI;
