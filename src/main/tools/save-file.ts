import { dialog } from 'electron'
import * as fs from 'fs'

/**
 * 將文字寫入檔案。
 * @param filePath - 完整的檔案路徑。
 * @param content - 要寫入的文字內容。
 */
function writeFile(filePath: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error('An error occurred while saving the file:', err)
        reject(err)
      } else {
        console.log('File saved successfully:', filePath)
        resolve()
      }
    })
  })
}

/**
 * 開啟「另存為」對話框，讓使用者選擇存檔位置並將內容存入指定檔案。
 * @param text - 要儲存的文字內容。
 */
export async function saveTextToFile(text: string): Promise<void> {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Text File',
      defaultPath: 'document.txt',
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    })

    if (filePath) {
      await writeFile(filePath, text)
    } else {
      console.log('File save canceled by the user.')
    }
  } catch (error) {
    console.error('Failed to save text to file:', error)
  }
}

/**
 * 開啟原生檔案選擇器，讓使用者選擇一個資料夾。
 * @returns 選擇的資料夾路徑或 null（如果取消）。
 */
export async function selectFolder(): Promise<string | null> {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (canceled) {
      console.log('Folder selection canceled by the user.')
      return null
    }

    return filePaths[0]
  } catch (error) {
    console.error('Error selecting folder:', error)
    return null
  }
}
