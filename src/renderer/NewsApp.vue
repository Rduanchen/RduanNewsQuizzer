<script setup>
// 在原有的 script 基礎上添加路由功能
import { useRouter } from 'vue-router';

const router = useRouter();

// 修改 selectNews 函數
const selectNews = (news) => {
  selectedNews.value = news;
  // 跳轉到答題頁面
  router.push({
    name: 'quiz',
    params: {
      newsData: encodeURIComponent(JSON.stringify(news))
    }
  });
};

// 其他現有的方法保持不變...
</script>
