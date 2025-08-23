interface NewsContent {
  title: string;
  author: string;
  date: string;
  content: string;
}

interface NewsTitles {
  coverUrl: string | null;
  title: string;
  description: string;
  newsLink: string;
}

abstract class SourcePlugins {
  public abstract sourceName: string;

  setup(): void {
    // Optional: Default setup logic or leave empty
  }

  abstract getSourceName(): string;
  abstract getNewsContent(url: string): Promise<NewsContent>;
  abstract getNewsTitles(keyword?: string): Promise<NewsTitles[]>;
}

export default SourcePlugins;
export type { NewsContent, NewsTitles };
