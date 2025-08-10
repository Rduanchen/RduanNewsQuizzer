import { AutoCompleteModal } from '../modals/auto-complete';

export class CambridgeAutoComplete extends AutoCompleteModal {
  constructor() {
    super({});
  }
  makeUrl(word: string): string {
    return `https://dictionary.cambridge.org/autocomplete/amp?dataset=english-chinese-traditional&q=${word}`;
  }
  async getAutoComplete(word: string): Promise<string[]> {
    let result = [];
    await this.getResource(word); // 確保 getResource 完成
    if (this.resultBody) {
      result = this.resultBody.map((word: any) => word.word);
    }
    return result;
  }
}
