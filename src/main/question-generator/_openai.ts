import OpenAI from 'openai';
import { storeManager } from '../store/controller';

export enum ExamStyle {
  All = 0,
  TOEFL = 1,
  IELTS = 2
}

export interface Question {
  question: string;
  options: string[];
  answer: number;
}

const QUESTIONS_JSON_SCHEMA = `
[
        {
            "type": "object",
            "properties": {
                "questions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "question": { "type": "string" },
                            "options": {
                                "type": "array",
                                "items": { "type": "string" }
                            },
                            "answer": { "type": "number" }
                        },
                        "required": ["question", "options", "answer"]
                    }
                }
            },
            "required": ["questions"]
        }
    ]`;

export interface QuestionsResponse {
  questions: Question[];
}

export interface GenerateQuestionsOptions {
  article: string;
  amount?: number;
  style?: ExamStyle;
  model?: string;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

export interface ModelOption {
  id: string;
  name: string;
  displayName: string;
  category: 'GPT-5' | 'GPT-4.1';
}

export interface ExamStyleOption {
  title: string;
  value: number;
  description: string;
}

export interface ReasoningOption {
  title: string;
  value: string;
  description: string;
}

class OpenAIService {
  private openai: OpenAI | null = null;
  private readonly DEFAULT_QUESTION_AMOUNT = 5;
  private readonly DEFAULT_MODEL = 'gpt-5-mini';

  // 支援的模型列表
  private readonly AVAILABLE_MODELS: ModelOption[] = [
    {
      id: 'gpt-5',
      name: 'gpt-5',
      displayName: 'GPT-5',
      category: 'GPT-5'
    },
    {
      id: 'gpt-5-mini',
      name: 'gpt-5-mini',
      displayName: 'GPT-5 Mini',
      category: 'GPT-5'
    },
    {
      id: 'gpt-5-nano',
      name: 'gpt-5-nano',
      displayName: 'GPT-5 Nano',
      category: 'GPT-5'
    },
    {
      id: 'gpt-5-chat-latest',
      name: 'gpt-5-chat-latest',
      displayName: 'GPT-5 Chat (Latest)',
      category: 'GPT-5'
    },
    {
      id: 'gpt-4.1',
      name: 'gpt-4.1',
      displayName: 'GPT-4.1',
      category: 'GPT-4.1'
    },
    {
      id: 'gpt-4.1-mini',
      name: 'gpt-4.1-mini',
      displayName: 'GPT-4.1 Mini',
      category: 'GPT-4.1'
    },
    {
      id: 'gpt-4.1-nano',
      name: 'gpt-4.1-nano',
      displayName: 'GPT-4.1 Nano',
      category: 'GPT-4.1'
    }
  ];

  // 考試風格選項
  private readonly EXAM_STYLES: ExamStyleOption[] = [
    {
      title: '全部風格',
      value: 0,
      description: '自動選擇最適合文章的考試風格'
    },
    {
      title: 'TOEFL',
      value: 1,
      description: '托福考試風格的閱讀理解題'
    },
    {
      title: 'IELTS',
      value: 2,
      description: '雅思考試風格的閱讀理解題'
    }
  ];

  // 推理強度選項
  private readonly REASONING_OPTIONS: ReasoningOption[] = [
    {
      title: '低',
      value: 'low',
      description: '快速生成，適合簡單文章'
    },
    {
      title: '中',
      value: 'medium',
      description: '平衡速度與品質'
    },
    {
      title: '高',
      value: 'high',
      description: '深度分析，適合複雜文章'
    }
  ];

  private initializeOpenAI(): void {
    const apiKey = storeManager.getApiKey();
    if (!apiKey) {
      throw new Error('請先設定 OpenAI API Key');
    }
    this.openai = new OpenAI({ apiKey });
  }

