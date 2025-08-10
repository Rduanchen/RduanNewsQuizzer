<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5">生成閱讀理解題目</v-card-title>

      <v-card-text>
        <v-stepper v-model="step" :items="steps">
          <!-- 步驟 1: 確認新聞內容 -->
          <template #item.1>
            <v-card flat>
              <v-card-title class="text-h6">新聞內容預覽</v-card-title>
              <v-card-text>
                <v-text-field
                  :model-value="selectedNews?.title"
                  label="新聞標題"
                  readonly
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>

                <v-textarea
                  v-model="articleContent"
                  label="文章內容"
                  rows="10"
                  readonly
                  variant="outlined"
                  :loading="loadingContent"
                ></v-textarea>
              </v-card-text>
            </v-card>
          </template>

          <!-- 步驟 2: 設定參數 -->
          <template #item.2>
            <v-card flat>
              <v-card-title class="text-h6">生成參數設定</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-slider
                      v-model="generationOptions.amount"
                      label="問題數量"
                      min="1"
                      max="20"
                      step="1"
                      thumb-label="always"
                    ></v-slider>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="generationOptions.style"
                      :items="examStyles"
                      label="考試風格"
                      variant="outlined"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="generationOptions.model"
                      :items="modelOptions"
                      label="AI 模型"
                      variant="outlined"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="generationOptions.reasoningEffort"
                      :items="reasoningOptions"
                      label="推理強度"
                      variant="outlined"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>

          <!-- 步驟 3: 生成結果 -->
          <template #item.3>
            <v-card flat>
              <v-card-title class="text-h6">生成的題目</v-card-title>
              <v-card-text>
                <div v-if="generating" class="text-center py-8">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="64"
                  ></v-progress-circular>
                  <p class="mt-4">正在生成題目，請稍候...</p>
                </div>

                <div v-else-if="generatedQuestions">
                  <v-card
                    v-for="(question, index) in generatedQuestions.questions"
                    :key="index"
                    class="mb-4"
                    variant="outlined"
                  >
                    <v-card-title class="text-subtitle-1">
                      問題 {{ index + 1 }}: {{ question.question }}
                    </v-card-title>
                    <v-card-text>
                      <v-radio-group v-model="userAnswers[index]" :disabled="showAnswers">
                        <v-radio
                          v-for="(option, optionIndex) in question.options"
                          :key="optionIndex"
                          :label="option"
                          :value="optionIndex"
                          :color="
                            showAnswers
                              ? optionIndex === question.answer
                                ? 'success'
                                : 'error'
                              : 'primary'
                          "
                        ></v-radio>
                      </v-radio-group>
                    </v-card-text>
                  </v-card>

                  <v-row class="mt-4">
                    <v-col>
                      <v-btn
                        color="secondary"
                        variant="elevated"
                        @click="showAnswers = !showAnswers"
                      >
                        {{ showAnswers ? '隱藏答案' : '顯示答案' }}
                      </v-btn>
                    </v-col>
                    <v-col class="text-right">
                      <v-btn color="success" variant="elevated" @click="exportQuestions">
                        匯出題目
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>

                <div v-else-if="generationError" class="text-center py-8">
                  <v-icon size="64" color="error">mdi-alert-circle</v-icon>
                  <p class="text-h6 mt-4 error--text">生成失敗</p>
                  <p>{{ generationError }}</p>
                </div>
              </v-card-text>
            </v-card>
          </template>
        </v-stepper>
      </v-card-text>

      <v-card-actions>
        <v-btn v-if="step > 1" color="grey" variant="text" @click="step--">上一步</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="closeDialog">關閉</v-btn>
        <v-btn
          v-if="step < 3"
          color="primary"
          variant="elevated"
          @click="nextStep"
          :loading="loadingContent"
        >
          下一步
        </v-btn>
        <v-btn
          v-else-if="step === 3 && !generatedQuestions && !generating"
          color="primary"
          variant="elevated"
          @click="generateQuestions"
        >
          生成題目
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

// Props
const props = defineProps({
  selectedNews: Object,
  modelValue: Boolean
});

// Emits
const emit = defineEmits(['update:modelValue', 'questions-generated']);

// 響應式資料
const dialog = ref(false);
const step = ref(1);
const loadingContent = ref(false);
const generating = ref(false);
const articleContent = ref('');
const generatedQuestions = ref(null);
const generationError = ref('');
const showAnswers = ref(false);
const userAnswers = ref({});

// 生成選項
const generationOptions = ref({
  amount: 5,
  style: 0,
  model: 'gpt-4o-mini',
  reasoningEffort: 'low'
});

// 步驟配置
const steps = [
  { title: '確認內容', value: 1 },
  { title: '設定參數', value: 2 },
  { title: '生成題目', value: 3 }
];

// 選項資料 (與設定對話框相同)
const examStyles = [
  { title: '全部風格', value: 0 },
  { title: 'TOEFL', value: 1 },
  { title: 'IELTS', value: 2 }
];

const modelOptions = [
  { title: 'GPT-4o Mini', value: 'gpt-4o-mini' },
  { title: 'GPT-4o', value: 'gpt-4o' },
  { title: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
];

const reasoningOptions = [
  { title: '低', value: 'low' },
  { title: '中', value: 'medium' },
  { title: '高', value: 'high' }
];

// 監聽對話框狀態
watch(
  () => props.modelValue,
  (newVal) => {
    dialog.value = newVal;
    if (newVal && props.selectedNews) {
      loadNewsContent();
    }
  }
);

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal);
  if (!newVal) {
    resetDialog();
  }
});

// 載入新聞內容
const loadNewsContent = async () => {
  if (!props.selectedNews?.newsLink) return;

  loadingContent.value = true;
  try {
    const content = await window.api.questions.getNewsContent(props.selectedNews.newsLink);
    articleContent.value = content.content || '';
  } catch (error) {
    console.error('Failed to load news content:', error);
    articleContent.value = '無法載入文章內容';
  } finally {
    loadingContent.value = false;
  }
};

// 下一步
const nextStep = async () => {
  if (step.value === 1 && !articleContent.value) {
    await loadNewsContent();
  }

  if (step.value === 2) {
    // 載入使用者的預設設定
    try {
      const settings = await window.api.settings.getQuestionSettings();
      generationOptions.value = { ...generationOptions.value, ...settings };
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  step.value++;
};

// 生成題目
const generateQuestions = async () => {
  generating.value = true;
  generationError.value = '';

  try {
    const options = {
      ...generationOptions.value,
      article: articleContent.value
    };

    const result = await window.api.questions.generate(options);
    generatedQuestions.value = result;
    userAnswers.value = {};

    emit('questions-generated', result);
  } catch (error) {
    console.error('Failed to generate questions:', error);
    generationError.value = error.message || '生成題目時發生未知錯誤';
  } finally {
    generating.value = false;
  }
};

// 匯出題目
const exportQuestions = () => {
  if (!generatedQuestions.value) return;

  // 這裡可以實作匯出功能，例如匯出為 JSON 或 PDF
  console.log('Export questions:', generatedQuestions.value);
};

// 重置對話框
const resetDialog = () => {
  step.value = 1;
  articleContent.value = '';
  generatedQuestions.value = null;
  generationError.value = '';
  showAnswers.value = false;
  userAnswers.value = {};
  generating.value = false;
  loadingContent.value = false;
};

// 關閉對話框
const closeDialog = () => {
  dialog.value = false;
};
</script>
