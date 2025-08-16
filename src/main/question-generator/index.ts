import { ipcMain } from 'electron';
import { crawler, getNewsContent } from '../news-sources/bbc_clawer/';
import { openAIService, GenerateQuestionsOptions } from '../question-generator/openai';

// for testing
const Mock = {
  success: true,
  data: {
    questions: [
      {
        question:
          'What was the general expectation for the Alaska summit between Trump and Putin according to the article?',
        options: [
          'A complete end to the Ukraine war',
          'A vital step toward peace in Ukraine with a concrete ceasefire',
          'A mutual alliance against Western nations',
          'A focus on domestic US policy only'
        ],
        answer: 1
      },
      {
        question:
          "Which of the following statements best describes Putin's reception in US media and politics before the summit?",
        options: [
          'He was widely celebrated as a democratic partner in the West',
          'He had been a pariah in the eyes of the West due to Ukraine invasion',
          'He had never traveled outside Russia before',
          'He was invited solely as a guest with no political implications'
        ],
        answer: 1
      },
      {
        question: 'What notable moment occurred as Putin left the Alaska airbase?',
        options: [
          'He drove his own Moscow-plated presidential state car',
          "He accepted a lift in Trump's armoured limousine",
          'He walked back to Russia on foot',
          'He refused a ride and took a commercial flight'
        ],
        answer: 1
      },
      {
        question:
          'According to the article, what did Putin emphasize about the Ukraine situation during his remarks?',
        options: [
          'An immediate ceasefire with no conditions',
          'That an unspecified agreement had been reached and the root causes must be eliminated',
          'That Ukraine must immediately surrender territory',
          'That Russia would withdraw all forces from border areas'
        ],
        answer: 1
      },
      {
        question: 'What did Trump say about the outcome of the meeting and its details?',
        options: [
          'He announced a concrete ceasefire and a trilateral meeting with Zelensky',
          'He claimed there were many points of agreement but provided few details',
          'He declared full withdrawal of Russian forces from Ukraine',
          'He stated that the US would impose severe consequences immediately'
        ],
        answer: 1
      }
    ]
  }
};

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
        console.log('Generating questions with options:', options);
        const questions = await openAIService.generateQuestions(options);
        return { success: true, data: questions };
        // return Mock;
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
