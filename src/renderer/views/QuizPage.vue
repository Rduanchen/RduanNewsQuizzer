<template>
  <v-container fluid class="pa-4">
    <v-row v-if="quizData">
      <!-- Left side: Article -->
      <v-col cols="12" md="7" class="left-panel">
        <ArticleDisplay :articleData="quizData" />
      </v-col>

      <!-- Right side: Content based on quiz state -->
      <v-col cols="12" md="5" class="right-panel">
        <div style="position: sticky; top: 80px">
          <!-- State 1: Settings Preview -->
          <SettingsPreview v-if="quizState === 'preview'" @start-quiz="generateQuestions" />

          <!-- State 2: Generating Questions (Loading) -->
          <v-card v-if="quizState === 'generating'" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <h2 class="mt-4">{{ $t('quizPage.generatingTitle') }}</h2>
            <p>{{ $t('quizPage.generatingSubtitle') }}</p>
          </v-card>

          <!-- State 3: Taking the Quiz -->
          <QuizTaker
            v-if="quizState === 'taking' && questions.length > 0"
            :questions="questions"
            @quiz-submitted="handleQuizSubmitted"
          />

          <!-- State 4: Result View -->
          <ResultView
            v-if="quizState === 'result'"
            :questions="questions"
            :user-answers="resultData.userAnswers"
            :time-used="resultData.timeUsed"
            @retake="retakeQuiz"
          />
        </div>
      </v-col>
    </v-row>

    <!-- Fallback if no data is provided -->
    <v-row v-else justify="center">
      <v-col cols="auto" class="text-center">
        <h1 class="text-h4">{{ $t('quizPage.noData') }}</h1>
        <p>{{ $t('quizPage.noDataSubtitle') }}</p>
        <v-btn color="primary" to="/" class="mt-4">{{ $t('quizPage.goHome') }}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ArticleDisplay from '../components/quiz/ArticleDisplay.vue';
import SettingsPreview from '../components/quiz/SettingsPreview.vue';
import QuizTaker from '../components/quiz/QuizTaker.vue';
import ResultView from '../components/quiz/ResultView.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const quizData = ref(null);

const quizState = ref('preview'); // 'preview', 'generating', 'taking', 'result'
const questions = ref([]);
const error = ref('');

const resultData = ref({
  userAnswers: [],
  timeUsed: []
});

const generateQuestions = async () => {
  if (!quizData.value?.article) return;
  quizState.value = 'generating';
  error.value = '';
  try {
    const reply = await window.api.questions.generateQuestions(
      JSON.stringify(quizData.value.article)
    );
    if (reply.statusCode === 200 && Array.isArray(reply.data)) {
      questions.value = reply.data;
      quizState.value = 'taking';
    } else {
      throw new Error(reply.message || t('quizPage.errorGenerating'));
    }
  } catch (err) {
    error.value = err.message;
    quizState.value = 'preview';
    alert(t('quizPage.errorGenerating') + ': ' + err.message);
  }
};

const handleQuizSubmitted = (payload) => {
  resultData.value = payload;
  quizState.value = 'result';
};

const retakeQuiz = () => {
  resultData.value = { userAnswers: [], timeUsed: [] };
  quizState.value = 'taking';
};

onMounted(() => {
  if (route.params.quizData) {
    try {
      quizData.value = JSON.parse(route.params.quizData);
    } catch (e) {
      console.error('Failed to parse quiz data:', e);
    }
  }
});
</script>
<style scoped>
.left-panel {
  max-height: 90vh;
  overflow-y: auto;
}

.right-panel {
  max-height: 90vh;
  overflow-y: auto;
}
</style>
