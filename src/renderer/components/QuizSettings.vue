<template>
  <v-card height="100%">
    <v-card-title class="sticky-header">
      <div class="d-flex align-items-center justify-space-between w-100">
        <span class="text-h6">測驗設定</span>
        <v-btn
          icon="mdi-cog"
          variant="text"
          size="small"
          @click="showSettingsDialog = true"
        ></v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <!-- 當前設定顯示 -->
      <v-list density="compact">
        <v-list-item>
          <template #prepend>
            <v-icon color="primary">mdi-format-list-numbered</v-icon>
          </template>
          <v-list-item-title>題目數量</v-list-item-title>
          <v-list-item-subtitle>{{ currentSettings.amount }} 題</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template #prepend>
            <v-icon color="info">mdi-school</v-icon>
          </template>
          <v-list-item-title>考試風格</v-list-item-title>
          <v-list-item-subtitle>{{ getExamStyleName(currentSettings.style) }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template #prepend>
            <v-icon color="success">mdi-robot</v-icon>
          </template>
          <v-list-item-title>AI 模型</v-list-item-title>
          <v-list-item-subtitle>{{ getModelName(currentSettings.model) }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template #prepend>
            <v-icon color="warning">mdi-brain</v-icon>
          </template>
          <v-list-item-title>推理強度</v-list-item-title>
          <v-list-item-subtitle>{{
            getReasoningName(currentSettings.reasoningEffort)
          }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <!-- API Key 狀態 -->
      <v-alert v-if="!hasApiKey" type="warning" variant="tonal" class="mt-4">
        請先設定 OpenAI API Key
      </v-alert>

      <!-- 文章狀態 -->
      <v-alert v-if="!hasArticle" type="info" variant="tonal" class="mt-4">
        等待文章載入完成...
      </v-alert>
    </v-card-text>

    <!-- 生成按鈕 -->
    <v-card-actions class="px-4 pb-4">
      <v-btn
        color="primary"
        variant="elevated"
        block
        size="large"
        :disabled="!canGenerate"
        :loading="generating"
        @click="generateQuestions"
      >
        <v-icon left>mdi-play</v-icon>
        {{ generating ? '生成中...' : '開始生成題目' }}
      </v-btn>
    </v-card-actions>

    <!-- 設定對話框 -->
    <SettingsDialog v-model="showSettingsDialog" @settings-updated="onSettingsUpdated" />
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SettingsDialog from './SettingsDialog.vue';

const props = defineProps({
  articleContent: {
    type: Object,
    default: null
  },
  hasApiKey: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['questions-generated']);

// 響應式數據
const generating = ref(false);
const showSettingsDialog = ref(false);
const currentSettings = ref({
  amount: 5,
  style: 0,
  model: 'gpt-5-mini',
  reasoningEffort: 'low'
});

// 選項名稱映射
const examStyleNames = ref({});
const modelNames = ref({});
const reasoningNames = ref({});

// 計算屬性
const hasArticle = computed(() => {
  return props.articleContent && props.articleContent.content;
});

const canGenerate = computed(() => {
  return props.hasApiKey && hasArticle.value && !generating.value;
});

// 生命周期
onMounted(async () => {
  await loadSettings();
  await loadOptionNames();
});

// 載入設定
const loadSettings = async () => {
  try {
    const settings = await window.api.settings.getQuestionSettings();
    currentSettings.value = { ...currentSettings.value, ...settings };
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};

// 載入選項名稱
const loadOptionNames = async () => {
  try {
    // 載入考試風格
    const stylesResponse = await window.api.questions.getExamStyles();
    if (stylesResponse.success) {
      examStyleNames.value = stylesResponse.data.reduce((acc, style) => {
        acc[style.value] = style.title;
        return acc;
      }, {});
    }

    // 載入模型名稱
    const modelsResponse = await window.api.questions.getAvailableModels();
    if (modelsResponse.success) {
      modelNames.value = modelsResponse.data.reduce((acc, model) => {
        acc[model.id] = model.displayName;
        return acc;
      }, {});
    }

    // 載入推理強度名稱
    const reasoningResponse = await window.api.questions.getReasoningOptions();
    if (reasoningResponse.success) {
      reasoningNames.value = reasoningResponse.data.reduce((acc, option) => {
        acc[option.value] = option.title;
        return acc;
      }, {});
    }
  } catch (error) {
    console.error('Failed to load option names:', error);
  }
};

// 獲取選項顯示名稱
const getExamStyleName = (value) => {
  return examStyleNames.value[value] || '未知風格';
};

const getModelName = (value) => {
  return modelNames.value[value] || value || '未知模型';
};

const getReasoningName = (value) => {
  return reasoningNames.value[value] || '未知強度';
};

// 生成題目
const generateQuestions = async () => {
  if (!canGenerate.value) return;

  generating.value = true;

  try {
    const options = {
      article: props.articleContent.content,
      amount: currentSettings.value.amount,
      style: currentSettings.value.style,
      model: currentSettings.value.model,
      reasoningEffort: currentSettings.value.reasoningEffort
    };

    const response = await window.api.questions.generate(options);

    if (response.success) {
      emit('questions-generated', {
        questions: response.data.questions,
        settings: currentSettings.value
      });
    } else {
      throw new Error(response.error || '生成題目失敗');
    }
  } catch (error) {
    console.error('Failed to generate questions:', error);
    // 這裡可以添加錯誤通知
  } finally {
    generating.value = false;
  }
};

// 設定更新處理
const onSettingsUpdated = async (updatedSettings) => {
  currentSettings.value = { ...updatedSettings.questionSettings };
};
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}
</style>
