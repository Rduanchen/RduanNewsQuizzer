<template>
  <v-card height="100%" style="overflow-y: auto">
    <v-card-title class="sticky-header">
      <div class="d-flex align-items-center">
        <!-- <v-chip color="primary" size="small" class="mr-3">BBC News</v-chip> -->
        <span class="text-h6">文章內容</span>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="text-h6 mt-4">載入文章內容中...</p>
    </v-card-text>

    <v-card-text v-else-if="error" class="text-center py-8">
      <v-icon size="64" color="error">mdi-alert-circle</v-icon>
      <p class="text-h6 mt-4 error--text">載入失敗</p>
      <p class="text-body-2 mb-4">{{ error }}</p>
      <v-btn color="primary" variant="elevated" @click="loadContent">
        <v-icon left>mdi-refresh</v-icon>
        重新載入
      </v-btn>
    </v-card-text>

    <div v-else-if="newsContent">
      <!-- 文章標題和資訊 -->
      <v-card-text class="pb-0">
        <h1 class="text-h4 font-weight-bold mb-4" style="line-height: 1.3">
          {{ newsContent.title }}
        </h1>

        <div class="d-flex align-items-center mb-4">
          <v-chip color="info" size="small" class="mr-2">
            <v-icon left size="small">mdi-account</v-icon>
            {{ newsContent.author || '未知作者' }}
          </v-chip>
          <v-chip color="success" size="small">
            <v-icon left size="small">mdi-calendar</v-icon>
            {{ formatDate(newsContent.date) }}
          </v-chip>
        </div>

        <!-- 新聞圖片 -->
        <v-img
          v-if="coverUrl"
          :src="coverUrl"
          height="250"
          cover
          class="mb-4"
          style="border-radius: 12px"
        >
          <template #error>
            <div class="d-flex align-items-center justify-center h-100 bg-grey-lighten-2">
              <v-icon size="48" color="grey">mdi-image-broken</v-icon>
            </div>
          </template>
        </v-img>
      </v-card-text>

      <v-divider class="mx-4 mb-4"></v-divider>

      <!-- 文章內容 -->
      <v-card-text>
        <div class="article-content" v-html="formatContent(newsContent.content)"></div>
      </v-card-text>
    </div>

    <v-card-text v-else class="text-center py-8">
      <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
      <p class="text-h6 mt-4">準備載入文章</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  newsLink: {
    type: String,
    required: true,
    validator: (value) => {
      return value && value.startsWith('http');
    }
  },
  coverUrl: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['content-loaded']);

// 響應式數據
const loading = ref(false);
const error = ref('');
const newsContent = ref(null);

// 載入內容
const loadContent = async () => {
  if (!props.newsLink) return;

  loading.value = true;
  error.value = '';

  try {
    const response = await window.api.questions.getNewsContent(props.newsLink);
    console.log('News content loaded:', response);
    if (response.success) {
      newsContent.value = response.data;
      emit('content-loaded', response.data);
    } else {
      throw new Error(response.error || '載入文章失敗');
    }
  } catch (err) {
    console.error('Failed to load news content:', err);
    error.value = err.message || '載入文章時發生未知錯誤';
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadContent();
});

// 監聽 newsLink 變化

watch(
  () => props.newsLink,
  (newVal) => {
    if (newVal && newVal.startsWith('http')) {
      loadContent();
    } else {
      error.value = '無效的新聞連結';
    }
  },
  { immediate: true }
);

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知日期';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// 格式化內容
const formatContent = (content) => {
  if (!content) return '';

  return content
    .split('\n')
    .filter((paragraph) => paragraph.trim())
    .map(
      (paragraph) =>
        `<p class="mb-4" style="line-height: 1.8; text-align: justify;">${paragraph.trim()}</p>`
    )
    .join('');
};
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #ccc;
  text-align: justify;
}

.article-content :deep(p) {
  margin-bottom: 16px;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
}
</style>
