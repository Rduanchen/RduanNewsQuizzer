<template>
  <v-container fluid class="pa-4">
    <v-row v-if="quizData">
      <!-- Left side: Article -->
      <v-col cols="12" md="7">
        <ArticleDisplay :articleData="quizData" />
      </v-col>
      
      <!-- Right side: Content based on quiz state -->
      <v-col cols="12" md="5">
        <div style="position: sticky; top: 80px;">
          <!-- State 1: Settings Preview -->
          <SettingsPreview v-if="quizState === 'preview'" @start-quiz="generateQuestions" />

          <!-- State 2: Generating Questions (Loading) -->
          <v-card v-if="quizState === 'generating'" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <h2 class="mt-4">{{ $t('quizPage.generatingTitle') }}</h2>
            <p>{{ $t('quizPage.generatingSubtitle') }}</p>
          </v-card>

          <!-- State 3: Taking the Quiz -->
          <QuizTaker v-if="quizState === 'taking' && questions.length > 0" :questions="questions" />
        </div>
      </v-col>
    </v-row>

    <!-- Fallback if no data is provided -->
    <v-row v-else justify="center">
      <!-- ... existing fallback content ... -->
    </v-row>
  </v-container>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ArticleDisplay from '../components/quiz/ArticleDisplay.vue';
import SettingsPreview from '../components/quiz/SettingsPreview.vue';
import QuizTaker from '../components/quiz/QuizTaker.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const quizData = ref(null);

const quizState = ref('preview'); // 'preview', 'generating', 'taking'
const questions = ref([]);
const error = ref('');

const generateQuestions = async () => {
    if (!quizData.value?.article) return;
    
    quizState.value = 'generating';
    error.value = '';
    
    try {
        // --- FIX START ---
        // 1. Changed window.api.question to window.api.questions (plural)
        // 2. Wrapped the article content in an object as the API expects
        const reply = await window.api.questions.generateQuestions(JSON.stringify(quizData.value.article));
        // --- FIX END ---
        //&& Array.isArray(reply.data)
        if (reply.statusCode === 200) {
            questions.value = reply.data;
            quizState.value = 'taking';
        } else {
            throw new Error(reply.message || t('quizPage.errorGenerating'));
        }
    } catch (err) {
        error.value = err.message;
        quizState.value = 'preview'; // Revert to preview on error
        alert(t('quizPage.errorGenerating') + ': ' + err.message);
    }
};

onMounted(() => {
  if (route.params.quizData) {
    try {
      quizData.value = JSON.parse(route.params.quizData);
      
    } catch (e) {
      console.error("Failed to parse quiz data:", e);
    }
  }
});
</script>