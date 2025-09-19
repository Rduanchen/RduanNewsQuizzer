<template>
  <v-app id="main">
    <v-app-bar color="primary" dark>
      <v-app-bar-title @click="router.push('/')" style="cursor: pointer"
        >Rduan AI NewsQuizzer
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn to="/" prepend-icon="mdi-format-list-bulleted" class="mr-2">
        {{ $t('app.newsList') }}
      </v-btn>

      <!-- MODIFICATION: Added Language Switch Button -->
      <v-btn @click="toggleLanguage" class="mr-2" variant="outlined">
        <v-icon start>mdi-translate</v-icon>
        <span>{{ currentLanguageName }}</span>
      </v-btn>

      <SettingsDialog />
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, computed } from 'vue'; // Import computed
import SettingsDialog from './components/SettingsDialog.vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t, locale } = useI18n(); // Get locale from useI18n

// --- MODIFICATION: Language switching logic ---
const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'zh' : 'en';
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
