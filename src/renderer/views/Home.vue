<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="auto">
        <v-btn-toggle v-model="toggle" mandatory>
          <v-btn @click="router.push('/online-source')">{{ $t('home.onlineSource') }}</v-btn>
          <v-btn @click="router.push('/self-upload')">{{ $t('home.selfUpload') }}</v-btn>
          <v-btn @click="router.push('/ai-generate')">{{ $t('home.aiGenerate') }}</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <router-view />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

// This ref will keep the button toggle in sync with the current route
const toggle = ref(0);

const pathToToggle = {
  '/online-source': 0,
  '/self-upload': 1,
  '/ai-generate': 2,
};

// Watch for route changes and update the toggle state
watch(
  () => route.path,
  (newPath) => {
    toggle.value = pathToToggle[newPath] ?? 0;
  },
  { immediate: true }
);
</script>