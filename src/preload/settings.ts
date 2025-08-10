import { ipcRenderer } from 'electron';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

const settingsAPI = {
  // API Key 管理
  getApiKey: async (): Promise<string> => {
    return await ipcRenderer.invoke('settings:get-api-key');
  },

  setApiKey: async (apiKey: string): Promise<ApiResponse> => {
    return await ipcRenderer.invoke('settings:set-api-key', apiKey);
  },

  // 問題生成設定
  getQuestionSettings: async (): Promise<any> => {
    return await ipcRenderer.invoke('settings:get-question-settings');
  },

  setQuestionSettings: async (settings: any): Promise<ApiResponse> => {
    return await ipcRenderer.invoke('settings:set-question-settings', settings);
  },

  // 使用者偏好
  getUserPreferences: async (): Promise<any> => {
    return await ipcRenderer.invoke('settings:get-user-preferences');
  },

  setUserPreferences: async (preferences: any): Promise<ApiResponse> => {
    return await ipcRenderer.invoke('settings:set-user-preferences', preferences);
  }
};

export default settingsAPI;
