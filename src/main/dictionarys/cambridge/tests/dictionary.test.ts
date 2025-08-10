import { describe, it, expect, beforeEach } from 'vitest';
import CambridgeClawer from '../cambridge-clawer';
// import { Meaning, ExampleSentence } from '../../modals/clawer-base';
// import VocabularyClawerBase from '../../modals/clawer-base';
import * as cheerio from 'cheerio';

describe('CambridgeClawer', () => {
  let cambridgeClawer: CambridgeClawer;

  beforeEach(() => {
    const searchVol = 'test';
    const settings = {
      displayKK: true,
      displayAudio: true,
      displayTranslation: true,
      displayDefinition: true,
      displayExample: true,
      exampleLimit: 2,
      cardNumber: 3
    };
    cambridgeClawer = new CambridgeClawer(searchVol, settings);
  });

  it('should get translations', async () => {
    const htmlContent = `
      <div class="trans dtrans dtrans-se break-cj">
        <div class="dtrans">translation1</div>
        <div class="dtrans">translation2</div>
      </div>
    `;
    cambridgeClawer.bodyOverride(htmlContent);
    const translations = cambridgeClawer.getTraslation();
    expect(translations).toEqual([['translation1', 'translation2']]);
  });

  it('should get definitions', async () => {
    const htmlContent = `
      <div class="ddef_h">
        <div class="def ddef_d db">definition1</div>
        <div class="def ddef_d db">definition2</div>
      </div>
    `;
    cambridgeClawer.bodyOverride(htmlContent);
    const definitions = cambridgeClawer.getDefinition();
    expect(definitions).toEqual(['definition1definition2']);
  });

  it('should get KK', async () => {
    const htmlContent = `
      <div class="pos-header dpos-h">
        <div class="pron dpron">ukKK</div>
        <div class="pron dpron">usKK</div>
      </div>
    `;
    cambridgeClawer.bodyOverride(htmlContent);
    const kk = cambridgeClawer.getKK();
    expect(kk).toEqual([
      { type: 'uk', text: 'ukKK' },
      { type: 'us', text: 'usKK' }
    ]);
  });

  it('should get audios url', async () => {
    const htmlContent = `
      <audio>
        <source src="/audio1.mp3" type="audio/mpeg">
        <source src="/audio2.mp3" type="audio/mpeg">
      </audio>
    `;
    cambridgeClawer.bodyOverride(htmlContent);
    const audios = cambridgeClawer.getAudiosUrl();
    expect(audios).toEqual([
      { name: 'uk', url: 'https://dictionary.cambridge.org/audio1.mp3' },
      { name: 'us', url: 'https://dictionary.cambridge.org/audio2.mp3' }
    ]);
  });

  it('should get example sentences', async () => {
    const htmlContent = `
      <div class="examp dexamp">
        <div class="eg deg">sentence1</div>
        <div class="trans dtrans dtrans-se hdb break-cj">translation1</div>
      </div>
      <div class="examp dexamp">
        <div class="eg deg">sentence2</div>
        <div class="trans dtrans dtrans-se hdb break-cj">translation2</div>
      </div>
    `;
    const $ = cheerio.load(htmlContent);
    const examples = cambridgeClawer.getExampleSentences($);
    expect(examples).toEqual([
      { sentence: 'sentence1', translation: 'translation1' },
      { sentence: 'sentence2', translation: 'translation2' }
    ]);
  });

  it('should get types', async () => {
    const htmlContent = `
      <div class="posgram dpos-g hdib lmr-5">type1</div>
      <div class="posgram dpos-g hdib lmr-5">type2</div>
    `;
    cambridgeClawer.bodyOverride(htmlContent);
    const types = cambridgeClawer.getTypes();
    expect(types).toEqual(['type1', 'type2']);
  });

  it('should get each meaning', async () => {
    const htmlContent = `
      <div class="pr entry-body__el">
        <div class="posgram dpos-g hdib lmr-5">noun</div>
        <div class="def-block ddef_block">
          <div class="def ddef_d db">definition1</div>
          <div class="trans dtrans dtrans-se break-cj">translation1</div>
          <div class="examp dexamp">
            <div class="eg deg">sentence1</div>
            <div class="trans dtrans dtrans-se hdb break-cj">translation1</div>
          </div>
        </div>
        <div class="def-block ddef_block">
          <div class="def ddef_d db">definition2</div>
          <div class="trans dtrans dtrans-se break-cj">translation2</div>
          <div class="examp dexamp">
            <div class="eg deg">sentence2</div>
            <div class="trans dtrans dtrans-se hdb break-cj">translation2</div>
          </div>
        </div>
      </div>
    `;
    cambridgeClawer.bodyOverride(htmlContent);
    const meanings = cambridgeClawer.getEachMeaning();
    expect(meanings).toEqual([
      {
        partOfSpeech: 'noun',
        translation: 'translation1',
        definition: 'definition1',
        example: [{ sentence: 'sentence1', translation: 'translation1' }]
      },
      {
        partOfSpeech: 'noun',
        translation: 'translation2',
        definition: 'definition2',
        example: [{ sentence: 'sentence2', translation: 'translation2' }]
      }
    ]);
  });

  it('should get the dictionary', async () => {
    const htmlContent = `
      <div class="pos-header dpos-h">
        <div class="pron dpron">ukKK</div>
        <div class="pron dpron">usKK</div>
      </div>
      <audio>
        <source src="/audio1.mp3" type="audio/mpeg">
        <source src="/audio2.mp3" type="audio/mpeg">
      </audio>
      <div class="pr entry-body__el">
        <div class="posgram dpos-g hdib lmr-5">noun</div>
        <div class="def-block ddef_block">
          <div class="def ddef_d db">definition1</div>
          <div class="trans dtrans dtrans-se break-cj">translation1</div>
          <div class="examp dexamp">
            <div class="eg deg">sentence1</div>
            <div class="trans dtrans dtrans-se hdb break-cj">translation1</div>
          </div>
        </div>
        <div class="def-block ddef_block">
          <div class="def ddef_d db">definition2</div>
          <div class="trans dtrans dtrans-se break-cj">translation2</div>
          <div class="examp dexamp">
            <div class="eg deg">sentence2</div>
            <div class="trans dtrans-se hdb break-cj">translation2</div>
          </div>
        </div>
      </div>
    `;
    cambridgeClawer.bodyOverride(htmlContent);
    const dictionary = cambridgeClawer.getDictionary();
    expect(dictionary).toEqual({
      word: 'test',
      kk: [
        { type: 'uk', text: 'ukKK' },
        { type: 'us', text: 'usKK' }
      ],
      audioURL: [
        { name: 'uk', url: 'https://dictionary.cambridge.org/audio1.mp3' },
        { name: 'us', url: 'https://dictionary.cambridge.org/audio2.mp3' }
      ],
      meanings: [
        {
          partOfSpeech: 'noun',
          translation: 'translation1',
          definition: 'definition1',
          example: [{ sentence: 'sentence1', translation: 'translation1' }]
        },
        {
          partOfSpeech: 'noun',
          translation: 'translation2',
          definition: 'definition2',
          example: [{ sentence: 'sentence2', translation: 'translation2' }]
        }
      ]
    });
  });
});
