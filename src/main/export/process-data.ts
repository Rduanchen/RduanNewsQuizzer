import AnkiHtml from './anki-html';
let ankiHtml = new AnkiHtml();
class ProcessCard {
  final: string = '';
  public processCard(body: any): string {
    this.final = '';
    this.final += this.addFrontCard(body.word);
    this.final += ankiHtml.addTitle(body.word); // Back card title
    console.log(body.kk);
    this.processKK(body.kk);
    this.processAudioURL(body.word);
    body.meanings.forEach((section: any) => {
      this.final += this.processSection(section);
    });
    return this.final;
  }
  private addFrontCard(vol: string): string {
    return `${ankiHtml.addTitle(vol)} ${ankiHtml.addAudioTag(vol)} ${ankiHtml.addCardSpace()}`;
  }
  private processSection(section: any): string {
    let output = '';
    output += this.addChip(section.partOfSpeech);
    output += this.addChip(section.definition);
    output += ankiHtml.addText(section.translation);
    output += this.addChip('Definition');
    output += ankiHtml.addText(section.definition);
    output += this.addChip('Example');
    section.example.forEach((example: any) => {
      output += this.processExample(example);
    });
    return output;
  }
  private processExample(example: any) {
    return `${ankiHtml.addText(example.sentence)}<br>${ankiHtml.addText(example.translation)}`;
  }
  private processKK(kk: any) {
    let final = '';
    console.log(kk);
    kk.forEach((k: any) => {
      console.log(k);
      final += `${k.type}: ${k.text}`;
    });
    return `${ankiHtml.addText(final)}`;
  }
  //FIXME
  private processAudioURL(audioURL: any) {
    return `${ankiHtml.addAudioTag(audioURL)}`; //FIXME
  }
  private addChip(name: string): string {
    return ankiHtml.addDiv(name, 'chip');
  }
}

export function exportCard(data: any) {
  let processCard = new ProcessCard();
  let final = ankiHtml.getPrefix();
  data = JSON.parse(data);
  for (let card of data) {
    final += processCard.processCard(card);
    final += ankiHtml.nextVol();
  }
  return final;
}
