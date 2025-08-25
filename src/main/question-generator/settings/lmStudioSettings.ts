import { storeManager } from '../../store/controller';
import { Reply, StatusCode, logInfo, logError } from '../../error-handle/index';

export interface LMStudioSettings {
  model: string;
}

export class LmStudioSettings {
  public static readonly LMSTUDIO_SETTINGS_KEY = 'lmstudio-settings';

  /**
   * Save LM Studio settings into the store.
   */
  public static saveSettings(settings: LMStudioSettings): Reply {
    try {
      storeManager.setLMStudioSettings(JSON.stringify(settings));
      logInfo(`LM Studio settings saved: ${JSON.stringify(settings)}`, 'LmStudioSettings');
      return {
        statusCode: StatusCode.OK,
        message: 'LM Studio settings saved successfully.',
        data: settings
      };
    } catch (error: any) {
      logError(`Failed to save LM Studio settings: ${error?.message || error}`, 'LmStudioSettings');
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to save LM Studio settings.',
        error
      };
    }
  }

  /**
   * Get the current LM Studio settings from the store.
   * If not set, return an empty model.
   */
  public static getCurrentSettings(): Reply {
    const raw = storeManager.getLMStudioSettings();
    if (!raw) {
      logInfo('No LM Studio model setting found.', 'LmStudioSettings');
      return {
        statusCode: StatusCode.InvalidModelSetting,
        message: 'No LM Studio model setting found.',
        data: { model: '' }
      };
    }
    try {
      const parsed = JSON.parse(raw) as LMStudioSettings;
      logInfo(`Current LM Studio model setting: ${parsed.model}`, 'LmStudioSettings');
      return {
        statusCode: StatusCode.OK,
        message: 'Current LM Studio model setting fetched.',
        data: parsed
      };
    } catch (error: any) {
      logError('Failed to parse LM Studio settings.', 'LmStudioSettings');
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to parse LM Studio settings.',
        error,
        data: { model: '' }
      };
    }
  }
}
