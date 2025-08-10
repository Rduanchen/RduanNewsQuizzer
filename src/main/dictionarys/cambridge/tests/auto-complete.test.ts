import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CambridgeAutoComplete } from '../cambridge-auto-complete';

describe('CambridgeAutoComplete', () => {
  let cambridgeAutoComplete: CambridgeAutoComplete;

  beforeEach(() => {
    cambridgeAutoComplete = new CambridgeAutoComplete();
  });

  it('should create an instance of CambridgeAutoComplete', () => {
    expect(cambridgeAutoComplete).toBeInstanceOf(CambridgeAutoComplete);
  });

  it('should generate the correct URL', () => {
    const word = 'test';
    const expectedUrl = `https://dictionary.cambridge.org/autocomplete/amp?dataset=english-chinese-traditional&q=${word}`;
    expect(cambridgeAutoComplete.makeUrl(word)).toBe(expectedUrl);
  });

  it('should return autocomplete results', async () => {
    const word = 'test';
    const mockResultBody = [{ word: 'test1' }, { word: 'test2' }];
    cambridgeAutoComplete.resultBody = mockResultBody;

    vi.spyOn(cambridgeAutoComplete, 'getResource').mockResolvedValue(undefined);

    const result = await cambridgeAutoComplete.getAutoComplete(word);
    expect(result).toEqual(['test1', 'test2']);
  });

  it('should return an empty array if resultBody is not set', async () => {
    const word = 'test';

    vi.spyOn(cambridgeAutoComplete, 'getResource').mockResolvedValue(undefined);

    const result = await cambridgeAutoComplete.getAutoComplete(word);
    expect(result).toEqual([]);
  });
});
