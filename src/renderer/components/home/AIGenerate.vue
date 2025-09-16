<template>
  <v-container fluid>
    <!-- Generation Form -->
    <v-card class="mb-6">
      <v-card-title>{{ $t('aiGenerate.formTitle') }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleGenerate">
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="formData.level"
                :items="levelOptions"
                :label="$t('aiGenerate.levelLabel')"
                variant="outlined"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.topic"
                :label="$t('aiGenerate.topicLabel')"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.wordCount"
                :label="$t('aiGenerate.wordCountLabel')"
                type="number"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-alert v-if="error" type="error" prominent class="mb-4">
            {{ error }}
          </v-alert>
          <v-btn
            :loading="isLoading"
            :disabled="!isFormValid"
            type="submit"
            color="primary"
            block
          >
            {{ generatedArticle ? $t('aiGenerate.regenerateButton') : $t('aiGenerate.generateButton') }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Display Generated Article -->
    <v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>
    
    <v-card v-if="!isLoading && generatedArticle">
      <v-card-title>{{ generatedArticle.title }}</v-card-title>
      <v-card-text>
        <p style="white-space: pre-wrap;">{{ generatedArticle.content }}</p>
      </v-card-text>
    </v-card>

  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// --- Reactive State ---
const formData = ref({
  level: 'B1',
  topic: '',
  wordCount: 200,
});
const levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const generatedArticle = ref(null);
const isLoading = ref(false);
const error = ref('');

// --- API Communication ---
const api = window.api.news;

// --- Computed Properties ---
const isFormValid = computed(() => {
  return formData.value.topic.trim() !== '' && formData.value.wordCount > 0;
});

// --- Logic ---
const handleGenerate = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;
  error.value = '';
  generatedArticle.value = null; // Clear previous article

  try {
    const reply = await api.generateArticleContent({
      level: formData.value.level,
      topic: formData.value.topic,
      wordCount: formData.value.wordCount,
    });

    if (reply.statusCode === 200) {
      generatedArticle.value = reply.data;
    } else {
      throw new Error(reply.message || t('aiGenerate.errorDefault'));
    }
  } catch (err) {
    error.value = `${t('aiGenerate.errorPrefix')}: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};
</script>