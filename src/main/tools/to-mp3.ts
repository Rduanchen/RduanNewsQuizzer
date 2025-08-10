import axios from 'axios'
import fs from 'fs'
import path from 'path'

export interface voiceDownloadModel {
  url: string
  fileName: string
}

export async function downloadMp3Files(urls: voiceDownloadModel[], folderPath: string) {
  // 建立下載的 Promise 陣列
  const downloadPromises = urls.map(async (url, index) => {
    try {
      const response = await axios({
        url: url.url,
        method: 'GET',
        responseType: 'stream',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: 'https://www.google.com/',
          Connection: 'keep-alive'
        }
      })

      const fileName = `${index + 1}.mp3`
      const filePath = path.join(folderPath, fileName)
      const writer = fs.createWriteStream(filePath)

      response.data.pipe(writer)

      return new Promise<void>((resolve, reject) => {
        writer.on('finish', () => {
          writer.close(() => {
            console.log(`File ${fileName} finished and closed.`)
            resolve()
          })
        })

        writer.on('error', (err) => {
          console.error(`Error writing to ${fileName}:`, err)
          reject(err)
        })
      })
    } catch (error) {
      console.error(`Error downloading ${url}:`, error)
    }
  })

  // 等待所有下載完成
  await Promise.all(downloadPromises)
  console.log('All MP3 files downloaded.')
}
