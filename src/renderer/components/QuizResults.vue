<template>
  <v-card>
    <!-- 成績總覽 -->
    <v-card-title class="text-center">
      <v-icon :color="scoreColor" size="64" class="mb-4">
        {{ scoreIcon }}
      </v-icon>
      <div class="text-h4" :class="scoreColor + '--text'">{{ score }} / {{ questions.length }}</div>
      <div class="text-h6 mt-2">正確率：{{ scorePercentage }}%</div>
    </v-card-title>

    <v-card-text class="text-center">
      <v-chip :color="gradeColor" size="large" class="mb-4">
        {{ gradeText }}
      </v-chip>

      <p class="text-body-1 mb-4">{{ encouragementText }}</p>

      <!-- 詳細統計 -->
      <v-row class="mt-6">
        <v-col cols="3">
          <v-card variant="tonal" color="success">
            <v-card-text class="text-center">
              <v-icon color="success" size="32">mdi-check-circle</v-icon>
              <div class="text-h6 mt-2">{{ score }}</div>
              <div class="text-caption">正確</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="3">
          <v-card variant="tonal" color="error">
            <v-card-text class="text-center">
              <v-icon color="error" size="32">mdi-close-circle</v-icon>
              <div class="text-h6 mt-2">{{ questions.length - score }}</div>
              <div class="text-caption">錯誤</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="3">
          <v-card variant="tonal" color="info">
            <v-card-text class="text-center">
              <v-icon color="info" size="32">mdi-clock</v-icon>
              <div class="text-h6 mt-2">{{ formatTime(totalTime) }}</div>
              <div class="text-caption">用時</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="3">
          <v-card variant="tonal" color="warning">
            <v-card-text class="text-center">
              <v-icon color="warning" size="32">mdi-speedometer</v-icon>
              <div class="text-h6 mt-2">{{ averageTime }}</div>
              <div class="text-caption">平均/題</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- 操作按鈕 -->
    <v-card-actions class="justify-center">
      <v-btn color="primary" variant="outlined" @click="$emit('retry')" class="mr-2">
        <v-icon left>mdi-refresh</v-icon>
        重新答題
      </v-btn>

      <v-btn color="success" variant="elevated" @click="$emit('new-quiz')">
        <v-icon left>mdi-plus</v-icon>
        生成新題目
      </v-btn>
    </v-card-actions>

    <!-- 測驗報告 -->
    <v-divider class="mt-4"></v-divider>
    <v-expansion-panels variant="accordion" class="mt-4">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon left>mdi-chart-line</v-icon>
          測驗報告
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <QuizReport
            :questions="questions"
            :userAnswers="userAnswers"
            :score="score"
            :totalTime="totalTime"
            :settings="settings"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon left>mdi-format-list-bulleted</v-icon>
          詳細解答
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <QuestionCard
            v-for="(question, index) in questions"
            :key="index"
            :question="question"
            :questionNumber="index + 1"
            :userAnswer="userAnswers[index]"
            :disabled="true"
            :showResult="true"
            class="mb-3"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import QuestionCard from './QuestionCard.vue';
import QuizReport from './QuizReport.vue';

const props = defineProps({
  questions: Array,
  userAnswers: Object,
  score: Number,
  totalTime: Number,
  settings: Object
});

defineEmits(['retry', 'new-quiz']);

// 計算屬性
const scorePercentage = computed(() => {
  return Math.round((props.score / props.questions.length) * 100);
});

const scoreColor = computed(() => {
  const percentage = scorePercentage.value;
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'warning';
  return 'error';
});

const scoreIcon = computed(() => {
  const percentage = scorePercentage.value;
  if (percentage >= 80) return 'mdi-trophy';
  if (percentage >= 60) return 'mdi-thumb-up';
  return 'mdi-thumb-down';
});

const gradeColor = computed(() => {
  const percentage = scorePercentage.value;
  if (percentage >= 90) return 'success';
  if (percentage >= 80) return 'info';
  if (percentage >= 70) return 'warning';
  if (percentage >= 60) return 'orange';
  return 'error';
});

const gradeText = computed(() => {
  const percentage = scorePercentage.value;
  if (percentage >= 90) return '優秀';
  if (percentage >= 80) return '良好';
  if (percentage >= 70) return '尚可';
  if (percentage >= 60) return '及格';
  return '需加強';
});

const encouragementText = computed(() => {
  const percentage = scorePercentage.value;
  if (percentage >= 90) return '太棒了！你對這篇文章的理解非常深刻！';
  if (percentage >= 80) return '很好！你已經很好地理解了文章內容。';
  if (percentage >= 70) return '不錯！繼續努力，你會做得更好。';
  if (percentage >= 60) return '加油！多閱讀多練習會幫助你提升理解能力。';
  return '別灰心！閱讀理解需要多加練習，你一定可以進步的！';
});

const averageTime = computed(() => {
  if (props.questions.length === 0) return '0:00';
  const avgSeconds = Math.floor(props.totalTime / props.questions.length);
  return formatTime(avgSeconds);
});

// 格式化時間
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>
