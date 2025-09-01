import { OpenAI } from 'openai';
import { storeManager } from '../store/controller';
import { Reply, StatusCode, logInfo, logError } from '../error-handle/index';

export interface MessagePayload {
  prompt: any;
  model?: string;
  effort?: 'low' | 'medium' | 'high';
}

const DEFAULT_MODEL = 'gpt-5-nano';
const DEFAULT_EFFORT = 'low';

export class OpenAIService {
  private openai!: OpenAI;
  private apiKey: string = '';
  public modelList: string[] = [];

  /**
   * Initializes the OpenAI service
   * @param key - The API key for OpenAI (optional)
   */
  public async init(key?: string): Promise<Reply> {
    this.apiKey = key ?? storeManager.getApiKey();

    // Prepare config for OpenAI SDK
    const openaiConfig: any = {
      apiKey: this.apiKey,
      dangerouslyAllowBrowser: false
    };

    try {
      this.openai = new OpenAI(openaiConfig);

      const connectionOk = await this.connectionTest();
      if (connectionOk) {
        await this.getAvailableModels();
        logInfo('OpenAI service initialized successfully', 'OpenAIService');
        return {
          statusCode: StatusCode.OK,
          message: 'OpenAI service initialized successfully',
          data: true
        };
      } else {
        logError('Failed to initialize OpenAI service', 'OpenAIService');
        return {
          statusCode: StatusCode.InvalidKey,
          message: 'Failed to initialize OpenAI service: invalid API key',
          data: false,
          error: { details: 'Connection test failed' }
        };
      }
    } catch (err: any) {
      logError(`Exception during initialization: ${err?.message ?? err}`, 'OpenAIService');
      return {
        statusCode: StatusCode.InternalError,
        message: 'Exception during OpenAI service initialization',
        data: false,
        error: err
      };
    }
  }

  /**
   * Tests the connection by making a simple request
   * Returns true if the API key is valid, false otherwise
   */
  public async connectionTest(): Promise<boolean> {
    try {
      await this.openai.models.list();
      logInfo('OpenAI connection test succeeded', 'OpenAIService');
      return true;
    } catch (err: any) {
      logError(`OpenAI connection test failed: ${err?.message ?? err}`, 'OpenAIService');
      return false;
    }
  }

  /**
   * Returns the list of available models
   */
  public async getAvailableModels(): Promise<Reply> {
    try {
      const response = await this.openai.models.list();
      this.modelList = response.data.map((model) => model.id);
      logInfo(`Fetched available models: ${this.modelList.join(', ')}`, 'OpenAIService');
      return {
        statusCode: StatusCode.OK,
        message: 'Model list fetched successfully',
        data: this.modelList
      };
    } catch (err: any) {
      logError(`Failed to fetch available models: ${err?.message ?? err}`, 'OpenAIService');
      return {
        statusCode: StatusCode.InternetError,
        message: 'Failed to fetch available models',
        data: [],
        error: err
      };
    }
  }

  /**
   * Generates context using the AI service and returns the text response
   * Adds 'effort' argument for OpenAI service if provided
   */
  public async generateContext(payload: MessagePayload): Promise<Reply> {
    try {
      const params: any = {
        model: payload.model ?? DEFAULT_MODEL,
        messages: [{ role: 'user', content: payload.prompt }]
      };
      if (payload.effort) {
        params.reasoning = { effort: payload.effort ?? DEFAULT_EFFORT };
      }
      const response = await this.openai.chat.completions.create(params);
      const replyText = response.choices?.[0]?.message?.content ?? '';
      logInfo('OpenAI response generated successfully', 'OpenAIService');
      return {
        statusCode: StatusCode.OK,
        message: 'Response generated successfully',
        data: replyText
      };
    } catch (err: any) {
      logError(`Error generating context: ${err?.message ?? err}`, 'OpenAIService');
      let statusCode = StatusCode.InternalError;
      let message = 'Error generating context';
      if (err?.message?.includes('Model not found')) {
        statusCode = StatusCode.ModelNotFound;
        message = 'Model not found';
      } else if (err?.message?.includes('network')) {
        statusCode = StatusCode.InternetError;
        message = 'Network error during context generation';
      }
      return {
        statusCode,
        message,
        error: err
      };
    }
  }
}
