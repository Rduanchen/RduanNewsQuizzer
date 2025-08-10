import { ipcMain } from 'electron';
import { crawler, getNewsContent } from '../news-sources/bbc_clawer/';
import { openAIService, GenerateQuestionsOptions } from '../question-generator/openai';

class QuestionsManager {
  public setup() {
    // 獲取新聞內容
    ipcMain.handle('questions:get-news-content', async (_event, newsUrl: string) => {
      try {
        const body = await crawler(newsUrl);
        const content = await getNewsContent(body);
        return { success: true, data: content };
      } catch (error) {
        console.error('Failed to get news content:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '無法獲取新聞內容'
        };
      }
    });

    // 生成問題
    ipcMain.handle('questions:generate', async (_event, options: GenerateQuestionsOptions) => {
      try {
        const questions = await openAIService.generateQuestions(options);
        return { success: true, data: questions };
      } catch (error) {
        console.error('Failed to generate questions:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '生成問題時發生未知錯誤'
        };
      }
    });

    // 測試 OpenAI 連接
    ipcMain.handle('questions:test-openai-connection', async () => {
      try {
        const isConnected = await openAIService.testConnection();
        return { success: true, data: { connected: isConnected } };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '測試連接失敗'
        };
      }
    });

    // 獲取可用的模型列表
    ipcMain.handle('questions:get-available-models', () => {
      try {
        const models = openAIService.getAvailableModels();
        return { success: true, data: models };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '獲取模型列表失敗'
        };
      }
    });

    // 獲取考試風格選項
    ipcMain.handle('questions:get-exam-styles', () => {
      try {
        const styles = openAIService.getExamStyles();
        return { success: true, data: styles };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '獲取考試風格失敗'
        };
      }
    });

    // 獲取推理強度選項
    ipcMain.handle('questions:get-reasoning-options', () => {
      try {
        const options = openAIService.getReasoningOptions();
        return { success: true, data: options };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '獲取推理強度選項失敗'
        };
      }
    });

    // 根據分類獲取模型
    ipcMain.handle('questions:get-models-by-category', (_event, category: 'GPT-5' | 'GPT-4.1') => {
      try {
        const models = openAIService.getModelsByCategory(category);
        return { success: true, data: models };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '獲取分類模型失敗'
        };
      }
    });

    // 驗證模型是否支援
    ipcMain.handle('questions:validate-model', (_event, modelId: string) => {
      try {
        const isSupported = openAIService.isModelSupported(modelId);
        return { success: true, data: { supported: isSupported } };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '驗證模型失敗'
        };
      }
    });
  }
}

export const questionsManager = new QuestionsManager();
