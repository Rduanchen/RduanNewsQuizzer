import { NumberInput, SelectionInput, SectionTitle } from '../../settings/setting-modal';

const CAMBRIDGE_SETTING: (NumberInput | SelectionInput | SectionTitle)[] = [
  {
    name: '卡片數量',
    id: 'cardNumber',
    type: 'text',
    placeholder: '未輸入為無限制',
    default: ''
  },
  {
    name: '每張卡片造句數量',
    id: 'exampleLimit',
    type: 'text',
    placeholder: '未輸入為無限制',
    default: ''
  },
  {
    name: '卡片輸出設定'
  },
  {
    name: 'kk音標',
    id: 'displayKK',
    type: 'selection',
    selections: [
      {
        name: '顯示',
        value: true
      },
      {
        name: '不顯示',
        value: false
      }
    ],
    default: 0
  },
  {
    name: '音檔',
    id: 'displayAudio',
    type: 'selection',
    selections: [
      {
        name: '顯示',
        value: true
      },
      {
        name: '不顯示',
        value: false
      }
    ],
    default: 0
  },
  {
    name: '英文定義',
    id: 'displayDefinition',
    type: 'selection',
    selections: [
      {
        name: '顯示',
        value: true
      },
      {
        name: '不顯示',
        value: false
      }
    ],
    default: 0
  },
  {
    name: '中文翻譯',
    id: 'displayTranslation',
    type: 'selection',
    selections: [
      {
        name: '顯示',
        value: true
      },
      {
        name: '不顯示',
        value: false
      }
    ],
    default: 0
  },
  {
    name: '造句',
    id: 'displayExample',
    type: 'selection',
    selections: [
      {
        name: '顯示',
        value: true
      },
      {
        name: '不顯示',
        value: false
      }
    ],
    default: 0
  },
  {
    name: '例句翻譯',
    id: 'displayExampleTranslation',
    type: 'selection',
    selections: [
      {
        name: '顯示',
        value: true
      },
      {
        name: '不顯示',
        value: false
      }
    ],
    default: 0
  }
];

export default CAMBRIDGE_SETTING;
