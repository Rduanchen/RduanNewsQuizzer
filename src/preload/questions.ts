import { ipcRenderer } from 'electron';

interface ModelOption {
  id: string;
  name: string;
  displayName: string;
  category: 'GPT-5' | 'GPT-4.1';
}

interface ExamStyleOption {
  title: string;
  value: number;
  description: string;
}

interface ReasoningOption {
  title: string;
  value: string;
  description: string;
}

interface GenerateQuestionsOptions {
  article: string;
  amount?: number;
  style?: number;
  model?: string;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

const questionsAPI = {
  // 獲取新聞內容
  getNewsContent: async (newsUrl: string): Promise<ApiResponse> => {
    return await ipcRenderer.invoke('questions:get-news-content', newsUrl);
  },

  // 生成問題
  generate: async (options: GenerateQuestionsOptions): Promise<ApiResponse> => {
    return await ipcRenderer.invoke('questions:generate', options);
  },

  // 測試 OpenAI 連接
  testConnection: async (): Promise<ApiResponse> => {
    return await ipcRenderer.invoke('questions:test-openai-connection');
  },

  // 獲取可用的模型列表
  getAvailableModels: async (): Promise<ApiResponse<ModelOption[]>> => {
    return await ipcRenderer.invoke('questions:get-available-models');
  },

  // 獲取考試風格選項
  getExamStyles: async (): Promise<ApiResponse<ExamStyleOption[]>> => {
    return await ipcRenderer.invoke('questions:get-exam-styles');
  },

  // 獲取推理強度選項
  getReasoningOptions: async (): Promise<ApiResponse<ReasoningOption[]>> => {
    return await ipcRenderer.invoke('questions:get-reasoning-options');
  },

  // 根據分類獲取模型
  getModelsByCategory: async (
    category: 'GPT-5' | 'GPT-4.1'
  ): Promise<ApiResponse<ModelOption[]>> => {
    return await ipcRenderer.invoke('questions:get-models-by-category', category);
  },

  // 驗證模型是否支援
  validateModel: async (modelId: string): Promise<ApiResponse<{ supported: boolean }>> => {
    return await ipcRenderer.invoke('questions:validate-model', modelId);
  }
};

export default questionsAPI;
