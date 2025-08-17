import { ipcMain } from 'electron';
import { storeManager, QuestionSettings } from './controller';

class SettingsManager {
  public setup() {
    // API Key 管理
    ipcMain.handle('settings:get-api-key', () => {
      try {
        const apiKey = storeManager.getApiKey();
        return apiKey; // 直接回傳字串，不要包在物件中
      } catch (error) {
        console.error('Get API key error:', error);
        return '';
      }
    });

    ipcMain.handle('settings:set-api-key', (_event, apiKey: string) => {
      try {
        storeManager.setApiKey(apiKey);
        return { success: true }; // 回傳簡單物件
      } catch (error) {
        console.error('Set API key error:', error);
        return {
          success: false,
          error:
            typeof error === 'object' && error !== null && 'message' in error
              ? (error as any).message
              : String(error)
        };
      }
    });

    // 問題生成設定管理
    ipcMain.handle('settings:get-question-settings', () => {
      try {
        const settings = storeManager.getQuestionSettings();
        return settings; // 直接回傳設定物件
      } catch (error) {
        console.error('Get question settings error:', error);
        return {
          amount: 5,
          style: 0,
          model: 'gpt-5-mini',
          reasoningEffort: 'low'
        };
      }
    });

    ipcMain.handle('settings:set-question-settings', (_event, settings: QuestionSettings) => {
      try {
        // 確保 settings 是可序列化的物件
        const cleanSettings = {
          amount: Number(settings.amount) || 5,
          style: Number(settings.style) || 0,
          model: String(settings.model) || 'gpt-5-mini',
          reasoningEffort: String(settings.reasoningEffort) || 'low'
        } as QuestionSettings;

        storeManager.setQuestionSettings(cleanSettings);
        return { success: true };
      } catch (error) {
        console.error('Set question settings error:', error);
        return {
          success: false,
          error:
            typeof error === 'object' && error !== null && 'message' in error
              ? (error as any).message
              : String(error)
        };
      }
    });
  }
}

export const settingsManager = new SettingsManager();
