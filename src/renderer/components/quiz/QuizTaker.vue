<template>
  <v-card>
    <!-- Header with Timer -->
    <v-card-title class="sticky-header d-flex justify-space-between align-center">
      <span>{{ $t('quizTaker.title') }}</span>
      <div class="d-flex align-center">
        <v-icon start>mdi-timer-outline</v-icon>
        <span class="font-weight-bold">{{ formattedTime }}</span>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Questions -->
    <v-card-text style="max-height: 65vh; overflow-y: auto">
      <v-row dense>
        <v-col v-for="(question, index) in questions" :key="index" cols="12">
          <QuestionCard
            :question="question"
            :question-number="index + 1"
            :user-answer="userAnswers[index]?.answer"
            @answer-selected="(answer) => handleAnswer(index, answer)"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider></v-divider>

    <!-- Submit Button -->
    <v-card-actions class="pa-4">
      <v-btn
        color="success"
        variant="elevated"
        block
        @click="submitQuiz"
        :disabled="unansweredQuestions > 0"
      >
        {{ $t('quizTaker.submitButton') }}
        <span v-if="unansweredQuestions > 0" class="ml-2"
          >({{ unansweredQuestions }} {{ $t('quizTaker.unanswered') }})</span
        >
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, defineEmits } from 'vue'; // Added defineEmits
import { useI18n } from 'vue-i18n';
import QuestionCard from './QuestionCard.vue';

const { t } = useI18n();

const props = defineProps({
  questions: { type: Array, required: true }
});

// --- FIX: You must define emits to use the 'emit' function in <script setup> ---
const emit = defineEmits(['quiz-submitted']);

const userAnswers = ref([]);
const timeElapsed = ref(0);
let timerInterval = null;
let questionTimers = {};

// --- Timer Logic ---
const startTimer = () => {
  timerInterval = setInterval(() => {
    timeElapsed.value++;
  }, 1000);
};

const formattedTime = computed(() => {
  const minutes = Math.floor(timeElapsed.value / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeElapsed.value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
});

// --- Answer Handling Logic ---
const handleAnswer = (questionIndex, answerIndex) => {
  const endTime = new Date().getTime();
  const startTime = questionTimers[questionIndex] || new Date().getTime();
  const timeTaken = (endTime - startTime) / 1000;

  userAnswers.value[questionIndex] = {
    answer: answerIndex,
    timeTaken: timeTaken
  };

  if (questionIndex + 1 < props.questions.length && !questionTimers[questionIndex + 1]) {
    questionTimers[questionIndex + 1] = new Date().getTime();
  }
};

const unansweredQuestions = computed(() => {
  return props.questions.length - userAnswers.value.filter((a) => a !== undefined).length;
});

// --- Lifecycle Hooks ---
onMounted(() => {
  userAnswers.value = new Array(props.questions.length).fill(undefined);
  if (props.questions.length > 0) {
    questionTimers[0] = new Date().getTime();
  }
  startTimer();
});

onUnmounted(() => {
  clearInterval(timerInterval);
});

// --- Submission ---
const submitQuiz = () => {
  clearInterval(timerInterval);

  // Finalize any unrecorded times
  const lastAnsweredIndex = userAnswers.value.findLastIndex((a) => a !== undefined);
  if (lastAnsweredIndex !== -1 && userAnswers.value[lastAnsweredIndex].timeTaken === 0) {
    handleAnswer(lastAnsweredIndex, userAnswers.value[lastAnsweredIndex].answer);
  }

  // Prepare data for emission
  const finalAnswers = userAnswers.value.map((a) => (a ? a.answer : undefined));
  const finalTimeUsed = userAnswers.value.map((a) => (a ? parseFloat(a.timeTaken.toFixed(1)) : 0));

  emit('quiz-submitted', {
    userAnswers: finalAnswers,
    timeUsed: finalTimeUsed
  });
};
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-surface));
}
</style>
