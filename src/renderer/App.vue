<template>
  <v-app id="main">
    <v-app-bar>
      <v-app-bar-title @click="router.push('/')" style="cursor: pointer"
        >Rduan AI Reading Comprehension Generator</v-app-bar-title
      >
      <!-- <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon> -->
      <SettingsDialog @settings-updated="onSettingsUpdated" />
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import SettingsDialog from './components/SettingsDialog.vue';
import QuestionGeneratorDialog from './components/QuestionGeneratorDialog.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const hasApiKey = ref(false);

// 生命周期
onMounted(async () => {
  await checkApiKey();
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
</script>
