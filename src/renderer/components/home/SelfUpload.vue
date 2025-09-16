<template>
  <v-container fluid>
    <v-card>
      <v-card-title>{{ $t('selfUpload.formTitle') }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.title"
                :label="$t('selfUpload.titleLabel')"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.content"
                :label="$t('selfUpload.contentLabel')"
                variant="outlined"
                rows="15"
                auto-grow
                required
              ></v-textarea>
            </v-col>
          </v-row>
          <v-btn
            :disabled="!isFormValid"
            type="submit"
            color="primary"
            block
          >
            {{ $t('selfUpload.submitButton') }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'; // Import useRouter

const { t } = useI18n();
const router = useRouter(); // Initialize the router

// --- Reactive State ---
const formData = ref({
  title: '',
  content: '',
});

// --- Computed Properties ---
const isFormValid = computed(() => {
  return formData.value.title.trim() !== '' && formData.value.content.trim() !== '';
});

// --- Logic ---
const handleSubmit = () => {
  if (!isFormValid.value) return;

  // Construct the data object for the QuizPage
  // We only have title and content, the other fields will be undefined
  const quizData = {
    title: formData.value.title,
    article: formData.value.content,
    // author, date, and coverImage are missing, which is fine
  };

  // Navigate to the QuizPage and pass the data as a route parameter
  router.push({
    name: 'QuizPage',
    params: { quizData: JSON.stringify(quizData) },
  });
};
</script>