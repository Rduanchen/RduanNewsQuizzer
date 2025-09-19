<template>
  <v-card>
    <v-card-title class="text-h5">{{ $t('settingsPreview.title') }}</v-card-title>
    <v-card-text>
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
      <v-list v-if="!isLoading" lines="two" density="compact">
        <!-- Question Settings -->
        <v-list-subheader>{{ $t('settingsPreview.questionSettings') }}</v-list-subheader>
        <v-list-item
          :title="$t('settingsPreview.questionAmount')"
          :subtitle="settings.questionAmount"
        ></v-list-item>
        <v-list-item
          :title="$t('settingsPreview.testStyle')"
          :subtitle="settings.testStyle"
        ></v-list-item>
        <v-list-item :title="$t('settingsPreview.questionStyle')">
          <template #subtitle>
            <v-chip
              v-for="style in settings.questionStyle"
              :key="style"
              size="small"
              class="mr-1 mt-1"
            >
              {{ style }}
            </v-chip>
            <span v-if="!settings.questionStyle || settings.questionStyle.length === 0">{{
              $t('settingsPreview.notSet')
            }}</span>
          </template>
        </v-list-item>

        <!-- AI Settings -->
        <v-list-subheader>{{ $t('settingsPreview.aiSettings') }}</v-list-subheader>
        <v-list-item
          :title="$t('settingsPreview.aiSource')"
          :subtitle="settings.llmSource"
        ></v-list-item>

        <!-- OpenAI Specific -->
        <template v-if="settings.llmSource === 'OpenAI'">
          <v-list-item
            :title="$t('settingsPreview.model')"
            :subtitle="settings.openaiModel"
          ></v-list-item>
          <v-list-item
            :title="$t('settingsPreview.reasoningEffort')"
            :subtitle="settings.reasoningEffort"
          ></v-list-item>
        </template>

        <!-- LM Studio Specific -->
        <template v-if="settings.llmSource === 'LMStudio'">
          <v-list-item
            :title="$t('settingsPreview.model')"
            :subtitle="settings.lmStudioModel"
          ></v-list-item>
        </template>
      </v-list>

      <v-skeleton-loader v-else type="list-item-two-line@4"></v-skeleton-loader>
    </v-card-text>
    <v-card-actions class="pa-4">
      <v-btn
        :loading="isCheckingService || isLoading"
        :disabled="!isServiceReady"
        color="primary"
        variant="elevated"
        block
        @click="$emit('start-quiz')"
      >
        {{ $t('settingsPreview.startButton') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';

defineEmits(['start-quiz']);

const { t } = useI18n();
const settings = ref({});
const isLoading = ref(true);
const isCheckingService = ref(true);
const isServiceReady = ref(false);
const error = ref('');

const fetchAllSettings = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const [qRes, llmRes, openaiRes, lmRes] = await Promise.all([
      window.api.settings.getCurrentQuestionSettings(),
      window.api.settings.getCurrentLLMOption(),
      window.api.settings.getOpenAISettings(),
      window.api.settings.getLMStudioSettings()
    ]);

    settings.value = {
      questionAmount: qRes.data?.questionAmount ?? 'N/A',
      testStyle: qRes.data?.testStyle ?? 'N/A',
      questionStyle: qRes.data?.questionStyle ?? [],
      llmSource: llmRes.data?.source ?? 'N/A',
      openaiModel: openaiRes.data?.model ?? 'N/A',
      reasoningEffort: openaiRes.data?.reasoningEffort ?? 'N/A',
      lmStudioModel: lmRes.data?.model ?? 'N/A'
    };
  } catch (e) {
    error.value = t('settingsPreview.errorLoading');
  } finally {
    isLoading.value = false;
  }
};

const checkServiceStatus = async () => {
  isCheckingService.value = true;
  try {
    const reply = await window.api.settings.isReadyToGenerate();
    if (reply.statusCode === 200) {
      isServiceReady.value = true;
    } else {
      isServiceReady.value = false;
      error.value = reply.message || t('settingsPreview.serviceNotReady');
    }
  } catch (e) {
    isServiceReady.value = false;
    error.value = t('settingsPreview.serviceNotReady');
  } finally {
    isCheckingService.value = false;
  }
};

onMounted(async () => {
  await fetchAllSettings();
  await checkServiceStatus();
});

const handleStart = () => {
  // Logic for starting the quiz generation will go here
  console.log('Start button clicked. Service is ready.');
  alert('Quiz generation started!');
};
</script>
