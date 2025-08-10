// import './assets/main.css'
import { createApp } from 'vue';
import App from './App.vue';
const app = createApp(App);

import router from './router';

import { createPinia } from 'pinia';
const pinia = createPinia();
app.use(pinia);

import vuetify from './plugins/vuetify.js';
app.use(vuetify);
app.use(router);
app.mount('#app');
