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

    <!-- 新增功能區塊 -->
    <v-row class="mb-4">
      <!-- 貼上新聞連結 -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="newsUrl"
          label="貼上新聞連結"
          variant="outlined"
          prepend-inner-icon="mdi-link"
          placeholder="請貼上要分析的新聞連結"
          @keyup.enter="handlePasteNewsUrl"
          :loading="pastingNews"
        ></v-text-field>
        <v-btn
          color="primary"
          class="mt-2"
          :loading="pastingNews"
          :disabled="!newsUrl"
          @click="handlePasteNewsUrl"
        >
          <v-icon left>mdi-arrow-right</v-icon>
          送出連結
        </v-btn>
        <v-alert
          v-if="pasteError"
          type="error"
          variant="tonal"
          class="mt-2"
          closable
          @click:close="pasteError = ''"
        >
          {{ pasteError }}
        </v-alert>
      </v-col>
      <!-- 自訂文章 -->
      <!-- <v-col cols="12" md="6">
        <v-textarea
          v-model="customArticle"
          label="自訂文章內容"
          prepend-inner-icon="mdi-file-document-edit"
          variant="outlined"
          placeholder="請貼上或輸入你想分析的文章"
          rows="5"
          auto-grow
        ></v-textarea>
        <v-btn
          color="success"
          class="mt-2"
          :loading="customLoading"
          :disabled="!customArticle"
          @click="handleCustomArticle"
        >
          <v-icon left>mdi-arrow-right</v-icon>
          送出文章
        </v-btn>
        <v-alert
          v-if="customError"
          type="error"
          variant="tonal"
          class="mt-2"
          closable
          @click:close="customError = ''"
        >
          {{ customError }}
        </v-alert>
      </v-col> -->
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
          請檢查您的網絡連接或稍後再試。
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
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

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

// 新增：貼上新聞連結
const newsUrl = ref('');
const pastingNews = ref(false);
const pasteError = ref('');

// 新增：自訂文章
const customArticle = ref('');
const customLoading = ref(false);
const customError = ref('');

// 生命周期
onMounted(async () => {
  await loadNewsSources();
  await loadHeadlines();
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

// 載入新聞來源
const loadNewsSources = async () => {
  try {
    const sources = await window.api.news.getSources();
    newsSources.value = sources;
    newsSourceOptions.value = sources.map((source, index) => ({
      title: source,
      value: index
    }));
  } catch (err) {
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
    toGenerateQuestions(selectedNews.value);
  }
};

// 跳轉到題目生成頁面
const toGenerateQuestions = (news) => {
  if (news) {
    try {
      const encodedNewsData = encodeURIComponent(JSON.stringify(news));
      router.push({
        name: 'QuizPage',
        params: { newsData: encodedNewsData }
      });
    } catch (error) {
      alert('跳轉失敗，請重試');
    }
  }
};

// 開啟新聞連結
const openNewsLink = (url) => {
  window.api.news.openExternalUrl(url);
};

// 新增：貼上新聞連結功能
const handlePasteNewsUrl = async () => {
  if (!newsUrl.value) return;
  pastingNews.value = true;
  pasteError.value = '';
  try {
    // 使用者選擇的新聞來源
    const sourceIndex = selectedSourceIndex.value;

    // 這裡根據 sourceIndex 或 newsSources.value[sourceIndex] 決定用哪個爬蟲
    // 例如 window.api.news.getCustomNewsContent(sourceIndex, newsUrl)
    // 假設 window.api.news.getNewsContentBySource 會根據來源和連結爬取
    const result = await window.api.news.getNewsContentBySource(sourceIndex, newsUrl.value);
    if (result && result.success && result.data) {
      // 直接跳轉到 QuizPage 並傳遞資料
      toGenerateQuestions({
        coverUrl: null,
        title: result.data.title,
        description: result.data.description || '',
        newsLink: newsUrl.value,
        content: result.data.content,
        author: result.data.author || '',
        date: result.data.date || '',
        custom: true // 標記為自訂連結
      });
    } else {
      pasteError.value = result.error || '無法解析新聞連結';
    }
  } catch (err) {
    pasteError.value = err.message || '連結爬取失敗，請確認連結或來源是否正確';
  } finally {
    pastingNews.value = false;
  }
};

// 新增：自訂文章功能
const handleCustomArticle = async () => {
  if (!customArticle.value) return;
  customLoading.value = true;
  customError.value = '';
  try {
    // 直接傳遞文章內容到 QuizPage
    toGenerateQuestions({
      coverUrl: null,
      title: '自訂文章',
      description: customArticle.value.substring(0, 50) + '...',
      newsLink: '',
      content: customArticle.value,
      author: '',
      date: '',
      custom: true // 標記為自訂文章
    });
  } catch (err) {
    customError.value = err.message || '文章送出失敗';
  } finally {
    customLoading.value = false;
  }
};
</script>
