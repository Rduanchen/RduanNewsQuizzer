import { OpenAIService, type MessagePayload } from '../../../question-generator/generator/OpenAI';
import { LmStudioGenerator } from '../../../question-generator/generator/LMStudio';
import { Reply, StatusCode } from '../../../error-handle';

export interface PromptFormat {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  wordCount: number;
}

export interface GeneratedArticleFormat {
  title: string;
  content: string;
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
      // convert the string to JSON
      console.log(llmReply);
      const jsonData = JSON.parse(llmReply.data);
      return {
        statusCode: llmReply.statusCode,
        message: llmReply.message,
        data: jsonData
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
      // convert the string to JSON
      const jsonData = JSON.parse(llmReply.data);
      return {
        statusCode: llmReply.statusCode,
        message: llmReply.message,
        data: jsonData
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

    let promptText = `Please write an article based on the following user prompt:
  Level: ${prompt.level}
  Topic: ${prompt.topic}
  Word Count: ${prompt.wordCount} words (approximately)

  You will need to return the article in a valid JSON format, which looks like the example below:

  {
    "title": "string", 
    "content": "string"
  }

  Important instructions:
  1. Use double quotes (") for both the title and content values, and escape any internal double quotes within the content (e.g., \"word\").
  2. Ensure the JSON format is valid, meaning there should be no missing or mismatched quotes, brackets, or commas.
  3. Avoid using special characters that are not escaped properly, such as unescaped single quotes or backticks.
  4. The content should be a string of text (with appropriate word count), and you should only use newline characters (\\n) where necessary.
  5. The JSON object should be properly formatted and indented as shown in the example above.
  6. Do not add \n any extra explanations, comments, or text outside the JSON structure.
  7. Plese reply the JSON object only in one line without any line breaks.

  Return the article as valid JSON.`;

    return promptText;
  }
}
