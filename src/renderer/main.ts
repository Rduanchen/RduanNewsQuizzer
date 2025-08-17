// import './assets/main.css'
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
const app = createApp(App);

import router from './router';

import { createPinia } from 'pinia';
const pinia = createPinia();
app.use(pinia);

const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: 'en',
  fallbackLocale: 'ja',
  messages: {
    en: {
      message: {
        hello: 'hello world'
      }
    },
    ja: {
      message: {
        hello: 'こんにちは、世界'
      }
    }
  }
});
app.use(i18n);

import vuetify from './plugins/vuetify.js';
app.use(vuetify);
app.use(router);
app.mount('#app');
