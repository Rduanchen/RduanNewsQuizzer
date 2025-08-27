import Store from 'electron-store';

export interface QuestionSettings {
  amount: number;
  style: number;
  model: string;
  reasoningEffort: 'low' | 'medium' | 'high';
}

class StoreManager {
  private store: Store & {
    get: (key: string, defaultValue?: any) => any;
    set: (key: string, value: any) => void;
  };

  constructor() {
    this.store = new Store() as Store & {
      get: (key: string, defaultValue?: any) => any;
      set: (key: string, value: any) => void;
    };
  }

  // API Key 管理
  public getApiKey(): string {
    const apiKey = this.store.get('openai-api-key', '');
    return apiKey as string;
  }
  public setApiKey(apiKey: string): void {
    this.store.set('openai-api-key', apiKey);
  }

  // API Endpoint 管理
  public getApiEndpoint(): string {
    const endpoint = this.store.get('openai-api-endpoint', '');
    return endpoint as string;
  }
  public setApiEndpoint(endpoint: string): void {
    this.store.set('openai-api-endpoint', endpoint);
  }

  // 其他設定可以繼續添加...
  public getUserPreferences(): any {
    return this.store.get('user-preferences', {});
  }

  public setUserPreferences(preferences: any): void {
    this.store.set('user-preferences', preferences);
  }

  public getQuestionSettings(): string {
    return this.store.get('question-generation-settings', '');
  }
  public setQuestionSettings(settings: string): void {
    this.store.set('question-generation-settings', settings);
  }

  // OpenAI Settings management
  public getOpenAISettings(): string {
    return this.store.get('openai-settings', '');
  }
  public setOpenAISettings(settings: string): void {
    this.store.set('openai-settings', settings);
  }

  public getLMStudioSettings(): string {
    return this.store.get('lmstudio-settings', '');
  }
  public setLMStudioSettings(settings: string): void {
    this.store.set('lmstudio-settings', settings);
  }

  public getLLMSettings(): string {
    return this.store.get('llm-settings', '');
  }
  public setLLMSettings(settings: string): void {
    this.store.set('llm-settings', settings);
  }
}

export const storeManager = new StoreManager();
