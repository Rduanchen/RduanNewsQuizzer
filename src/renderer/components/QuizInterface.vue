<template>
  <div>
    <!-- 測驗標題和進度 -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-items-center justify-space-between">
        <div>
          <h2 class="text-h5">閱讀理解測驗</h2>
          <p class="text-body-2 mt-1 mb-0">
            題目 {{ currentQuestionIndex + 1 }} / {{ questions.length }}
          </p>
        </div>

        <div class="text-right">
          <v-chip color="primary" class="mb-1">
            <v-icon left size="small">mdi-clock</v-icon>
            {{ formatTime(elapsedTime) }}
          </v-chip>
          <br />
          <v-btn
            :color="isPaused ? 'success' : 'warning'"
            variant="text"
            size="small"
            @click="toggleTimer"
          >
            <v-icon left size="small">{{ isPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon>
            {{ isPaused ? '繼續' : '暫停' }}
          </v-btn>
        </div>
      </v-card-title>

      <!-- 進度條 -->
      <v-progress-linear
        :model-value="progress"
        color="primary"
        height="4"
        class="mx-4 mb-4 mr-1"
      ></v-progress-linear>
    </v-card>

    <!-- 題目列表 -->

    <div v-if="!showResults" class="question-list">
      <QuestionCard
        v-for="(question, index) in questions"
        :key="index"
        :question="question"
        :questionNumber="index + 1"
        :userAnswer="userAnswers[index]"
        :disabled="false"
        :showResult="false"
        @answer-selected="onAnswerSelected(index, $event)"
        class="mb-4"
      />

      <!-- 完成提示 -->
      <v-card v-if="allQuestionsAnswered" color="success" variant="tonal" class="mt-6">
        <v-card-text class="text-center">
          <v-icon size="48" color="success">mdi-check-circle</v-icon>
          <p class="text-h6 mt-2">所有題目已完成！</p>
          <p class="text-body-2 mb-4">用時：{{ formatTime(elapsedTime) }}</p>

          <v-btn color="success" variant="elevated" size="large" @click="submitAnswers">
            <v-icon left>mdi-check</v-icon>
            提交答案
          </v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- 結果顯示 -->
    <QuizResults
      v-if="showResults"
      :questions="questions"
      :userAnswers="userAnswers"
      :score="score"
      :totalTime="finalTime"
      :settings="quizSettings"
      class="question-list"
      @retry="retryQuiz"
      @new-quiz="$emit('new-quiz')"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import QuestionCard from './QuestionCard.vue';
import QuizResults from './QuizResults.vue';

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  settings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['new-quiz']);

// 響應式數據
const userAnswers = ref({});
const showResults = ref(false);
const score = ref(0);
const currentQuestionIndex = ref(0);
const startTime = ref(Date.now());
const elapsedTime = ref(0);
const finalTime = ref(0);
const isPaused = ref(false);
const quizSettings = ref(props.settings);

// 計時器
let timer = null;

// 計算屬性
const allQuestionsAnswered = computed(() => {
  return (
    props.questions.length > 0 &&
    props.questions.every((_, index) => userAnswers.value[index] !== undefined)
  );
});

const progress = computed(() => {
  if (props.questions.length === 0) return 0;
  const answeredCount = Object.keys(userAnswers.value).length;
  return (answeredCount / props.questions.length) * 100;
});

// 生命周期
onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});

// 計時器控制
const startTimer = () => {
  if (timer) return;

  startTime.value = Date.now() - elapsedTime.value * 1000;
  timer = setInterval(() => {
    if (!isPaused.value) {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const toggleTimer = () => {
  isPaused.value = !isPaused.value;

  if (isPaused.value) {
    stopTimer();
  } else {
    startTimer();
  }
};

// 答題處理
const onAnswerSelected = (questionIndex, selectedOption) => {
  userAnswers.value[questionIndex] = selectedOption;
};

// 提交答案
const submitAnswers = () => {
  stopTimer();
  finalTime.value = elapsedTime.value;

  let correctCount = 0;
  props.questions.forEach((question, index) => {
    if (userAnswers.value[index] === question.answer) {
      correctCount++;
    }
  });

  score.value = correctCount;
  showResults.value = true;
};

// 重新答題
const retryQuiz = () => {
  userAnswers.value = {};
  showResults.value = false;
  score.value = 0;
  elapsedTime.value = 0;
  finalTime.value = 0;
  isPaused.value = false;
  startTimer();
};

// 格式化時間
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.question-list {
  overflow: scroll;
  max-height: 70vh;
}
</style>
