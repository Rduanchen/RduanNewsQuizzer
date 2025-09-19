<template>
  <v-app id="main">
    <v-app-bar color="primary">
      <v-app-bar-title @click="router.push('/')" style="cursor: pointer"
        >Rduan AI NewsQuizzer
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn to="/" prepend-icon="mdi-format-list-bulleted" class="mr-2">
        {{ $t('app.newsList') }}
      </v-btn>

      <v-btn @click="toggleLanguage" class="mr-2" variant="outlined">
        <v-icon start>mdi-translate</v-icon>
        <span>{{ currentLanguageName }}</span>
      </v-btn>

      <!-- MODIFICATION: Added Theme Switch Button -->
      <v-btn @click="toggleTheme" icon class="mr-2">
        <v-icon>{{ themeIcon }}</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ $t('app.toggleTheme') }}</v-tooltip>
      </v-btn>

      <SettingsDialog />
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useTheme } from 'vuetify'; // 1. 引入 useTheme
import SettingsDialog from './components/SettingsDialog.vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t, locale } = useI18n();
const theme = useTheme(); // 2. 初始化 theme hook

// --- Theme switching logic ---
const toggleTheme = () => {
  // 3. 切換 Vuetify 的全域主題
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
};

const themeIcon = computed(() => {
  // 4. 根據當前主題回傳對應的圖示
  return theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night';
});
// -----------------------------------------

// --- Language switching logic ---
const toggleLanguage = () => {
  // 修正：確保與您的 i18n 設定檔名 (zh-Hant) 一致
  locale.value = locale.value === 'en' ? 'zh-Hant' : 'en';
};

const currentLanguageName = computed(() => {
  return locale.value === 'en' ? 'English' : '繁體中文';
});
// -----------------------------------------

onMounted(async () => {});
</script>

<style scoped>
#main {
  max-height: 100vh;
  overflow-y: auto;
}
</style>