<template>
  <div>
    <!-- 基本資訊 -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-h6">測驗基本資訊</v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item>
            <v-list-item-title>測驗時間</v-list-item-title>
            <template #append>{{ new Date().toLocaleString('zh-TW') }}</template>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>題目數量</v-list-item-title>
            <template #append>{{ questions.length }} 題</template>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>考試風格</v-list-item-title>
            <template #append>{{ getExamStyleName(settings.style) }}</template>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>使用模型</v-list-item-title>
            <template #append>{{ settings.model }}</template>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>作答時間</v-list-item-title>
            <template #append>{{ formatTime(totalTime) }}</template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- 成績分析 -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-h6">成績分析</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <div class="text-center">
              <div class="text-h2" :class="scoreColor + '--text'">{{ scorePercentage }}%</div>
              <div class="text-subtitle-1">正確率</div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="text-center">
              <div class="text-h2 primary--text">{{ rank }}</div>
              <div class="text-subtitle-1">等級評定</div>
            </div>
          </v-col>
        </v-row>

        <!-- 詳細分數 -->
        <v-divider class="my-4"></v-divider>
        <v-row>
          <v-col cols="4">
            <div class="text-center">
              <v-icon color="success" size="32">mdi-check</v-icon>
              <div class="text-h6 mt-1">{{ score }}</div>
              <div class="text-caption">答對題數</div>
            </div>
          </v-col>
          <v-col cols="4">
            <div class="text-center">
              <v-icon color="error" size="32">mdi-close</v-icon>
              <div class="text-h6 mt-1">{{ questions.length - score }}</div>
              <div class="text-caption">答錯題數</div>
            </div>
          </v-col>
          <v-col cols="4">
            <div class="text-center">
              <v-icon color="warning" size="32">mdi-clock</v-icon>
              <div class="text-h6 mt-1">{{ formatTime(averageTimePerQuestion) }}</div>
              <div class="text-caption">平均每題</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 答題詳細分析 -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-h6">答題詳細分析</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(question, index) in questions"
            :key="index"
            :class="getUserAnswer(index) === question.answer ? 'success--text' : 'error--text'"
          >
            <template #prepend>
              <v-icon :color="getUserAnswer(index) === question.answer ? 'success' : 'error'">
                {{
                  getUserAnswer(index) === question.answer ? 'mdi-check-circle' : 'mdi-close-circle'
                }}
              </v-icon>
            </template>

            <v-list-item-title>題目 {{ index + 1 }}</v-list-item-title>
            <v-list-item-subtitle>
              你的答案：{{ getUserAnswerText(index) }} | 正確答案：{{ getCorrectAnswerText(index) }}
            </v-list-item-subtitle>

            <template #append>
              <v-chip
                :color="getUserAnswer(index) === question.answer ? 'success' : 'error'"
                size="small"
              >
                {{ getUserAnswer(index) === question.answer ? '✓' : '✗' }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- 建議與改進 -->
    <v-card variant="outlined">
      <v-card-title class="text-h6">建議與改進</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item v-for="suggestion in suggestions" :key="suggestion.text">
            <template #prepend>
              <v-icon :color="suggestion.color">{{ suggestion.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ suggestion.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  questions: Array,
  userAnswers: Object,
  score: Number,
  totalTime: Number,
  settings: Object
});

// 計算屬性
const scorePercentage = computed(() => {
  return Math.round((props.score / props.questions.length) * 100);
});

const scoreColor = computed(() => {
  const percentage = scorePercentage.value;
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'warning';
  return 'error';
});

const rank = computed(() => {
  const percentage = scorePercentage.value;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  return 'D';
});

const averageTimePerQuestion = computed(() => {
  return Math.floor(props.totalTime / props.questions.length);
});

const suggestions = computed(() => {
  const percentage = scorePercentage.value;
  const suggestions = [];

  if (percentage < 60) {
    suggestions.push({
      icon: 'mdi-book-open-page-variant',
      color: 'info',
      text: '建議多閱讀相關文章，提高理解能力'
    });
  }

  if (averageTimePerQuestion.value > 120) {
    suggestions.push({
      icon: 'mdi-clock-fast',
      color: 'warning',
      text: '可以嘗試提高閱讀速度，每題建議控制在2分鐘內'
    });
  } else if (averageTimePerQuestion.value < 30) {
    suggestions.push({
      icon: 'mdi-clock-outline',
      color: 'info',
      text: '答題速度很快，但要注意仔細閱讀題目'
    });
  }

  if (percentage >= 80) {
    suggestions.push({
      icon: 'mdi-trophy',
      color: 'success',
      text: '表現優秀！可以嘗試更有挑戰性的文章'
    });
  }

  return suggestions;
});

// 方法
const getUserAnswer = (index) => {
  return props.userAnswers[index];
};

const getUserAnswerText = (index) => {
  const answer = getUserAnswer(index);
  if (answer === undefined) return '未作答';
  return `${String.fromCharCode(65 + answer)}. ${props.questions[index].options[answer]}`;
};

const getCorrectAnswerText = (index) => {
  const correctAnswer = props.questions[index].answer;
  return `${String.fromCharCode(65 + correctAnswer)}. ${props.questions[index].options[correctAnswer]}`;
};

const getExamStyleName = (style) => {
  const styles = { 0: '全部風格', 1: 'TOEFL', 2: 'IELTS' };
  return styles[style] || '未知';
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>
