<template>
  <v-container class="pa-4" fluid>
    <!-- 錯誤狀態 -->
    <v-row v-if="!selectedNews">
      <v-col cols="12" class="text-center">
        <v-alert type="error" variant="tonal" class="mb-4">
          無法載入新聞資料，請返回重新選擇
        </v-alert>
        <v-btn color="primary" @click="goHome">
          <v-icon left>mdi-arrow-left</v-icon>
          返回首頁
        </v-btn>
      </v-col>
    </v-row>

    <!-- 正常顯示 -->
    <v-row v-else style="height: calc(100vh - 100px)">
      <!-- 左欄：文章內容 -->
      <v-col cols="12" md="6" style="height: 100%">
        <ArticleViewer
          :newsLink="selectedNews.newsLink"
          :coverUrl="selectedNews.coverUrl"
          @content-loaded="onContentLoaded"
        />
      </v-col>

      <!-- 右欄：測驗控制 -->
      <v-col cols="12" md="6" style="height: 100%">
        <!-- 設定階段 -->
        <QuizSettings
          v-if="currentStage === 'settings'"
          :articleContent="articleContent"
          :hasApiKey="hasApiKey"
          @questions-generated="onQuestionsGenerated"
        />

        <!-- 測驗階段 -->
        <QuizInterface
          v-else-if="currentStage === 'quiz'"
          :questions="generatedQuestions"
          :settings="quizSettings"
          @new-quiz="resetToSettings"
        />
      </v-col>
    </v-row>

    <!-- 返回按鈕 -->
    <v-btn
      v-if="selectedNews"
      icon="mdi-arrow-left"
      color="primary"
      variant="elevated"
      class="back-button"
      @click="goHome"
    ></v-btn>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ArticleViewer from '../components/ArticleViewer.vue';
import QuizSettings from '../components/QuizSettings.vue';
import QuizInterface from '../components/QuizInterface.vue';

const router = useRouter();
const route = useRoute();

// 從 URL 參數中獲取新聞資料
const selectedNews = computed(() => {
  try {
    if (route.params.newsData && typeof route.params.newsData === 'string') {
      return JSON.parse(decodeURIComponent(route.params.newsData));
    }
    return null;
  } catch (error) {
    console.error('Failed to parse news data from URL:', error);
    return null;
  }
});

// 響應式數據
const currentStage = ref('settings'); // 'settings' | 'quiz'
const articleContent = ref(null);
const hasApiKey = ref(false);
const generatedQuestions = ref([]);
const quizSettings = ref({});

// 生命周期
onMounted(async () => {
  console.log('Quiz page mounted with news data:', selectedNews.value);

  // 如果沒有新聞資料，可能是直接訪問 URL，需要處理
  if (!selectedNews.value) {
    console.warn('No news data found in URL parameters');
    // 可以選擇重定向到首頁或顯示錯誤信息
    setTimeout(() => {
      if (!selectedNews.value) {
        router.push('/');
      }
    }, 3000);
    return;
  }

  await checkApiKey();
});

// 檢查 API Key
const checkApiKey = async () => {
  try {
    const apiKey = await window.api.settings.getApiKey();
    hasApiKey.value = !!apiKey;
  } catch (error) {
    console.error('Failed to check API key:', error);
    hasApiKey.value = false;
  }
};

// 文章載入完成
const onContentLoaded = (content) => {
  articleContent.value = content;
  console.log('Article content loaded:', content);
};

// 題目生成完成
const onQuestionsGenerated = (data) => {
  generatedQuestions.value = data.questions;
  quizSettings.value = data.settings;
  currentStage.value = 'quiz';
  console.log('Questions generated:', data);
};

// 重置到設定階段
const resetToSettings = () => {
  currentStage.value = 'settings';
  generatedQuestions.value = [];
  quizSettings.value = {};
};

// 返回首頁
const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.back-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}
</style>
