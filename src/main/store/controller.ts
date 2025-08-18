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

  // 問題生成設定管理
  public getQuestionSettings(): QuestionSettings {
    return this.store.get('question-settings', {
      amount: 5,
      style: 0,
      model: 'gpt-4o-mini',
      reasoningEffort: 'low'
    }) as QuestionSettings;
  }

  public setQuestionSettings(settings: QuestionSettings): void {
    this.store.set('question-settings', settings);
  }

  // 其他設定可以繼續添加...
  public getUserPreferences(): any {
    return this.store.get('user-preferences', {});
  }

  public setUserPreferences(preferences: any): void {
    this.store.set('user-preferences', preferences);
  }
}

export const storeManager = new StoreManager();
