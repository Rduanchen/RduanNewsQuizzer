import { LMStudioClient } from '@lmstudio/sdk';
import { storeManager } from '../store/controller';
import type { LMStudioSettings } from './settings/lmStudioSettings';
import { Reply, StatusCode, logInfo, logError } from '../error-handle/index';

export class LmStudioGenerator {
  private static client: LMStudioClient | null = null;

  // Get or initialize LMStudioClient
  private static getClient(): LMStudioClient {
    if (!LmStudioGenerator.client) {
      logInfo('Initializing LMStudioClient', 'LMStudioReplyGenerator');
      LmStudioGenerator.client = new LMStudioClient();
    }
    return LmStudioGenerator.client;
  }

  // Generate reply from the current model in settings
  public static async generateReply(prompt: string): Promise<Reply> {
    const settings = storeManager.getLMStudioSettings();
    let modelName: string = '';

    try {
      if (!settings) {
        logError('No LM Studio model setting found.', 'LMStudioReplyGenerator');
        return {
          statusCode: StatusCode.InvalidModelSetting,
          message: 'No LM Studio model setting found.',
          error: { details: 'Settings not found.' }
        };
      }
      const parsed: LMStudioSettings = JSON.parse(settings);
      modelName = parsed.model;
      if (!modelName) {
        logError('Model name is not set.', 'LMStudioReplyGenerator');
        return {
          statusCode: StatusCode.InvalidModelSetting,
          message: 'Model name is not set.',
          error: { details: 'Empty model name.' }
        };
      }
    } catch (error: any) {
      logError(
        `Failed to parse LM Studio settings: ${error?.message ?? error}`,
        'LMStudioReplyGenerator'
      );
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to parse LM Studio settings.',
        error
      };
    }

    try {
      const client = LmStudioGenerator.getClient();
      const model = await client.llm.model(modelName);
      const result = await model.respond(prompt);
      logInfo('Model response generated successfully.', 'LMStudioReplyGenerator');
      return {
        statusCode: StatusCode.OK,
        message: 'Model response generated successfully.',
        data: result.content ?? ''
      };
    } catch (error: any) {
      if (error?.title && error.title.includes('Model not found')) {
        logError(
          'Model not found. Please check your LM Studio model setting.',
          'LMStudioReplyGenerator'
        );
        return {
          statusCode: StatusCode.ModelNotFound,
          message: 'Model not found. Please check your LM Studio model setting.',
          error
        };
      } else {
        logError('LM Studio service is not available.', 'LMStudioReplyGenerator');
        return {
          statusCode: StatusCode.LMStudioNotWorking,
          message: 'LM Studio service is not available. Please make sure LM Studio is running.',
          error
        };
      }
    }
  }

  public static async getAvailableModels(): Promise<string[]> {
    const client = LmStudioGenerator.getClient();
    const llmOnly = await client.llm.listLoaded();
    let modelNames: string[] = [];
    llmOnly.forEach((model) => {
      modelNames.push(model.modelKey as string);
    });
    logInfo(`Available LM Studio models: ${modelNames.join(', ')}`, 'LMStudioReplyGenerator');
    return modelNames;
  }

  public static async isServiceAvailable(): Promise<Reply> {
    try {
      await LmStudioGenerator.getAvailableModels();
      return {
        statusCode: StatusCode.OK,
        message: 'LM Studio service is available.',
        data: true
      };
    } catch (error) {
      logError(
        `Failed to check LM Studio service availability: ${error}`,
        'LMStudioReplyGenerator'
      );
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to check LM Studio service availability.',
        data: false,
        error
      };
    }
  }

  public static async verifyModelName(modelName: string): Promise<Reply> {
    try {
      const client = LmStudioGenerator.getClient();
      const model = await client.llm.model(modelName);
      await model.respond('Please reply true');
      return {
        statusCode: StatusCode.OK,
        message: 'Model verification successful.',
        data: true
      };
    } catch (error) {
      logError(
        `Failed to verify model name: ${
          typeof error === 'object' && error !== null && 'title' in error
            ? (error as any).title
            : error
        }`,
        'LMStudioReplyGenerator'
      );
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to verify model name.',
        data: false,
        error
      };
    }
  }
}
