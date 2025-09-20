import { ipcMain } from 'electron';
import { QuestionSettingsManager } from './settings/questionSettings';
import { ExamStyle, GenerateSettings } from './settings/settingsModel';
import { LMStudioSettings } from './settings/lmStudioSettings';
import { LmStudioGenerator } from './generator/LMStudio';
import { LmStudioSettings } from './settings/lmStudioSettings';
import { OpenAISettingsManager, OpenAISettings } from './settings/openAISettings';
import { OpenAIService, MessagePayload } from './generator/OpenAI';
import { StatusCode, Reply, logInfo } from '../error-handle/index';
import { storeManager } from '../store/controller';
import { buildPrompt, PromptOptions } from './generator/promptLibrary';

function log(message: string) {
  logInfo('QuestionsManager', message);
}

const MAX_TRY_TIMES = 2;

export const LLMSources = ['OpenAI', 'LMStudio'];
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
    ipcMain.handle('settings:verify-is-setting-ready', async () => {
      const llmOptionReply = this.getCurrentLLMOption();
      if (llmOptionReply.statusCode !== StatusCode.OK) {
        return {
          statusCode: llmOptionReply.statusCode,
          message: llmOptionReply.message,
          data: false
        } as Reply;
      }
      const llmOption = llmOptionReply.data as LLMOption;
      if (llmOption.source === 'OpenAI') {
        const verifyResult = await this.openAI.init();
        if (verifyResult.statusCode !== StatusCode.OK) {
          return {
            statusCode: verifyResult.statusCode,
            message: 'OpenAI settings are not properly configured',
            data: false,
            error: verifyResult.error
          } as Reply;
        } else {
          return {
            statusCode: StatusCode.OK,
            message: 'OpenAI settings are properly configured',
            data: true
          } as Reply;
        }
      } else if (llmOption.source === 'LMStudio') {
        if (!(await LmStudioGenerator.isServiceAvailable()).data) {
          return {
            statusCode: StatusCode.InternalError,
            message: 'LM Studio service is unavailable',
            data: false,
            error: new Error('LM Studio service is unavailable')
          } as Reply;
        } else {
          return {
            statusCode: StatusCode.OK,
            message: 'LM Studio settings are properly configured',
            data: true
          } as Reply;
        }
      }
      return {
        statusCode: StatusCode.InvalidModelSetting,
        message: 'No valid LLM source selected',
        data: false,
        error: new Error('No valid LLM source selected')
      } as Reply;
    });
    ipcMain.handle('questions:generate-questions', async (_event, article: string) => {
      const llmOptionReply = this.getCurrentLLMOption();
      if (llmOptionReply.statusCode !== StatusCode.OK) {
        return {
          statusCode: llmOptionReply.statusCode,
          message: llmOptionReply.message,
          data: false
        } as Reply;
      }
      const llmOption = llmOptionReply.data as LLMOption;
      if (llmOption.source === 'LMStudio') {
        let tryTimes = 0;
        for (let i = 0; i < MAX_TRY_TIMES; i++) {
          const prompt = this.buildQuestionPrompt(article);

          const reply = await LmStudioGenerator.generateReply(prompt);
          try {
            reply.data = JSON.parse(reply.data as string);
            if (Array.isArray(reply.data)) {
              return reply;
            } else {
              tryTimes += 1;
            }
          } catch (e) {
            tryTimes += 1;
          }
        }
        return {
          statusCode: StatusCode.InternalError,
          message: `Failed to parse model response after ${tryTimes} attempts.`,
          data: null,
          error: new Error('Failed to parse model response.')
        } as Reply;
      } else if (llmOption.source === 'OpenAI') {
        let tryTimes = 0;
        for (let i = 0; i < MAX_TRY_TIMES; i++) {
          const payload = this.buildOpenAIPrompt(article);
          log('Payload to OpenAI:' + JSON.stringify(payload));
          const reply = await this.openAI.generateContext(payload);
          try {
            reply.data = JSON.parse(reply.data as string);
            if (Array.isArray(reply.data)) {
              return {
                statusCode: StatusCode.OK,
                message: 'Questions generated successfully',
                data: reply.data
              };
            } else {
              tryTimes += 1;
            }
          } catch (e) {
            tryTimes += 1;
          }
        }
        return {
          statusCode: StatusCode.InternalError,
          message: `Failed to parse model response after ${tryTimes} attempts.`,
          data: null,
          error: new Error('Failed to parse model response.')
        } as Reply;
      }
      return {
        statusCode: StatusCode.InvalidModelSetting,
        message: 'No valid LLM source selected',
        data: false,
        error: new Error('No valid LLM source selected')
      } as Reply;
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
      return this.setCurrentLLMOption({ source: LLMSources[0] });
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
  public buildQuestionPrompt(article: string): string {
    const settings = QuestionSettingsManager.getCurrentQuestionSettings().data as GenerateSettings;
    const promptOptions: PromptOptions = {
      article: article,
      amount: settings.questionAmount,
      style: settings.testStyle as ExamStyle,
      questionStyles: settings.questionStyle
    };
    return buildPrompt(promptOptions);
  }
  public buildOpenAIPrompt(article: string): MessagePayload {
    let settings = OpenAISettingsManager.getCurrentOpenAISettings().data as OpenAISettings;
    const promptPayload = {
      prompt: this.buildQuestionPrompt(article),
      model: settings.model,
      effort: settings.reasoningEffort
    } as MessagePayload;
    return promptPayload;
  }
}
