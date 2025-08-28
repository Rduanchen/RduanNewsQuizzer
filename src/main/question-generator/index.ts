import { ipcMain } from 'electron';
import { QuestionSettingsManager } from './settings/questionSettings';
import { GenerateSettings } from './settings/settingsModel';
import { LMStudioSettings } from './settings/lmStudioSettings';
import { LmStudioGenerator } from './lmStudioGenerator';
import { LmStudioSettings } from './settings/lmStudioSettings';
import { OpenAISettingsManager, OpenAISettings } from './settings/openAISettings';
import { OpenAIService } from './openaiService';
import { StatusCode, Reply } from '../error-handle/index';
import { storeManager } from '../store/controller';

const LLMSources = ['OpenAI', 'LMStudio'];
interface LLMOption {
  source: string;
}

export default class QuestionsManager {
  private openAI = new OpenAIService();
  public setup() {
    // Question settings
    ipcMain.handle('settings:get-questions-settings', async () => {
      return QuestionSettingsManager.getQuestionOptions();
    });

    ipcMain.handle(
      'settings:update-questions-settings',
      async (_event, newSettings: GenerateSettings) => {
        return QuestionSettingsManager.setQuestionSettings(newSettings);
      }
    );

    ipcMain.handle('settings:get-current-questions-settings', async () => {
      return QuestionSettingsManager.getCurrentQuestionSettings();
    });

    // LM Studio Settings
    ipcMain.handle('settings:get-lm-studio-settings', async () => {
      return LmStudioSettings.getCurrentSettings();
    });

    ipcMain.handle(
      'settings:update-lm-studio-settings',
      async (_event, newSettings: LMStudioSettings) => {
        let result = await LmStudioGenerator.verifyModelName(newSettings.model);
        if (result.data == true) {
          return await LmStudioSettings.saveSettings(newSettings);
        } else {
          return result; // StatusCode.InternalError
        }
      }
    );

    ipcMain.handle('settings:verify-lm-studio-liveness', async () => {
      return LmStudioGenerator.isServiceAvailable();
    });

    // OpenAI Settings
    ipcMain.handle('settings:get-openai-settings', async () => {
      return OpenAISettingsManager.getCurrentOpenAISettings();
    });

    ipcMain.handle(
      'settings:update-openai-settings',
      async (_event, newSettings: OpenAISettings) => {
        // Verify OpenAI key before saving (endpoint property removed)
        console.log('Verifying OpenAI API key...');
        const verifyResult = await this.openAI.init(newSettings.apiKey);
        if (verifyResult.statusCode === 200) {
          // Save settings if verification succeeds
          return OpenAISettingsManager.setOpenAISettings(newSettings);
        } else {
          // Return verification error
          return verifyResult;
        }
      }
    );

    ipcMain.handle('settings:get-openai-options', async () => {
      return OpenAISettingsManager.getOpenAIOptions();
    });

    ipcMain.handle('settings:get-llm-sources-options', async () => {
      return {
        statusCode: StatusCode.OK,
        message: 'Successfully retrieved sources options',
        data: LLMSources
      } as Reply;
    });

    ipcMain.handle('settings:get-current-llm-option', async () => {
      return this.getCurrentLLMOption();
    });
    ipcMain.handle('settings:set-current-llm-option', async (_event, option: LLMOption) => {
      return this.setCurrentLLMOption(option);
    });
  }
  public getCurrentLLMOption() {
    const settingString = storeManager.getLLMSettings();
    if (settingString && settingString !== '') {
      let values = JSON.parse(settingString);
      return {
        statusCode: StatusCode.OK,
        message: 'Successfully retrieved current LLM option',
        data: values
      };
    } else {
      this.setCurrentLLMOption({ source: LLMSources[0] });
    }
  }
  public setCurrentLLMOption(option: LLMOption) {
    const settingString = JSON.stringify(option);
    storeManager.setLLMSettings(settingString);
    return {
      statusCode: StatusCode.OK,
      message: 'Successfully set current LLM option',
      data: option
    };
  }
}
