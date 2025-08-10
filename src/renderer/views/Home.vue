<template>
  <v-container class="pa-4" fluid>
    <!-- 新聞來源選擇器 -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedSourceIndex"
          :items="newsSourceOptions"
          item-title="title"
          item-value="value"
          label="選擇新聞來源"
          variant="outlined"
          @update:model-value="onSourceChange"
        ></v-select>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-btn @click="refreshNews" :loading="loading" color="primary" variant="elevated">
          <v-icon left>mdi-refresh</v-icon>
          重新載入新聞
        </v-btn>
      </v-col>
    </v-row>

    <!-- 載入狀態 -->
    <v-row v-if="loading && headlines.length === 0" class="justify-center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">正在載入新聞...</p>
      </v-col>
    </v-row>

    <!-- 錯誤狀態 -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" closable @click:close="error = null">
          載入新聞時發生錯誤：{{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- 新聞卡片 -->
    <v-row v-else>
      <v-col v-for="(news, index) in headlines" :key="index" cols="12" sm="6" md="4" lg="3">
        <v-card
          class="news-card"
          height="100%"
          @click="selectNews(news)"
          :class="{ 'selected-card': selectedNews === news }"
          hover
        >
          <!-- 新聞圖片 -->
          <v-img v-if="news.coverUrl" :src="news.coverUrl" height="200" cover class="news-image">
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
              </v-row>
            </template>
          </v-img>
          <div
            v-else
            class="news-placeholder d-flex align-center justify-center"
            style="height: 200px; background-color: #f5f5f5"
          >
            <v-icon size="64" color="grey-lighten-1">mdi-newspaper</v-icon>
          </div>

          <!-- 卡片內容 -->
          <v-card-title class="news-title">
            {{ news.title }}
          </v-card-title>

          <v-card-text class="news-description">
            {{ news.description }}
          </v-card-text>

          <!-- 卡片操作 -->
          <v-card-actions>
            <v-btn color="primary" variant="text" @click.stop="openNewsLink(news.newsLink)">
              <v-icon left>mdi-open-in-new</v-icon>
              閱讀原文
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              :color="selectedNews === news ? 'success' : 'primary'"
              variant="elevated"
              @click.stop="selectNews(news)"
            >
              <v-icon left>{{ selectedNews === news ? 'mdi-check' : 'mdi-plus' }}</v-icon>
              {{ selectedNews === news ? '已選擇' : '選擇' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 無新聞資料 -->
    <v-row v-if="!loading && headlines.length === 0 && !error">
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey">mdi-newspaper-variant-outline</v-icon>
        <p class="text-h6 mt-4">暫無新聞資料</p>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import SettingsDialog from '../components/SettingsDialog.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 響應式資料
const drawer = ref(false);
const loading = ref(false);
const error = ref(null);
const newsSourceOptions = ref([]);
const newsSources = ref([]);
const selectedSourceIndex = ref(0);
const headlines = ref([]);
const selectedNews = ref(null);
const hasApiKey = ref(false);

// 生命周期
onMounted(async () => {
  await loadNewsSources();
  await loadHeadlines();
  await checkApiKey();
  console.log(await window.api.test.test());
});

const checkApiKey = async () => {
  try {
    const apiKey = await window.api.settings.getApiKey();
    hasApiKey.value = !!apiKey;
  } catch (error) {
    console.error('Failed to check API key:', error);
    hasApiKey.value = false;
  }
};

// 設定更新回調
const onSettingsUpdated = (settings) => {
  hasApiKey.value = !!settings.apiKey;
};

// 題目生成完成回調
const onQuestionsGenerated = (questions) => {
  console.log('Questions generated:', questions);
  // 可以在這裡處理生成的題目，例如儲存或顯示通知
};

// 載入新聞來源
const loadNewsSources = async () => {
  try {
    const sources = await window.api.news.getSources();
    newsSources.value = sources;

    // 將字串陣列轉換為物件陣列，用於 v-select
    newsSourceOptions.value = sources.map((source, index) => ({
      title: source,
      value: index
    }));
  } catch (err) {
    console.error('Failed to load news sources:', err);
    error.value = '無法載入新聞來源';
  }
};

// 載入新聞標題
const loadHeadlines = async () => {
  loading.value = true;
  error.value = null;
  try {
    const newsData = await window.api.news.getHeadlines();
    headlines.value = newsData.data || [];
    selectedNews.value = null;
  } catch (err) {
    console.error('Failed to load headlines:', err);
    error.value = '無法載入新聞標題';
    headlines.value = [];
  } finally {
    loading.value = false;
  }
};

// 新聞來源變更
const onSourceChange = async (sourceIndex) => {
  try {
    await window.api.news.selectSource(sourceIndex);
    await loadHeadlines();
  } catch (err) {
    console.error('Failed to change news source:', err);
    error.value = '切換新聞來源失敗';
  }
};

// 重新載入新聞
const refreshNews = async () => {
  await loadHeadlines();
};

// 選擇新聞
const selectNews = (news) => {
  selectedNews.value = selectedNews.value === news ? null : news;
  if (selectedNews.value) {
    toGenerateQuestions();
  }
};

// 跳轉到題目生成頁面 - 修改這個函數
const toGenerateQuestions = () => {
  console.log('Generating questions for:', selectedNews.value);
  if (selectedNews.value) {
    try {
      // 將新聞資料編碼後放入 URL 參數
      const encodedNewsData = encodeURIComponent(JSON.stringify(selectedNews.value));
      router.push({
        name: 'QuizPage',
        params: {
          newsData: encodedNewsData
        }
      });
    } catch (error) {
      console.error('Failed to encode news data:', error);
      alert('跳轉失敗，請重試');
    }
  }
};

// 開啟新聞連結
const openNewsLink = (url) => {
  window.api.news.openExternalUrl(url);
};
</script>
