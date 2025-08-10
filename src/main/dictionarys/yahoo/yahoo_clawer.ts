// import VocabularyClawerBase from '../modals/clawer-base'
// import {
//   KK,
//   ExampleSentence,
//   TypeTranslatePair,
//   CardSection,
//   CardSimple
// } from '../modals/clawer-base'

// let yahooBaseUrl = `https://tw.dictionary.yahoo.com/dictionary?p=`

// class YahooClawer extends VocabularyClawerBase {
//   constructor(searchVol: string) {
//     super(yahooBaseUrl, searchVol, {})
//   }
//   protected makeUrl(word: string): string {
//     return `${this.dictionaryUrl}${word}`
//   }
//   getTraslation(): string[][] {
//     const translations = this.resultBody('.dictionaryExplanation')
//     let result: any = []
//     for (let i = 0; i < translations.length; i++) {
//       const translate = translations.eq(i).text()
//       result.push(translate.split('；'))
//     }
//     return result
//   }
//   getDefinition(): string[] {
//     return ['']
//   }
//   getKK(): KK {
//     let kks = this.resultBody('.dictionaryWordCard')
//     kks = kks.find('.compList').eq(0).find('.fz-14')
//     let result: KK = {
//       us: kks.eq(0).text(),
//       dj: kks.eq(1).text(),
//       uk: null
//     }
//     return result
//   }
//   getExampleSentences(): ExampleSentence[] {
//     let sentences = this.resultBody('.d-b.fz-14.fc-2nd.lh-20')
//     let result: any[] = []
//     for (let i = 0; i < sentences.length; i++) {
//       let sentence = sentences.eq(i).text()
//       let chinese_part = sentence.match(/[\u4e00-\u9fff]+/g)?.join('') || ''
//       let english_part = sentence.match(/[a-zA-Z0-9\s.,]+/g)?.join('') || ''
//       result.push({ sentence: english_part, translation: chinese_part })
//     }
//     return result
//   }
//   getTranslationTypesPair(): TypeTranslatePair[] {
//     let types = this.resultBody('.compList.mb-25.p-rel')
//     types = types.find('.lh-22.mh-22.mt-12.mb-12.mr-25')
//     let result: any = []
//     for (let i = 0; i < types.length; i++) {
//       let type = types.eq(i).find('.pos_button').text()
//       let translation = types.eq(i).find('.dictionaryExplanation').text()
//       result.push({ type: type, translation: translation.split('；') })
//     }
//     return result
//   }
//   getTypes(): string[] {
//     let types = this.resultBody('.compList.mb-25.p-rel')
//     types = types.find('.lh-22.mh-22.mt-12.mb-12.mr-25')
//     let result: string[] = []
//     for (let i = 0; i < types.length; i++) {
//       let type = types.eq(i).find('.pos_button').text()
//       result.push(type)
//     }
//     return result
//   }
//   getVoiceUrl(): string {
//     return `https://s.yimg.com/bg/dict/dreye/live/m/${this.searchVol}.mp3`
//   }
//   getCardSection(): CardSection[] {
//     let sectionsData: CardSection[] = []
//     let sectionsBody = this.resultBody('.grp.grp-tab-content-explanation')
//     for (let i = 0; i < sectionsBody.children().length / 2; i++) {
//       console.log('section', i)
//       let type = sectionsBody.find('.compTitle.lh-25').eq(i).text()
//       let content = sectionsBody.find('.compTextList.ml-50').eq(i)
//       console.log(content.children().length)
//       for (let j = 0; j < content.children().length; j++) {
//         let section = content.find('va-top.lh-20.mh-22.mt-12.mb-12.pl-25')
//         for (let k = 0; k < section.length; k++) {
//           let sectionData = {} as CardSection
//           sectionData.type = type
//           sectionData.translation = section.eq(k).find('.d-i.fz-14.lh-20').text()
//           // Example Sentence
//           let sentence = section.eq(k).find('.d-b.fz-14.fc-2nd.lh-20').text()
//           sectionData.example = [
//             {
//               sentence: sentence.match(/[a-zA-Z0-9\s.,]+/g)?.join('') || '',
//               translation: sentence.match(/[\u4e00-\u9fff]+/g)?.join('') || ''
//             }
//           ]
//           sectionData.definition = null
//           console.log(sectionData)
//           sectionsData.push(sectionData)
//         }
//       }
//     }
//     return sectionsData
//   }
//   getCardSimple(): CardSimple {
//     let cardSimple = {} as CardSimple
//     cardSimple.volcabulary = this.searchVol
//     cardSimple.definition = this.getDefinition()
//     cardSimple.example = this.getExampleSentences()
//     cardSimple.translation = this.getTraslation()
//     cardSimple.kk = this.getKK()
//     return cardSimple
//   }
// }

// export default YahooClawer

// if (import.meta.url === new URL(import.meta.url).href) {
//   ;(async () => {
//     console.log('Yahoo Clawer')

//     let searchVol = 'hello'
//     let yahooClawer = new YahooClawer(searchVol)

//     // 等待初始化完成
//     await yahooClawer.initialize()

//     // 初始化完成後再執行其他方法
//     // console.log(yahooClawer.getCardSimple());
//     console.log(yahooClawer.getCardSection())
//   })().catch((error) => {
//     console.error('An error occurred:', error)
//   })
// }
