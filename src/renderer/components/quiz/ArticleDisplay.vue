<template>
  <v-card height="100%" style="overflow-y: auto;">
    <v-card-title class="sticky-header">
      <div class="d-flex align-items-center">
        <span class="text-h6">{{ $t('articleDisplay.title') }}</span>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <div v-if="articleData">
      <!-- Article Header -->
      <v-card-text class="pb-0">
        <h1 class="text-h4 font-weight-bold mb-4" style="line-height: 1.3">
          {{ articleData.title }}
        </h1>

        <div class="d-flex align-items-center flex-wrap mb-4">
          <v-chip v-if="articleData.author" color="info" size="small" class="mr-2 mb-2">
            <v-icon start size="small">mdi-account</v-icon>
            {{ articleData.author }}
          </v-chip>
          <v-chip v-if="articleData.date" color="success" size="small" class="mr-2 mb-2">
            <v-icon start size="small">mdi-calendar</v-icon>
            {{ formatDate(articleData.date) }}
          </v-chip>
        </div>

        <!-- Cover Image -->
        <v-img
          v-if="articleData.coverImage"
          :src="articleData.coverImage"
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

      <!-- Article Content -->
      <v-card-text>
        <div class="article-content" v-html="formatContent(articleData.article)"></div>
      </v-card-text>
    </div>
    
    <!-- Fallback if no data -->
    <v-card-text v-else class="text-center py-8">
      <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
      <p class="text-h6 mt-4">{{ $t('articleDisplay.noContent') }}</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  articleData: {
    type: Object,
    required: true,
  },
});

// Helper function to format the date string
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Using a simple format, can be adjusted
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString; // Return original string if parsing fails
  }
};

// Helper function to format the article content into paragraphs
const formatContent = (content) => {
  if (!content) return '';
  return content
    .split('\n')
    .filter((paragraph) => paragraph.trim())
    .map(
      (paragraph) =>
        `<p class="mb-4">${paragraph.trim()}</p>`
    )
    .join('');
};
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 2;
  /* Using Vuetify's theme background color is better for dark/light mode */
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.article-content {
  font-size: 1rem;
  line-height: 1.75;
}

/* Use :deep() to style the v-html content */
.article-content :deep(p) {
  margin-bottom: 1rem;
}
</style>