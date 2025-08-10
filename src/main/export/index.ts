import { ipcMain } from 'electron';
import { exportCard } from './process-data';
import { saveTextToFile, selectFolder } from '../tools/save-file';
import { downloadMp3Files } from '../tools/to-mp3';
import { voiceDownloadModel } from '../tools/to-mp3';

export default class MakeAnkiCard {
  constructor() {
    this.setup();
  }
  private setup() {
    ipcMain.handle('card:export-data', async (_event, data) => {
      return this.exportData(data);
    });
    ipcMain.handle('card:export-sound', async (_event, data) => {
      return this.exportSound(data);
    });
  }
  private exportData(data: any) {
    saveTextToFile(exportCard(data));
    return ['success'];
  }
  private async exportSound(data: string) {
    let datas = JSON.parse(data);
    let downloadlist: voiceDownloadModel[] = [];
    datas.forEach((item: any) => {
      downloadlist.push({
        url: item.audioURL.uk,
        fileName: item.volcabulary
      } as voiceDownloadModel);
    });
    let filePath = await selectFolder();
    if (filePath) {
      downloadMp3Files(downloadlist, filePath);
    } else {
      console.error('No folder selected');
      return ['error'];
    }
    console.log('exportSound');
    return ['success'];
  }
}
