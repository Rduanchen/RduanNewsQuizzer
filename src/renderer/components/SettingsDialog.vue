<template>
  <v-dialog v-model="dialog" max-width="700px" persistent>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon="mdi-cog" variant="text"></v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h5">系統設定</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- 題目設定區塊 -->
          <v-divider class="mb-3"></v-divider>
          <div class="mb-3 font-weight-bold">題目設定</div>
          <v-slider
            v-model="questionSettings.questionAmount"
            label="題目數量"
            min="1"
            max="20"
            step="1"
            thumb-label="always"
            class="mb-3"
          ></v-slider>
          <v-select
            v-model="questionSettings.questionStyle"
            :items="questionStyles"
            item-title="name"
            item-value="name"
            label="題目風格"
            multiple
            variant="outlined"
            class="mb-3"
            :loading="loadingOptions"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>
          <v-select
            v-model="questionSettings.testStyle"
            :items="testStyles"
            item-title="name"
            item-value="name"
            label="考試類型"
            variant="outlined"
            class="mb-3"
            :loading="loadingOptions"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>

          <!-- 來源切換 -->
          <v-divider class="mb-3"></v-divider>
          <div class="mb-3 font-weight-bold">AI 來源選擇</div>
          <v-btn-toggle
            v-model="currentSource"
            mandatory
            class="mb-3"
            color="primary"
          >
            <v-btn v-for="src in llmSources" :key="src" :value="src">{{ src }}</v-btn>
          </v-btn-toggle>

          <!-- 來源特定設定 -->
          <v-divider class="mb-3"></v-divider>
          <div v-if="currentSource === 'OpenAI'">
            <div class="mb-2 font-weight-bold">OpenAI 設定</div>
            <v-text-field
              v-model="openaiSettings.apiKey"
              label="API Key"
              :type="showApiKey ? 'text' : 'password'"
              :append-icon="showApiKey ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showApiKey = !showApiKey"
              :rules="apiKeyRules"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
            <v-select
              v-model="openaiSettings.model"
              :items="openaiModels"
              item-title="displayName"
              item-value="id"
              label="模型"
              variant="outlined"
              class="mb-3"
              :loading="loadingOptions"
            >
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
                  <v-list-item-title>
                    {{ item.raw.displayName || item.raw.id }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    單題價格 ${{ item.raw.price || '-' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
            <v-select
              v-model="openaiSettings.reasoningEffort"
              :items="reasoningEfforts"
              item-title="title"
              item-value="value"
              label="推理強度"
              variant="outlined"
              class="mb-3"
              :loading="loadingOptions"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </div>
          <div v-else-if="currentSource === 'LMStudio'">
            <div class="mb-2 font-weight-bold">LM Studio 設定</div>
            <v-text-field
              v-model="lmStudioSettings.model"
              label="模型名稱"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
          </div>

          <!-- 錯誤訊息 -->
          <v-alert
            v-if="errorMsg"
            type="error"
            class="mb-3"
            border="start"
            border-color="red"
            prominent
          >
            {{ errorMsg }}
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="closeDialog">取消</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="manualSave"
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

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(['update:modelValue', 'settings-updated']);

const dialog = ref(props.modelValue);
const valid = ref(true);
const loadingOptions = ref(false);
const saving = ref(false);
const errorMsg = ref('');
const showApiKey = ref(false);

// 題目設定
const questionSettings = ref({
  questionAmount: 10,
  questionStyle: [], // Must be an array of strings
  testStyle: 'ALL'
});
const questionStyles = ref([]); // 由API取得
const testStyles = ref([]); // 由API取得

// AI 來源
const llmSources = ref([]);
const currentSource = ref('OpenAI');

// OpenAI 設定
const openaiSettings = ref({
  apiKey: '',
  model: '',
  reasoningEffort: 'low'
});
const openaiModels = ref([]);
const reasoningEfforts = ref([]);

const apiKeyRules = [
  (v) => !!v || 'API Key 為必填項目',
  (v) => v.startsWith('sk-') || 'API Key 應以 sk- 開頭'
];

// LM Studio 設定
const lmStudioSettings = ref({
  model: ''
});

// 定時同步
let timer = null;
const syncInterval = 2000;

// 初始化與載入
onMounted(async () => {
  await loadAllOptions();
  await getCurrentQuestionSettings();
  // startAutoSync();
});

watch(() => props.modelValue, (val) => {
  dialog.value = val;
  if (val) {
    getCurrentQuestionSettings();
    // startAutoSync();
  } else {
    stopAutoSync();
  }
});

watch(dialog, (val) => {
  emit('update:modelValue', val);
  if (!val) stopAutoSync();
});

// 載入所有選項（API ONLY）
const loadAllOptions = async () => {
  loadingOptions.value = true;
  try {
    // LLM Source
    const llmSourceRes = await window.api.settings.getLLMSourcesOptions();
    if (llmSourceRes.statusCode === 200 && Array.isArray(llmSourceRes.data)) {
      llmSources.value = llmSourceRes.data;
      currentSource.value = llmSources.value[0] || 'OpenAI';
    }

    // OpenAI options (模型/推理強度)
    const openaiOptionsRes = await window.api.settings.getOpenAIOptions();
    if (openaiOptionsRes.statusCode === 200) {
      openaiModels.value = openaiOptionsRes.data.models.map((m) => ({
        ...m,
        displayName: m.displayName || m.id
      }));
      reasoningEfforts.value = openaiOptionsRes.data.reasoningEfforts;
    } else {
      errorMsg.value = openaiOptionsRes.message;
    }

    // 題型/考試型
    const qOptionRes = await window.api.settings.getQuestionSettings();
    if (qOptionRes.statusCode === 200 && qOptionRes.data) {
      questionStyles.value = qOptionRes.data.questionStyles || [];
      testStyles.value = qOptionRes.data.testStyles || [];
    }
  } catch (e) {
    errorMsg.value = '選項載入失敗';
  } finally {
    loadingOptions.value = false;
  }
};

// 載入當前設定（正確使用 getCurrentQuestionSettings API）
const getCurrentQuestionSettings = async () => {
  errorMsg.value = '';
  try {
    const qRes = await window.api.settings.getCurrentQuestionSettings();
    if (qRes.statusCode === 200 && qRes.data) {
      questionSettings.value.questionAmount = qRes.data.questionAmount ?? 10;
      questionSettings.value.testStyle = qRes.data.testStyle ?? 'ALL';
      // questionStyle: must be array of strings
      questionSettings.value.questionStyle = Array.isArray(qRes.data.questionStyle)
        ? qRes.data.questionStyle
        : [];
    }
    // LLM 來源
    const llmRes = await window.api.settings.getCurrentLLMOption();
    if (llmRes.statusCode === 200 && llmRes.data?.source) {
      currentSource.value = llmRes.data.source;
    }
    // OpenAI
    const openaiRes = await window.api.settings.getOpenAISettings();
    if (openaiRes.statusCode === 200 && openaiRes.data) {
      Object.assign(openaiSettings.value, openaiRes.data);
    }
    // LM Studio
    const lmRes = await window.api.settings.getLMStudioSettings();
    if (lmRes.statusCode === 200 && lmRes.data) {
      Object.assign(lmStudioSettings.value, lmRes.data);
    }
  } catch (e) {
    errorMsg.value = '設定載入失敗';
  }
};

// 自動同步
// const startAutoSync = () => {
//   stopAutoSync();
//   timer = setInterval(() => {
//     applySettings();
//   }, syncInterval);
// };

const stopAutoSync = () => {
  if (timer) clearInterval(timer);
};

// 應用並驗證設定
const applySettings = async () => {
  errorMsg.value = '';
  let result;
  // 題目設定
  // questionSettings.questionStyle is already string[]
  const sendQuestionSettings = {
    questionAmount: questionSettings.value.questionAmount,
    questionStyle: questionSettings.value.questionStyle,
    testStyle: questionSettings.value.testStyle
  };
  result = await window.api.settings.updateQuestionSettings(JSON.parse(JSON.stringify(sendQuestionSettings)));
  if (result.statusCode !== 200) {
    errorMsg.value = result.message;
    return;
  }
  // 來源
  result = await window.api.settings.setCurrentLLMOption({ source: currentSource.value });
  if (result.statusCode !== 200) {
    errorMsg.value = result.message;
    return;
  }
  // 各來源設定
  if (currentSource.value === 'OpenAI') {
    result = await window.api.settings.updateOpenAISettings({ ...openaiSettings.value });
    if (result.statusCode !== 200) {
      errorMsg.value = result.message;
      return;
    }
  } else if (currentSource.value === 'LMStudio') {
    result = await window.api.settings.updateLMStudioSettings({ ...lmStudioSettings.value });
    if (result.statusCode !== 200) {
      errorMsg.value = result.message;
      return;
    }
  }
};

// 手動儲存
const manualSave = async () => {
  saving.value = true;
  await applySettings();
  saving.value = false;
  if (!errorMsg.value) {
    emit('settings-updated');
    dialog.value = false;
  }
};

// 關閉對話框
const closeDialog = () => {
  dialog.value = false;
  stopAutoSync();
  getCurrentQuestionSettings();
};
</script>