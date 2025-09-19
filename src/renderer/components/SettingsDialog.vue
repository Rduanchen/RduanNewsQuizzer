<template>
  <v-dialog v-model="dialog" max-width="700px" persistent>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon="mdi-cog" variant="text"></v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h5">{{ $t('settingsDialog.systemSettings') }}</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- 題目設定區塊 -->
          <v-divider class="mb-3"></v-divider>
          <div class="mb-3 font-weight-bold">{{ $t('settingsDialog.questionSettings') }}</div>
          <v-slider
            v-model="questionSettings.questionAmount"
            :label="$t('settingsDialog.questionAmount')"
            min="1"
            max="20"
            step="1"
            thumb-label="always"
            class="mb-3"
          ></v-slider>
          <v-select
            v-model="questionSettings.questionStyle"
            :items="questionStyles"
            item-title="name"
            item-value="name"
            :label="$t('settingsDialog.questionStyle')"
            multiple
            variant="outlined"
            class="mb-3"
            :loading="loadingOptions"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>
          <v-select
            v-model="questionSettings.testStyle"
            :items="testStyles"
            item-title="name"
            item-value="name"
            :label="$t('settingsDialog.testStyle')"
            variant="outlined"
            class="mb-3"
            :loading="loadingOptions"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>

          <!-- 來源切換 -->
          <v-divider class="mb-3"></v-divider>
          <div class="mb-3 font-weight-bold">{{ $t('settingsDialog.llmSourceSelect') }}</div>
          <v-btn-toggle
            v-model="currentSource"
            mandatory
            class="mb-3"
            color="primary"
          >
            <v-btn v-for="src in llmSources" :key="src" :value="src">{{ src }}</v-btn>
          </v-btn-toggle>

          <!-- 來源特定設定 -->
          <v-divider class="mb-3"></v-divider>
          <div v-if="currentSource === 'OpenAI'">
            <div class="mb-2 font-weight-bold">{{ $t('settingsDialog.openaiSettings') }}</div>
            <v-text-field
              v-model="openaiSettings.apiKey"
              :label="$t('settingsDialog.apiKey')"
              :type="showApiKey ? 'text' : 'password'"
              :append-icon="showApiKey ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showApiKey = !showApiKey"
              :rules="apiKeyRules"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
            <v-select
              v-model="openaiSettings.model"
              :items="openaiModels"
              item-title="displayName"
              item-value="id"
              :label="$t('settingsDialog.model')"
              variant="outlined"
              class="mb-3"
              :loading="loadingOptions"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-chip
                      :color="item.raw.category === 'GPT-5' ? 'primary' : 'secondary'"
                      size="small"
                    >
                      {{ item.raw.category }}
                    </v-chip>
                  </template>
                  <v-list-item-title>
                    {{ item.raw.displayName || item.raw.id }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t('settingsDialog.pricePerQuestion') }} ${{ item.raw.price || '-' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
            <v-select
              v-model="openaiSettings.reasoningEffort"
              :items="reasoningEfforts"
              item-title="title"
              item-value="value"
              :label="$t('settingsDialog.reasoningEffort')"
              variant="outlined"
              class="mb-3"
              :loading="loadingOptions"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </div>
          <div v-else-if="currentSource === 'LMStudio'">
            <div class="mb-2 font-weight-bold">{{ $t('settingsDialog.lmstudioSettings') }}</div>
            <v-text-field
              v-model="lmStudioSettings.model"
              :label="$t('settingsDialog.lmstudioModelName')"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
          </div>

          <!-- 錯誤訊息 -->
          <v-alert
            v-if="errorMsg"
            type="error"
            class="mb-3"
            border="start"
            border-color="red"
            prominent
          >
            {{ errorMsg }}
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="closeDialog">{{ $t('settingsDialog.cancel') }}</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="manualSave"
          :loading="saving"
        >
          {{ $t('settingsDialog.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'settings-updated']);
const dialog = ref(props.modelValue);
const valid = ref(true);
const loadingOptions = ref(false);
const saving = ref(false);
const errorMsg = ref('');
const showApiKey = ref(false);
// 題目設定
const questionSettings = ref({
  questionAmount: 10,
  questionStyle: [],
  testStyle: 'ALL'
});
const questionStyles = ref([]);
const testStyles = ref([]);
// AI 來源
const llmSources = ref([]);
const currentSource = ref('OpenAI');
// OpenAI 設定
const openaiSettings = ref({
  apiKey: '',
  model: '',
  reasoningEffort: 'low'
});
const openaiModels = ref([]);
const reasoningEfforts = ref([]);
const apiKeyRules = [
  (v) => !!v || 'API Key 為必填項目',
  (v) => v.startsWith('sk-') || 'API Key 應以 sk- 開頭'
];
// LM Studio 設定
const lmStudioSettings = ref({ model: '' });
let timer = null;
const syncInterval = 2000;
// 初始化與載入
onMounted(async () => {
  await loadAllOptions();
  await getCurrentQuestionSettings();
});
watch(() => props.modelValue, (val) => {
  dialog.value = val;
  if (val) getCurrentQuestionSettings();
  else stopAutoSync();
});
watch(dialog, (val) => {
  emit('update:modelValue', val);
  if (!val) stopAutoSync();
});
const loadAllOptions = async () => {
  loadingOptions.value = true;
  try {
    const llmSourceRes = await window.api.settings.getLLMSourcesOptions();
    if (llmSourceRes.statusCode === 200 && Array.isArray(llmSourceRes.data)) {
      llmSources.value = llmSourceRes.data;
      currentSource.value = llmSources.value[0] || 'OpenAI';
    }
    const openaiOptionsRes = await window.api.settings.getOpenAIOptions();
    if (openaiOptionsRes.statusCode === 200) {
      openaiModels.value = openaiOptionsRes.data.models.map((m) => ({
        ...m,
        displayName: m.displayName || m.id
      }));
      reasoningEfforts.value = openaiOptionsRes.data.reasoningEfforts;
    } else {
      errorMsg.value = openaiOptionsRes.message;
    }
    const qOptionRes = await window.api.settings.getQuestionSettings();
    if (qOptionRes.statusCode === 200 && qOptionRes.data) {
      questionStyles.value = qOptionRes.data.questionStyles || [];
      testStyles.value = qOptionRes.data.testStyles || [];
    }
  } catch (e) {
    errorMsg.value = '選項載入失敗';
  } finally {
    loadingOptions.value = false;
  }
};
const getCurrentQuestionSettings = async () => {
  errorMsg.value = '';
  try {
    const qRes = await window.api.settings.getCurrentQuestionSettings();
    if (qRes.statusCode === 200 && qRes.data) {
      questionSettings.value.questionAmount = qRes.data.questionAmount ?? 10;
      questionSettings.value.testStyle = qRes.data.testStyle ?? 'ALL';
      questionSettings.value.questionStyle = Array.isArray(qRes.data.questionStyle)
        ? qRes.data.questionStyle
        : [];
    }
    const llmRes = await window.api.settings.getCurrentLLMOption();
    if (llmRes.statusCode === 200 && llmRes.data?.source) {
      currentSource.value = llmRes.data.source;
    }
    const openaiRes = await window.api.settings.getOpenAISettings();
    if (openaiRes.statusCode === 200 && openaiRes.data) {
      Object.assign(openaiSettings.value, openaiRes.data);
    }
    const lmRes = await window.api.settings.getLMStudioSettings();
    if (lmRes.statusCode === 200 && lmRes.data) {
      Object.assign(lmStudioSettings.value, lmRes.data);
    }
  } catch (e) {
    errorMsg.value = '設定載入失敗';
  }
};
const stopAutoSync = () => { if (timer) clearInterval(timer); };
const applySettings = async () => {
  errorMsg.value = '';
  let result;
  const sendQuestionSettings = {
    questionAmount: questionSettings.value.questionAmount,
    questionStyle: questionSettings.value.questionStyle,
    testStyle: questionSettings.value.testStyle
  };
  result = await window.api.settings.updateQuestionSettings(JSON.parse(JSON.stringify(sendQuestionSettings)));
  if (result.statusCode !== 200) { errorMsg.value = result.message; return; }
  result = await window.api.settings.setCurrentLLMOption({ source: currentSource.value });
  if (result.statusCode !== 200) { errorMsg.value = result.message; return; }
  if (currentSource.value === 'OpenAI') {
    result = await window.api.settings.updateOpenAISettings({ ...openaiSettings.value });
    if (result.statusCode !== 200) { errorMsg.value = result.message; return; }
  } else if (currentSource.value === 'LMStudio') {
    result = await window.api.settings.updateLMStudioSettings({ ...lmStudioSettings.value });
    if (result.statusCode !== 200) { errorMsg.value = result.message; return; }
  }
};
const manualSave = async () => {
  saving.value = true;
  await applySettings();
  saving.value = false;
  if (!errorMsg.value) {
    emit('settings-updated');
    dialog.value = false;
  }
};
const closeDialog = () => {
  dialog.value = false;
  stopAutoSync();
  getCurrentQuestionSettings();
};
</script>