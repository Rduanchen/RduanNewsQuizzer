import axios from 'axios'

export default abstract class VoiceDownload {
  volcabulary: string
  link: string
  constructor(volcabulary: string) {
    this.volcabulary = volcabulary
    this.link = this.makeDownloadLink()
  }
  abstract makeDownloadLink(): string
  async downloadVoice() {
    try {
      // 使用 axios 下載 MP3 文件
      const response = await axios({
        method: 'get',
        url: this.link,
        responseType: 'arraybuffer' // 確保下載的是二進制數據
      })

      // 將數據轉換為 Blob
      const mp3Blob = new Blob([response.data], { type: 'audio/mpeg' })

      console.log('MP3 has been successfully downloaded and converted to Blob')
      return mp3Blob
    } catch (error: any) {
      console.error('Error downloading or converting MP3:', error.message)
      throw error
    }
  }
}

if (import.meta.url === new URL(import.meta.url).href) {
  class YahooVoiceDownload extends VoiceDownload {
    makeDownloadLink() {
      return `https://s.yimg.com/bg/dict/dreye/live/m/${this.volcabulary}.mp3`
    }
  }
  let voiceDownload = new YahooVoiceDownload('hello')
  // 下載 MP3 文件到資料夾中
  voiceDownload
    .downloadVoice()
    .then(() => {
      console.log('MP3 has been successfully downloaded and converted to Blob')
    })
    .catch((error) => {
      console.error('Error downloading or converting MP3:', error.message)
    })
}
