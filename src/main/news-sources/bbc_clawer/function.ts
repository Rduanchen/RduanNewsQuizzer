import * as cheerio from 'cheerio';
import { NewsContent, NewsTitles } from './modelType';
import { BBC_ROOT_URL } from './clawer';

async function getNewsTitle(body: string): Promise<NewsTitles[]> {
  const $ = cheerio.load(body);
  const cards = $('[data-testid="dundee-card"]');
  const result: NewsTitles[] = [];

  cards.each((_i, card) => {
    const cardElem = $(card);

    const title = cardElem.find('[data-testid="card-headline"]').text().trim();
    const description = cardElem.find('[data-testid="card-description"]').text().trim();

    // Find cover image URL - 改進的圖片抓取邏輯
    let imgURL = '';
    const imgElements = cardElem.find('img');

    if (imgElements.length > 0) {
      // 遍歷所有 img 元素，找到非 placeholder 的圖片
      imgElements.each((_i, img) => {
        const $img = $(img);
        const src = $img.attr('src') || '';
        const srcset = $img.attr('srcset') || '';
        const className = $img.attr('class') || '';

        // 跳過 placeholder 圖片
        if (src.includes('placeholder') || className.includes('hide-when-no-script')) {
          return; // 繼續下一個
        }

        // 優先使用 srcset 中的圖片 URL
        if (srcset) {
          // 從 srcset 中提取第一個 URL（通常是最小尺寸的）
          const srcsetUrls = srcset.split(',');
          if (srcsetUrls.length > 0) {
            // 取得適中尺寸的圖片（例如 480w 或 640w）
            const mediumSizeUrl = srcsetUrls.find(
              (url) => url.includes('480w') || url.includes('640w')
            );
            if (mediumSizeUrl) {
              imgURL = mediumSizeUrl.trim().split(' ')[0];
            } else {
              imgURL = srcsetUrls[0].trim().split(' ')[0];
            }
          }
        } else if (src && !src.includes('placeholder')) {
          // 如果沒有 srcset，使用 src
          imgURL = src;
        }
      });
    }

    // News link
    let newsLink = '';
    const linkElem = cardElem.closest('a');
    if (linkElem.length > 0) {
      newsLink = linkElem.attr('href') || '';
    } else {
      const innerLink = cardElem.find('a');
      if (innerLink.length > 0) {
        newsLink = innerLink.attr('href') || '';
      }
    }
    // check news already exist
    if (result.find((item) => item.title === title)) {
      return;
    } else {
      result.push({
        coverUrl: imgURL,
        title,
        description,
        newsLink: newsLink.startsWith('/') ? BBC_ROOT_URL + newsLink : newsLink
      });
    }
  });
  return result;
}
async function getNewsContent(body: string): Promise<NewsContent> {
  const $ = cheerio.load(body);
  const result = {
    title: '',
    author: '',
    date: '',
    content: ''
  };

  result.title = $('[data-component="headline-block"]').text().trim();
  const authorElem = $('[data-testid="byline-new-contributors"]');
  let authorText = '';
  authorElem.find('span').each((i, span) => {
    const spanText = $(span).text().trim();
    if (spanText) {
      if (i !== 0) {
        authorText += `  `;
      }
      authorText += `${spanText}`;
    }
  });
  const dateText = $('time').attr('datetime');
  console.log(dateText, authorText);

  result.author = authorText ? authorText : '';
  result.date = dateText ? dateText : '';

  let content = '';
  const textBlocks = $('[data-component="text-block"]');
  textBlocks.each((_i, block) => {
    const blockElem = $(block);
    const text = blockElem.text().trim();
    if (text) {
      content += `${text}\n`;
    }
  });
  result.content = content;
  return result;
}

export { getNewsTitle, getNewsContent };
