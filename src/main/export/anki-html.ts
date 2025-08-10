export default class AnkiHtml {
  public getPrefix(): string {
    return `#separator:tab`
  }
  public addCard(index: string): string {
    return `<div class="card">${index}</div>`
  }
  public addTitle(title: string): string {
    return `<p class="h1">${title}</p>`
  }
  public addText(text: string): string {
    return `<p>${text}</p>`
  }
  public addAudioTag(audio: string): string {
    return `[sound:RduanAnki${audio}.mp3]`
  }
  public changeLine(): string {
    return `<br>`
  }
  public nextVol(): string {
    return `\n`
  }
  public addDiv(content: string | null, cls: string | null): string {
    return `<div class="${cls}">${content}</div>`
  }
  public addAudioElement(audio: string): string {
    return `<audio controls><source src="${audio}" type="audio/mpeg"></audio>`
  }
  public addCardSpace(): string {
    return `\t`
  }
}
