interface NewsItem {
  coverUrl: string | null;
  title: string;
  description: string;
  newsLink: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface NewsAPI {
  getSources: () => Promise<string[]>;
  selectSource: (sourceIndex: number) => Promise<ApiResponse>;
  getHeadlines: () => Promise<ApiResponse<NewsItem[]>>;
  openExternalUrl: (url: string) => Promise<void>;
  getNewsContentBySource: (
    sourceIndex: number,
    newsUrl: string
  ) => Promise<ApiResponse<NewsContent>>;
  getCustomArticleContent: (customArticle: string) => Promise<ApiResponse<NewsContent>>;
}

interface SettingsAPI {
  getApiKey: () => Promise<string>;
  setApiKey: (apiKey: string) => Promise<ApiResponse>;
  getQuestionSettings: () => Promise<any>;
  setQuestionSettings: (settings: any) => Promise<ApiResponse>;
  getUserPreferences: () => Promise<any>;
  setUserPreferences: (preferences: any) => Promise<ApiResponse>;
}

// interface QuestionsAPI {
//   getNewsContent: (newsUrl: string) => Promise<ApiResponse>;
//   generate: (options: any) => Promise<ApiResponse>;
//   testConnection: () => Promise<ApiResponse>;
// }

interface TestAPI {
  test: () => Promise<any>;
}

interface API {
  settings: SettingsAPI;
  questions: QuestionsAPI;
  news: NewsAPI;
  test: TestAPI;
}

declare global {
  interface Window {
    electron: any;
    api: API;
  }
}
interface ModelOption {
  id: string;
  name: string;
  displayName: string;
  category: 'GPT-5' | 'GPT-4.1';
}

interface QuestionsAPI {
  getNewsContent: (newsUrl: string) => Promise<ApiResponse>;
  generate: (options: any) => Promise<ApiResponse>;
  testConnection: () => Promise<ApiResponse>;
  getAvailableModels: () => Promise<ApiResponse<ModelOption[]>>;
  getModelsByCategory: (category: 'GPT-5' | 'GPT-4.1') => Promise<ApiResponse<ModelOption[]>>;
  validateModel: (modelId: string) => Promise<ApiResponse<{ supported: boolean }>>;
}
export {};
