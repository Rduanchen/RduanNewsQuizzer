// import { createRouter, createWebHashHistory } from 'vue-router';
// import Home from '../views/Home.vue';
// import Quiz from '../views/QuizPage.vue';

// const routes = [
//   {
//     path: '/',
//     name: 'Home',
//     component: Home
//   },
//   {
//     path: '/quiz/:newsData',
//     name: 'QuizPage',
//     component: Quiz,
//     props: (route) => {
//       try {
//         // 解碼並解析 URL 參數中的新聞資料
//         return {
//           selectedNews: JSON.parse(decodeURIComponent(route.params.newsData))
//         };
//       } catch (error) {
//         console.error('Failed to parse news data from URL:', error);
//         return {
//           selectedNews: null
//         };
//       }
//     }
//   }
// ];

// const router = createRouter({
//   history: createWebHashHistory(),
//   routes
// });

// export default router;

import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import OnlineSource from '../components/home/OnlineSource.vue';
import SelfUpload from '../components/home/SelfUpload.vue';
import AIGenerate from '../components/home/AIGenerate.vue';
import QuizPage from '../views/QuizPage.vue';

const routes = [
  {
    path: '/',
    component: Home,
    // Redirect the base path to the first nested route
    redirect: '/online-source',
    children: [
      {
        path: 'online-source',
        name: 'OnlineSource',
        component: OnlineSource
      },
      {
        path: 'self-upload',
        name: 'SelfUpload',
        component: SelfUpload
      },
      {
        path: 'ai-generate',
        name: 'AIGenerate',
        component: AIGenerate
      }
    ]
  },
  {
    // Note the ':quizData?' to make the parameter optional
    path: '/quiz/:quizData?',
    name: 'QuizPage',
    component: QuizPage,
    props: true // This allows the route params to be passed as props
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
