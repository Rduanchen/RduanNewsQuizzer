<template>
  <v-app id="main">
    <v-app-bar>
      <v-app-bar-title @click="router.push('/')" style="cursor: pointer"
        >Rduan AI NewsQuizzer
      </v-app-bar-title>
      <SettingsDialog />
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
// 生命周期
onMounted(async () => {
});

</script>
