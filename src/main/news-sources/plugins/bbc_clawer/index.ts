import { getNewsTitle, getNewsContent } from './function';
import { crawler, BBC_TITLE_PAGE_URL } from './clawer';
import { NewsTitles, NewsContent } from './modelType';

async function getBBCNewsTitles(): Promise<NewsTitles[]> {
  const body = await crawler(BBC_TITLE_PAGE_URL);
  return getNewsTitle(body);
}

async function getBBCNewsContent(url: string): Promise<NewsContent> {
  const body = await crawler(url);
  return getNewsContent(body);
}

export {
  getBBCNewsTitles,
  getBBCNewsContent,
  crawler,
  getNewsTitle,
  getNewsContent,
  BBC_TITLE_PAGE_URL
};

import SourcePlugins from '../../pluginsPrototype';

export default class BBCSource extends SourcePlugins {
  public sourceName = 'BBC';

  getSourceName(): string {
    return this.sourceName;
  }
  async getNewsContent(url: string): Promise<NewsContent> {
    return getBBCNewsContent(url);
  }
  async getNewsTitles(keyword?: string): Promise<NewsTitles[]> {
    if (keyword) console.log('keyword is not supported in this plugin yet.');
    return getBBCNewsTitles();
  }
}
