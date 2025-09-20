import SourcePlugins from '../../pluginsPrototype';
import { getBBCNewsTitles, getBBCNewsContent, configBBC } from 'bbc-scraper';

export default class BBCSource extends SourcePlugins {
  public sourceName = 'BBC';
  getSourceName(): string {
    return this.sourceName;
  }
  async getNewsContent(url: string): Promise<any> {
    return getBBCNewsContent(url);
  }
  async getNewsTitles(keyword?: string): Promise<any> {
    configBBC({
      imageResolution: 'medium'
    });
    if (keyword) console.log('keyword is not supported in this plugin yet.');
    return getBBCNewsTitles();
  }
}
