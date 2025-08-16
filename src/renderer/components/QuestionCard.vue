<template>
  <v-card variant="outlined" :class="cardClass">
    <v-card-title class="d-flex align-center">
      <v-chip :color="getQuestionStatusColor()" density="comfortable" size="small" class="mr-2">
        Q {{ questionNumber }}
      </v-chip>
      <span class="question-title">{{ question.question }}</span>
    </v-card-title>

    <v-card-text>
      <v-radio-group
        :model-value="userAnswer"
        @update:model-value="onAnswerChange"
        :disabled="disabled"
      >
        <v-radio
          v-for="(option, index) in question.options"
          :key="index"
          :label="option"
          :value="index"
          :color="getOptionColor(index)"
          :class="getOptionClass(index)"
        >
          <template #label>
            <div class="d-flex align-center justify-space-between w-100">
              <span :class="getOptionTextClass(index)">
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </span>

              <!-- 顯示答案狀態圖標 -->
              <div v-if="showResult">
                <v-icon v-if="index === question.answer" color="success" size="small">
                  mdi-check-circle
                </v-icon>
                <v-icon
                  v-else-if="userAnswer === index && index !== question.answer"
                  color="error"
                  size="small"
                >
                  mdi-close-circle
                </v-icon>
              </div>
            </div>
          </template>
        </v-radio>
      </v-radio-group>
    </v-card-text>

    <!-- 解釋區域（如果有的話） -->
    <v-card-actions v-if="showResult">
      <v-expand-transition>
        <div class="w-100">
          <v-divider class="mb-3"></v-divider>
          <div class="px-4 pb-3">
            <v-chip :color="isCorrect ? 'success' : 'error'" size="small" class="mb-2">
              {{ isCorrect ? '正確' : '錯誤' }}
            </v-chip>
            <p class="text-body-2 mb-2">
              <strong>正確答案：</strong>
              {{ String.fromCharCode(65 + question.answer) }}.
              {{ question.options[question.answer] }}
            </p>
            <p v-if="!isCorrect && userAnswer !== undefined" class="text-body-2 error--text">
              <strong>你的答案：</strong>
              {{ String.fromCharCode(65 + userAnswer) }}. {{ question.options[userAnswer] }}
            </p>
          </div>
        </div>
      </v-expand-transition>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  questionNumber: {
    type: Number,
    required: true
  },
  userAnswer: {
    type: Number,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showResult: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['answer-selected']);

// 計算屬性
const isCorrect = computed(() => {
  return props.userAnswer === props.question.answer;
});

const cardClass = computed(() => {
  if (!props.showResult) return '';
  return isCorrect.value ? 'border-success' : 'border-error';
});

// 方法
const onAnswerChange = (value) => {
  emit('answer-selected', value);
};

const getQuestionStatusColor = () => {
  if (!props.showResult) {
    return props.userAnswer !== undefined ? 'primary' : 'grey';
  }
  return isCorrect.value ? 'success' : 'error';
};

const getOptionColor = (optionIndex) => {
  if (!props.showResult) {
    return 'primary';
  }

  if (optionIndex === props.question.answer) {
    return 'success';
  } else if (props.userAnswer === optionIndex && optionIndex !== props.question.answer) {
    return 'error';
  }
  return 'primary';
};

const getOptionClass = (optionIndex) => {
  if (!props.showResult) return '';

  const classes = [];
  if (optionIndex === props.question.answer) {
    classes.push('correct-option');
  } else if (props.userAnswer === optionIndex && optionIndex !== props.question.answer) {
    classes.push('incorrect-option');
  }
  return classes.join(' ');
};

const getOptionTextClass = (optionIndex) => {
  if (!props.showResult) return '';

  if (optionIndex === props.question.answer) {
    return 'text-success font-weight-bold';
  } else if (props.userAnswer === optionIndex && optionIndex !== props.question.answer) {
    return 'text-error';
  }
  return '';
};
</script>

<style scoped>
.question-title {
  display: block;
  white-space: pre-line;
  word-break: break-word;
  overflow-wrap: anywhere;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.6;
  max-width: 100%;
}

.v-chip {
  white-space: nowrap;
  min-width: 40px;
  padding-left: 8px;
  padding-right: 8px;
}

.correct-option {
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  padding: 4px 8px;
  margin: 2px 0;
}

.incorrect-option {
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
  padding: 4px 8px;
  margin: 2px 0;
}

.border-success {
  border-color: #4caf50 !important;
  border-width: 2px !important;
}

.border-error {
  border-color: #f44336 !important;
  border-width: 2px !important;
}
</style>