  private buildPrompt(opts: GenerateQuestionsOptions): string {
    const amount = Math.max(1, opts.amount ?? this.DEFAULT_QUESTION_AMOUNT);
    let base = `
      You are an AI assistant to generate multiple-choice questions from a given article.
      - Your reply must be in JSON format ONLY.
      - All questions must be multiple-choice.
      - Please generate exactly ${amount} questions.
      - All questions and answers must be in English.
      - The answer index must be random but within the range of available options and correspond to the correct answer.
    `;

    switch (opts.style ?? ExamStyle.All) {
      case ExamStyle.TOEFL:
        base += '\n- Pretend you are a TOEFL iBT/ITP question writer.';
        break;
      case ExamStyle.IELTS:
        base += '\n- Pretend you are an IELTS question writer.';
        break;
      case ExamStyle.All:
      default:
        base += '\n- Pretend you can write both TOEFL and IELTS style questions;';
        break;
    }

    base +=
      '\n- Ensure the JSON strictly follows this format: {"questions": [{"question": "string", "options": ["string"], "answer": number}]}';
    base += `\n- The "question" property in the JSON must strictly follow the schema provided via response_format: ${QUESTIONS_JSON_SCHEMA}`;
    base += '\n\nArticle:\n';
    base += opts.article.trim();

    return base;
  }

  /**
   * 獲取所有可用的模型
   */
  public getAvailableModels(): ModelOption[] {
    return [...this.AVAILABLE_MODELS];
  }

  /**
   * 獲取考試風格選項
   */
  public getExamStyles(): ExamStyleOption[] {
    return [...this.EXAM_STYLES];
  }

  /**
   * 獲取推理強度選項
   */
  public getReasoningOptions(): ReasoningOption[] {
    return [...this.REASONING_OPTIONS];
  }

  /**
   * 根據分類獲取模型
   */
  public getModelsByCategory(category: 'GPT-5' | 'GPT-4.1'): ModelOption[] {
    return this.AVAILABLE_MODELS.filter((model) => model.category === category);
  }

  /**
   * 驗證模型是否支援
   */
  public isModelSupported(modelId: string): boolean {
    return this.AVAILABLE_MODELS.some((model) => model.id === modelId);
  }

  /**
   * 驗證考試風格是否有效
   */
  public isExamStyleValid(style: number): boolean {
    return this.EXAM_STYLES.some((examStyle) => examStyle.value === style);
  }

  /**
   * 驗證推理強度是否有效
   */
  public isReasoningEffortValid(effort: string): boolean {
    return this.REASONING_OPTIONS.some((option) => option.value === effort);
  }

  /**
   * 根據 ID 獲取模型資訊
   */
  public getModelById(modelId: string): ModelOption | null {
    return this.AVAILABLE_MODELS.find((model) => model.id === modelId) || null;
  }

  public async generateQuestions(opts: GenerateQuestionsOptions): Promise<QuestionsResponse> {
    // 驗證選擇的模型是否支援
    if (opts.model && !this.isModelSupported(opts.model)) {
      throw new Error(`不支援的模型: ${opts.model}`);
    }

    this.initializeOpenAI();

    if (!this.openai) {
      throw new Error('OpenAI 初始化失敗');
    }

    const prompt = this.buildPrompt(opts);

    try {
      // const response = await this.openai.chat.completions.create({
      //   model: opts.model ?? this.DEFAULT_MODEL,
      //   messages: [
      //     {
      //       role: 'system',
      //       content:
      //         'You are a helpful assistant that generates multiple-choice reading comprehension questions in Traditional Chinese.'
      //     },
      //     {
      //       role: 'user',
      //       content: prompt
      //     }
      //   ],
      //   temperature: 0.7,
      //   response_format: { type: 'json_object' }
      // });
      const response = await this.openai.responses.create({
        model: opts.model ?? this.DEFAULT_MODEL,
        reasoning: { effort: opts.reasoningEffort ?? 'low' },
        input: prompt
      });

      const content = response.output_text;
      console.log(content);
      if (!content) {
        throw new Error('OpenAI 回應為空');
      }

      let parsedResponse: QuestionsResponse;
      try {
        parsedResponse = JSON.parse(content) as QuestionsResponse;
      } catch (parseError) {
        throw new Error('無法解析 OpenAI 回應的 JSON 格式');
      }

      // 驗證回應格式
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error('OpenAI 回應格式不正確');
      }

      return parsedResponse;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知錯誤';
      throw new Error(`OpenAI 請求失敗: ${message}`);
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      this.initializeOpenAI();
      if (!this.openai) return false;

      await this.openai.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const openAIService = new OpenAIService();
