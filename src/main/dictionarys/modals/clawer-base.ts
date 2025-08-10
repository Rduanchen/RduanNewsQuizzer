import axios from 'axios';
import * as cheerio from 'cheerio';

function emitError(message: any): never {
  throw new Error(message);
}

export interface CardBase {
  word: string;
  kk: KK[] | null;
  audioURL: Audio[] | null;
}

export interface KK {
  type: string;
  text: string;
}

export interface Audio {
  name: string;
  url: string;
}

export interface Meaning {
  partOfSpeech: string | null;
  translation: string | null;
  definition: string | null;
  example: ExampleSentence[] | null;
}

export interface ExampleSentence {
  sentence: string | null;
  translation: string | null;
}

export interface WordDefination extends CardBase {
  meanings: Meaning[];
}

export default abstract class VocabularyClawerBase {
  searchVol: string;
  dictionaryUrl: string;
  resultBody: any = null;
  protected settings: object;

  protected requestheader = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://www.google.com/',
    Connection: 'keep-alive'
  };

  constructor(dictionaryUrl: string, searchVol: string, settings: object) {
    this.searchVol = searchVol;
    this.dictionaryUrl = dictionaryUrl;
    this.settings = settings;
  }
  protected abstract makeUrl(word: string): string;
  /**
   * Initialize the class by fetching the html body of the dictionary website
   * @returns The url of the search word in the dictionary website
   */
  async initialize(): Promise<void> {
    await this.getHtmlBody();
  }
  private async getHtmlBody(): Promise<void> {
    try {
      const url = this.makeUrl(this.searchVol);
      const response = await axios.get(url, {
        headers: this.requestheader
      });
      this.resultBody = cheerio.load(response.data);
    } catch (error) {
      emitError(error);
    }
  }
  bodyOverride(content: string): void {
    this.resultBody = cheerio.load(content);
  }
  abstract getTraslation(): string[][] | string[];
  abstract getDefinition(): string[];
  abstract getExampleSentences(content: any): ExampleSentence[];
  abstract getEachMeaning(): Meaning[];
  abstract getTypes(): string[];
  getKK(): KK[] {
    emitError('Not implemented');
  }
  getAudiosUrl(): Audio[] {
    emitError('Not implemented');
  }
  getBody(): any {
    return this.resultBody;
  }
}
