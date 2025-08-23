import SourcePlugins from '../../pluginsPrototype';
import { type NewsContent, NewsTitles } from '../../pluginsPrototype';

export default class SelfDefineSource extends SourcePlugins {
  public sourceName = 'SelfDefine';
  public context: NewsContent = {
    title: '',
    author: '',
    date: '',
    content: ''
  };
  setup(): void {}
  getSourceName(): string {
    return this.sourceName;
  }
  getNewsContent(url: string): Promise<NewsContent> {
    console.log('SelfDefineSource received url:', url);
    try {
      let urlIndex = JSON.parse(url);
      if (urlIndex.title) {
        this.context.title = urlIndex.title;
      }
      if (urlIndex.content) {
        this.context.content = urlIndex.content;
      }
      return Promise.resolve(this.context);
    } catch (error) {
      // Handle error (e.g., return default context or throw)
      return Promise.reject(new Error('Invalid JSON input'));
    }
  }
  getNewsTitles(keyword?: string): Promise<NewsTitles[]> {
    let titles: NewsTitles[] = [];
    if (keyword) console.log('keyword is not supported in this plugin yet.');
    return Promise.resolve(titles);
  }
}
