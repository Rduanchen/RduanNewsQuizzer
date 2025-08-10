<template>
  <v-app>
    <!-- 頂部導航 -->
    <v-app-bar density="compact" color="primary">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack"></v-btn>
      <v-app-bar-title>閱讀理解測驗</v-app-bar-title>
      <v-spacer></v-spacer>

      <!-- 進度指示器 -->
      <v-chip color="white" variant="outlined" class="mr-4">
        {{ currentQuestionIndex + 1 }} / {{ questions.length }}
      </v-chip>

      <!-- 時間顯示 -->
      <v-chip color="white" variant="outlined">
        {{ formatTime(elapsedTime) }}
      </v-chip>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-0" style="height: calc(100vh - 64px)">
        <v-row no-gutters style="height: 100%">
          <!-- 左側：新聞內容 -->
          <v-col
            cols="12"
            md="6"
            style="height: 100%; overflow-y: auto; border-right: 1px solid #e0e0e0"
          >
            <div class="pa-4">
              <!-- 新聞標題 -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-h5 text-wrap">
                  {{ selectedNews.title }}
                </v-card-title>

                <!-- 新聞圖片 -->
                <v-img
                  v-if="selectedNews.coverUrl"
                  :src="selectedNews.coverUrl"
                  height="200"
                  cover
                  class="mx-4 mb-4"
                  style="border-radius: 8px"
                ></v-img>

                <v-card-text>
                  <v-chip color="primary" size="small" class="mb-2"> BBC News </v-chip>
                </v-card-text>
              </v-card>

              <!-- 新聞內容 -->
              <v-card variant="outlined">
                <v-card-text>
                  <div v-if="loadingContent" class="text-center py-8">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p class="mt-4">載入文章內容中...</p>
                  </div>

                  <div v-else-if="articleContent" class="article-content">
                    <div v-html="formatArticleContent(articleContent)"></div>
                  </div>

                  <div v-else class="text-center py-8">
                    <v-icon size="48" color="grey">mdi-alert-circle</v-icon>
                    <p class="text-body-1 mt-4">無法載入文章內容</p>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-col>

          <!-- 右側：題目區域 -->
          <v-col cols="12" md="6" style="height: 100%; overflow-y: auto">
            <div class="pa-4">
              <!-- 載入題目狀態 -->
              <div v-if="loadingQuestions" class="text-center py-8">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="text-h6 mt-4">正在生成題目...</p>
                <p class="text-body-2">這可能需要一些時間，請稍候</p>
              </div>

              <!-- 題目載入失敗 -->
              <div v-else-if="questionsError" class="text-center py-8">
                <v-icon size="64" color="error">mdi-alert-circle</v-icon>
                <p class="text-h6 mt-4 error--text">題目載入失敗</p>
                <p class="text-body-2">{{ questionsError }}</p>
                <v-btn color="primary" variant="elevated" @click="generateQuestions" class="mt-4">
                  重新生成題目
                </v-btn>
              </div>

              <!-- 題目顯示 -->
              <div v-else-if="questions.length > 0">
                <!-- 未答題狀態 -->
                <div v-if="!showResults">
                  <QuestionCard
                    v-for="(question, index) in questions"
                    :key="index"
                    :question="question"
                    :questionNumber="index + 1"
                    :userAnswer="userAnswers[index]"
                    :disabled="false"
                    @answer-selected="onAnswerSelected(index, $event)"
                    class="mb-4"
                  />

                  <!-- 答題完成檢查 -->
                  <v-card v-if="allQuestionsAnswered" color="success" variant="tonal" class="mt-6">
                    <v-card-text class="text-center">
                      <v-icon size="48" color="success">mdi-check-circle</v-icon>
                      <p class="text-h6 mt-2">所有題目已完成！</p>
                      <p class="text-body-2 mb-4">點擊下方按鈕查看答案和成績</p>

                      <v-btn color="success" variant="elevated" size="large" @click="checkAnswers">
                        <v-icon left>mdi-check</v-icon>
                        檢查答案
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </div>

                <!-- 顯示結果 -->
                <div v-else>
                  <ResultsCard
                    :questions="questions"
                    :userAnswers="userAnswers"
                    :score="score"
                    :totalQuestions="questions.length"
                    @retry="retryQuiz"
                    @new-quiz="generateNewQuiz"
                  />
                </div>
              </div>

              <!-- 無題目狀態 -->
              <div v-else class="text-center py-8">
                <v-icon size="64" color="grey">mdi-help-circle</v-icon>
                <p class="text-h6 mt-4">準備開始測驗</p>
                <v-btn color="primary" variant="elevated" @click="generateQuestions" class="mt-4">
                  <v-icon left>mdi-play</v-icon>
                  開始生成題目
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import QuestionCard from './QuestionCard.vue';
import ResultsCard from './ResultsCard.vue';

