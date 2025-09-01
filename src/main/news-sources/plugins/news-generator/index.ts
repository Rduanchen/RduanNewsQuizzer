import { OpenAIService, type MessagePayload } from '../../../question-generator/openaiService';
import { LmStudioGenerator } from '../../../question-generator/lmStudioGenerator';
import { Reply, StatusCode } from '../../../error-handle';

export interface PromptFormat {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  wordCount: number;
}

export const DefaultPromptFormat: PromptFormat = {
  level: 'A2',
  topic: 'Anything that will inspire me',
  wordCount: 300
};

export class NewsGenerator {
  private prompt: PromptFormat = DefaultPromptFormat;
  private selectedGenerator: string = 'OpenAI';

  public updateSelectedGenerator(generator: string) {
    this.selectedGenerator = generator;
  }

  public async generateNewsArticle(prompt: PromptFormat): Promise<Reply> {
    this.prompt = prompt;
    if (this.selectedGenerator === 'OpenAI') {
      return await this.useOpenAI();
    } else if (this.selectedGenerator === 'LMStudio') {
      return await this.useLmStudio();
    }
    return {
      statusCode: StatusCode.InternalError,
      message: 'No valid generator selected',
      error: new Error('No valid generator selected'),
      data: false
    } as Reply;
  }
  private async useLmStudio(): Promise<Reply> {
    if ((await LmStudioGenerator.isServiceAvailable()).data) {
      const llmReply = await LmStudioGenerator.generateReply(this.buildPrompt(this.prompt));
      return {
        statusCode: llmReply.statusCode,
        message: llmReply.message,
        data: llmReply.data
      } as Reply;
    } else {
      return {
        statusCode: StatusCode.InternalError,
        message: 'LM Studio service is unavailable',
        error: new Error('LM Studio service is unavailable'),
        data: false
      } as Reply;
    }
  }
  private async useOpenAI(): Promise<Reply> {
    const openAIService = new OpenAIService();
    openAIService.init();
    if ((await openAIService.connectionTest()) == true) {
      const promptText: MessagePayload = {
        prompt: this.buildPrompt(this.prompt)
      };
      const llmReply = await openAIService.generateContext(promptText);
      return {
        statusCode: llmReply.statusCode,
        message: llmReply.message,
        data: llmReply.data
      } as Reply;
    } else {
      return {
        statusCode: StatusCode.InternalError,
        message: 'Failed to connect to OpenAI service',
        data: false,
        error: new Error('Failed to connect to OpenAI service')
      };
    }
  }
  private buildPrompt(prompt: PromptFormat): string {
    if (!prompt.level) {
      prompt.level = DefaultPromptFormat.level;
    }
    if (!prompt.topic) {
      prompt.topic = DefaultPromptFormat.topic;
    }
    if (!prompt.wordCount) {
      prompt.wordCount = DefaultPromptFormat.wordCount;
    }
    let promptText = `Please write a article base on the following user prompt:
    Level: ${prompt.level}
    Topic: ${prompt.topic}
    Word Count: ${prompt.wordCount}
    `;
    return promptText;
  }
}
