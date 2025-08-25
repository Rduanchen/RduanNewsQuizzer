import { storeManager } from '../../store/controller';
import { TestStyle, SupportedQuestionsStyle, type GenerateSettings } from './settingsModel';
import { Reply, StatusCode, logInfo, logError } from '../../error-handle/index';

const DEFAULT_SETTINGS: GenerateSettings = {
  questionAmount: 10,
  questionStyle: [0], // default to the first style
  testStyle: 'ALL'
};

export class QuestionSettingsManager {
  public static readonly QUESTION_SETTINGS_KEY = 'question-generation-settings';

  /**
   * Save question generation settings into the store
   */
  public static setQuestionSettings(settings: GenerateSettings): Reply {
    try {
      storeManager.setQuestionSettings(JSON.stringify(settings));
      logInfo('Question settings saved.');
      return {
        statusCode: StatusCode.OK,
        message: 'Question settings saved successfully.',
        data: settings
      };
    } catch (error: any) {
      logError(`Failed to save question settings: ${error?.message ?? error}`);
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to save question settings.',
        error
      };
    }
  }

  /**
   * Get available test and question style options
   */
  public static getQuestionOptions(): Reply {
    logInfo('Fetched question style and test style options.');
    return {
      statusCode: StatusCode.OK,
      message: 'Question style and test style options fetched.',
      data: {
        testStyles: TestStyle,
        questionStyles: SupportedQuestionsStyle
      }
    };
  }

  /**
   * Get the current question generation settings from the store,
   * If not set, return default settings.
   */
  public static getCurrentQuestionSettings(): Reply {
    const raw = storeManager.getQuestionSettings();
    if (!raw) {
      logInfo('No question settings found, using default.');
      QuestionSettingsManager.setQuestionSettings(DEFAULT_SETTINGS);
      return {
        statusCode: StatusCode.OK,
        message: 'No question settings found. Default settings applied.',
        data: DEFAULT_SETTINGS
      };
    }
    try {
      const parsed = JSON.parse(raw) as GenerateSettings;
      logInfo('Fetched current question settings.');
      return {
        statusCode: StatusCode.OK,
        message: 'Current question settings fetched.',
        data: parsed
      };
    } catch (error: any) {
      logError(`Failed to parse question settings: ${error?.message ?? error}`);
      QuestionSettingsManager.setQuestionSettings(DEFAULT_SETTINGS);
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to parse question settings, default settings applied.',
        error,
        data: DEFAULT_SETTINGS
      };
    }
  }
}
