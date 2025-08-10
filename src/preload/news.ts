import { ipcRenderer } from 'electron';

interface NewsItem {
  coverUrl: string | null;
  title: string;
  description: string;
  newsLink: string;
}

const newsAPI = {
  // 獲取新聞來源列表
  getSources: async (): Promise<string[]> => {
    return await ipcRenderer.invoke('news-sources:get');
  },

  // 選擇新聞來源
  selectSource: async (sourceIndex: number): Promise<void> => {
    return await ipcRenderer.invoke('news-sources:select', sourceIndex);
  },

  // 獲取新聞標題列表
  getHeadlines: async (): Promise<NewsItem[]> => {
    return await ipcRenderer.invoke('news-sources:getHeadlines');
  },

  // 打開外部連結
  openExternalUrl: async (url: string): Promise<void> => {
    return await ipcRenderer.invoke('open-external-url', url);
  }
};

export default newsAPI;
