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

const { t } = useI18n();

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

  // For now, we just log the data to the console.
  // In the future, you would call your backend API here.
  console.log('Submitting user-provided article:', formData.value);
  alert('Quiz generation from custom text is not yet implemented.');
};
</script>