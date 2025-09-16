<template>
  <v-container fluid class="pa-4">
    <v-row v-if="quizData">
      <!-- Left side: Article -->
      <v-col cols="12" md="7">
        <ArticleDisplay :articleData="quizData" />
      </v-col>
      
      <!-- Right side: Settings Preview -->
      <v-col cols="12" md="5">
        <div style="position: sticky; top: 80px;">
          <SettingsPreview />
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const quizData = ref(null);

onMounted(() => {
  if (route.params.quizData) {
    try {
      quizData.value = JSON.parse(route.params.quizData);
    } catch (e) {
      console.error("Failed to parse quiz data:", e);
      // quizData remains null, so the 'else' block will be shown
    }
  }
});
</script>