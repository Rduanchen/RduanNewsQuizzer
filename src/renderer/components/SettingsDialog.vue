<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon="mdi-cog" variant="text"></v-btn>
    </template>

    <v-card>
      <v-card-title class="text-h5">系統設定</v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- API Key 設定 -->
          <v-text-field
            v-model="apiKey"
            label="OpenAI API Key"
            :type="showApiKey ? 'text' : 'password'"
            :append-icon="showApiKey ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showApiKey = !showApiKey"
            :rules="apiKeyRules"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <!-- 問題數量 -->
          <v-slider
            v-model="questionSettings.amount"
            label="問題數量"
            min="1"
            max="20"
            step="1"
            thumb-label="always"
            class="mb-4"
          ></v-slider>

          <!-- 考試風格 - 從後端載入 -->
          <v-select
            v-model="questionSettings.style"
            :items="examStyles"
            item-title="title"
            item-value="value"
            label="考試風格"
            variant="outlined"
            class="mb-4"
            :loading="loadingOptions"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>

          <!-- AI 模型 - 從後端載入 -->
          <v-select
            v-model="questionSettings.model"
            :items="availableModels"
            item-title="title"
            item-value="value"
            label="AI 模型"
            variant="outlined"
            class="mb-4"
            :loading="loadingOptions"
          >
            <template #selection="{ item }">
              <v-chip
                :color="item.raw.category === 'GPT-5' ? 'primary' : 'secondary'"
                size="small"
                class="mr-2"
              >
                {{ item.raw.category }}
              </v-chip>
              {{ item.raw.title }}
            </template>

            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-chip
                    :color="item.raw.category === 'GPT-5' ? 'primary' : 'secondary'"
                    size="small"
                  >
                    {{ item.raw.category }}
                  </v-chip>
                </template>
                <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-select>

          <!-- 推理強度 - 從後端載入 -->
          <v-select
            v-model="questionSettings.reasoningEffort"
            :items="reasoningOptions"
            item-title="title"
            item-value="value"
            label="推理強度"
            variant="outlined"
            class="mb-4"
            :loading="loadingOptions"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="closeDialog">取消</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="saveSettings"
          :disabled="!valid || loadingOptions"
          :loading="saving"
        >
          儲存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

// Props & Emits - 修復 v-model 問題
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['settings-updated', 'update:modelValue']);

// 響應式數據 - 修復 dialog 綁定
const dialog = ref(props.modelValue);
const valid = ref(false);
const showApiKey = ref(false);
const apiKey = ref('');
const loadingOptions = ref(false);
const saving = ref(false);

// 選項資料 - 從後端載入
const availableModels = ref([]);
const examStyles = ref([]);
const reasoningOptions = ref([]);

const questionSettings = ref({
  amount: 5,
  style: 0,
  model: 'gpt-5-mini',
  reasoningEffort: 'low'
});

// 驗證規則
const apiKeyRules = [
  (v) => !!v || 'API Key 為必填項目',
  (v) => v.startsWith('sk-') || 'API Key 應該以 sk- 開頭'
];

// 監聽 modelValue 變化 - 修復雙向綁定
watch(
  () => props.modelValue,
  (newVal) => {
    dialog.value = newVal;
    if (newVal) {
      // 對話框開啟時重新載入數據
      loadSettings();
      if (availableModels.value.length === 0) {
        loadAllOptions();
      }
    }
  }
);

// 監聽 dialog 變化，同步 modelValue
watch(dialog, (newVal) => {
  emit('update:modelValue', newVal);
});

// 生命周期
onMounted(async () => {
  await loadAllOptions();
  await loadSettings();
});

// 載入所有選項
const loadAllOptions = async () => {
  loadingOptions.value = true;
  try {
    // 並行載入所有選項
    const [modelsResponse, stylesResponse, reasoningResponse] = await Promise.all([
      window.api.questions.getAvailableModels(),
      window.api.questions.getExamStyles(),
      window.api.questions.getReasoningOptions()
    ]);

    // 處理模型選項
    if (modelsResponse.success) {
      availableModels.value = modelsResponse.data.map((model) => ({
        title: model.displayName,
        value: model.id,
        category: model.category
      }));
    } else {
      console.error('Failed to load models:', modelsResponse.error);
      // 備用方案
      availableModels.value = [{ title: 'GPT-5 Mini', value: 'gpt-5-mini', category: 'GPT-5' }];
    }

    // 處理考試風格選項
    if (stylesResponse.success) {
      examStyles.value = stylesResponse.data.map((style) => ({
        title: style.title,
        value: style.value,
        description: style.description
      }));
    } else {
      console.error('Failed to load exam styles:', stylesResponse.error);
      // 備用方案
      examStyles.value = [{ title: '全部風格', value: 0, description: '自動選擇最適合的風格' }];
    }

    // 處理推理強度選項
    if (reasoningResponse.success) {
      reasoningOptions.value = reasoningResponse.data.map((option) => ({
        title: option.title,
        value: option.value,
        description: option.description
      }));
    } else {
      console.error('Failed to load reasoning options:', reasoningResponse.error);
      // 備用方案
      reasoningOptions.value = [{ title: '低', value: 'low', description: '快速生成' }];
    }
  } catch (error) {
    console.error('Failed to load options:', error);
    // 全部失敗時的備用方案
    availableModels.value = [{ title: 'GPT-5 Mini', value: 'gpt-5-mini', category: 'GPT-5' }];
    examStyles.value = [{ title: '全部風格', value: 0, description: '自動選擇最適合的風格' }];
    reasoningOptions.value = [{ title: '低', value: 'low', description: '快速生成' }];
  } finally {
    loadingOptions.value = false;
  }
};

// 載入設定
const loadSettings = async () => {
  try {
    apiKey.value = await window.api.settings.getApiKey();
    const settings = await window.api.settings.getQuestionSettings();
    questionSettings.value = { ...questionSettings.value, ...settings };
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};

// 儲存設定
const saveSettings = async () => {
  saving.value = true;
  try {
    // 建立可序列化的資料物件
    const settingsToSave = {
      amount: questionSettings.value.amount,
      style: questionSettings.value.style,
      model: questionSettings.value.model,
      reasoningEffort: questionSettings.value.reasoningEffort
    };

    // 分別呼叫兩個 API
    const apiKeyResult = await window.api.settings.setApiKey(apiKey.value);
    const settingsResult = await window.api.settings.setQuestionSettings(settingsToSave);

    if (apiKeyResult.success && settingsResult.success) {
      emit('settings-updated', {
        apiKey: apiKey.value,
        questionSettings: settingsToSave
      });

      // 自動關閉對話框
      dialog.value = false;
    } else {
      const error = apiKeyResult.error || settingsResult.error || '儲存設定時發生錯誤';
      console.error('Failed to save settings:', error);
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
  } finally {
    saving.value = false;
  }
};

// 關閉對話框 - 修復關閉邏輯
const closeDialog = () => {
  dialog.value = false;
  // 重新載入設定以還原變更
  loadSettings();
};
</script>