const router = useRouter();

// Props
const props = defineProps({
  selectedNews: {
    type: Object,
    required: true
  }
});

// 響應式資料
const loadingContent = ref(false);
const loadingQuestions = ref(false);
const questionsError = ref('');
const articleContent = ref('');
const questions = ref([]);
const userAnswers = ref({});
const showResults = ref(false);
const score = ref(0);
const currentQuestionIndex = ref(0);
const startTime = ref(Date.now());
const elapsedTime = ref(0);

// 計時器
let timer = null;

// 計算屬性
const allQuestionsAnswered = computed(() => {
  return (
    questions.value.length > 0 &&
    questions.value.every((_, index) => userAnswers.value[index] !== undefined)
  );
});

// 生命周期
onMounted(async () => {
  await loadNewsContent();
  await generateQuestions();
  startTimer();
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

// 載入新聞內容
const loadNewsContent = async () => {
  if (!props.selectedNews?.newsLink) return;

  loadingContent.value = true;
  try {
    const response = await window.api.questions.getNewsContent(props.selectedNews.newsLink);
    if (response.success) {
      articleContent.value = response.data.content || '';
    } else {
      console.error('Failed to load news content:', response.error);
      articleContent.value = '';
    }
  } catch (error) {
    console.error('Failed to load news content:', error);
    articleContent.value = '';
  } finally {
    loadingContent.value = false;
  }
};

// 生成題目
const generateQuestions = async () => {
  loadingQuestions.value = true;
  questionsError.value = '';

  try {
    // 先確保有文章內容
    if (!articleContent.value) {
      await loadNewsContent();
    }

    if (!articleContent.value) {
      throw new Error('無法獲取文章內容');
    }

    // 獲取設定
    const settings = await window.api.settings.getQuestionSettings();

    const options = {
      article: articleContent.value,
      amount: settings.amount || 5,
      style: settings.style || 0,
      model: settings.model || 'gpt-5-mini',
      reasoningEffort: settings.reasoningEffort || 'low'
    };

    const response = await window.api.questions.generate(options);

    if (response.success) {
      questions.value = response.data.questions || [];
      userAnswers.value = {};
      showResults.value = false;
      score.value = 0;
      resetTimer();
    } else {
      throw new Error(response.error || '生成題目失敗');
    }
  } catch (error) {
    console.error('Failed to generate questions:', error);
    questionsError.value = error.message || '生成題目時發生未知錯誤';
    questions.value = [];
  } finally {
    loadingQuestions.value = false;
  }
};

// 選擇答案
const onAnswerSelected = (questionIndex, selectedOption) => {
  userAnswers.value[questionIndex] = selectedOption;
};

// 檢查答案
const checkAnswers = () => {
  let correctCount = 0;

  questions.value.forEach((question, index) => {
    if (userAnswers.value[index] === question.answer) {
      correctCount++;
    }
  });

  score.value = correctCount;
  showResults.value = true;
  stopTimer();
};

// 重新答題
const retryQuiz = () => {
  userAnswers.value = {};
  showResults.value = false;
  score.value = 0;
  resetTimer();
};

// 生成新題目
const generateNewQuiz = async () => {
  await generateQuestions();
};

// 返回
const goBack = () => {
  router.go(-1);
};

// 格式化文章內容
const formatArticleContent = (content) => {
  return content
    .split('\n')
    .map((paragraph) =>
      paragraph.trim() ? `<p style="margin-bottom: 16px; line-height: 1.6;">${paragraph}</p>` : ''
    )
    .join('');
};

// 計時器功能
const startTimer = () => {
  startTime.value = Date.now();
  timer = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
  }, 1000);
};

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const resetTimer = () => {
  stopTimer();
  startTimer();
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.article-content {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.article-content p {
  margin-bottom: 16px;
}

.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
}
</style>
