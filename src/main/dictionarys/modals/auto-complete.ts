import axios from 'axios';

export abstract class AutoCompleteModal {
  protected settings: object;
  resultBody: any = null;

  protected requestheader = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://www.google.com/',
    Connection: 'keep-alive'
  };

  constructor(settings: object) {
    this.settings = settings;
  }
  abstract makeUrl(word: string): string;
  async getResource(word: string): Promise<void> {
    try {
      const response = await axios({
        method: 'get',
        url: this.makeUrl(word),
        headers: this.requestheader
      });
      this.resultBody = response.data;
    } catch (error: any) {
      console.error('Error downloading or converting MP3:', error.message);
      throw error;
    }
  }
  abstract getAutoComplete(word: string): Promise<string[]>;
}
