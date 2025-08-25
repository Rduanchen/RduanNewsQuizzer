import { storeManager } from '../../store/controller';
import { supportModels, reasoningEffort } from './settingsModel';

// Error handling and structured reply imports
import { Reply, StatusCode, logInfo, logError } from '../../error-handle/index';

const DEFAULT_OPENAI_SETTINGS: OpenAISettings = {
  apiKey: '',
  model: 'gpt-5-nano',
  reasoningEffort: 'low'
};

export interface OpenAISettings {
  apiKey: string;
  model: string;
  reasoningEffort: 'low' | 'medium' | 'high';
}

export class OpenAISettingsManager {
  public static readonly OPENAI_SETTINGS_KEY = 'openai-settings';

  /**
   * Save OpenAI settings into the store as a string
   */
  public static setOpenAISettings(settings: OpenAISettings): Reply {
    try {
      storeManager.setOpenAISettings(JSON.stringify(settings));
      logInfo('OpenAI settings saved.');
      return {
        statusCode: StatusCode.OK,
        message: 'OpenAI settings saved successfully.',
        data: settings
      };
    } catch (error: any) {
      logError(`Failed to save OpenAI settings: ${error?.message ?? error}`);
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to save OpenAI settings.',
        error
      };
    }
  }

  /**
   * Get options for supported models and reasoning effort
   */
  public static getOpenAIOptions(): Reply {
    logInfo('Fetched OpenAI model and reasoning effort options.');
    return {
      statusCode: StatusCode.OK,
      message: 'OpenAI model and reasoning options fetched.',
      data: {
        models: supportModels,
        reasoningEfforts: reasoningEffort
      }
    };
  }

  /**
   * Get the current OpenAI settings from the store,
   * If not set, return default settings.
   */
  public static getCurrentOpenAISettings(): Reply {
    const raw = storeManager.getOpenAISettings();
    if (!raw) {
      // If missing, set and return defaults
      logInfo('No OpenAI settings found, using default.');
      OpenAISettingsManager.setOpenAISettings(DEFAULT_OPENAI_SETTINGS);
      return {
        statusCode: StatusCode.OK,
        message: 'No OpenAI settings found. Default settings applied.',
        data: DEFAULT_OPENAI_SETTINGS
      };
    }
    try {
      const parsed = JSON.parse(raw) as OpenAISettings;
      logInfo('Fetched current OpenAI settings.');
      return {
        statusCode: StatusCode.OK,
        message: 'Current OpenAI settings fetched.',
        data: parsed
      };
    } catch (error: any) {
      logError(`Failed to parse OpenAI settings: ${error?.message ?? error}`);
      OpenAISettingsManager.setOpenAISettings(DEFAULT_OPENAI_SETTINGS);
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to parse OpenAI settings, default settings applied.',
        error,
        data: DEFAULT_OPENAI_SETTINGS
      };
    }
  }
}
