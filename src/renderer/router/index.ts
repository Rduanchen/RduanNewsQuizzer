import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Quiz from '../views/QuizPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/quiz/:newsData',
    name: 'QuizPage',
    component: Quiz,
    props: (route) => {
      try {
        // 解碼並解析 URL 參數中的新聞資料
        return {
          selectedNews: JSON.parse(decodeURIComponent(route.params.newsData))
        };
      } catch (error) {
        console.error('Failed to parse news data from URL:', error);
        return {
          selectedNews: null
        };
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
