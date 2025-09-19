<template>
  <v-card class="pa-4" variant="tonal">
    <!-- Grade and Accuracy Section -->
    <v-row>
      <v-col cols="12" class="text-center">
        <v-avatar size="90" class="mb-3" :color="gradeColor">
          <span class="text-h2 font-weight-bold text-white">{{ grade }}</span>
        </v-avatar>
        <div class="text-h4 mb-2" :class="`text-${gradeColor}`">
          {{ $t('resultView.yourGrade') }}: {{ grade }}
        </div>
        <div class="text-h6 mb-1">
          {{ $t('resultView.accuracy') }}:
          <span :class="`text-${accuracyColor}`">{{ accuracy }}%</span>
        </div>
        <v-progress-linear
          :model-value="accuracy"
          height="20"
          :color="accuracyColor"
          class="mb-6"
          rounded
          striped
        ></v-progress-linear>
      </v-col>
    </v-row>

    <v-divider class="mb-4"></v-divider>

    <!-- Detailed Question Results -->
    <v-row dense>
      <v-col cols="12" v-for="(q, idx) in questions" :key="idx">
        <v-card class="mb-4" variant="outlined" :color="userCorrect[idx] ? 'success' : 'error'">
          <v-card-title class="d-flex align-start">
            <v-chip
              :color="userCorrect[idx] ? 'success' : 'error'"
              size="small"
              variant="tonal"
              class="mr-3 mt-1"
            >
              Q{{ idx + 1 }}
            </v-chip>
            <span class="question-title">{{ q.question }}</span>
          </v-card-title>

          <v-card-text>
            <div class="mb-3">
              <v-chip color="primary" size="small" class="mr-2">
                <v-icon size="small" start>mdi-timer-outline</v-icon>
                {{ $t('resultView.timeUsed') }}:
                <span class="font-weight-bold ml-1">{{ timeUsed[idx] }}s</span>
              </v-chip>
            </div>

            <v-list-item
              v-for="(opt, oidx) in q.options"
              :key="oidx"
              class="pa-0 mb-1"
              density="compact"
            >
              <template #prepend>
                <v-icon v-if="oidx === q.answer" color="success" class="mr-2" size="small"
                  >mdi-check-circle</v-icon
                >
                <v-icon
                  v-else-if="userAnswers[idx] === oidx"
                  color="error"
                  class="mr-2"
                  size="small"
                  >mdi-close-circle</v-icon
                >
                <v-icon v-else class="mr-2" size="small">mdi-circle-outline</v-icon>
              </template>
              <v-list-item-title :class="getOptionClass(idx, oidx)">
                {{ String.fromCharCode(65 + oidx) }}. {{ opt }}
              </v-list-item-title>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Retake Button -->
    <v-row>
      <v-col cols="12" class="text-center mt-4">
        <v-btn color="primary" size="large" @click="$emit('retake')">
          <v-icon start>mdi-refresh</v-icon>
          {{ $t('resultView.retake') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  questions: { type: Array, required: true },
  userAnswers: { type: Array, required: true },
  timeUsed: { type: Array, required: true }
});

defineEmits(['retake']);

const correctCount = computed(
  () => props.questions.filter((q, idx) => props.userAnswers[idx] === q.answer).length
);

const accuracy = computed(() =>
  props.questions.length > 0 ? Math.round((correctCount.value / props.questions.length) * 100) : 0
);

const grade = computed(() => {
  if (accuracy.value >= 90) return 'A';
  if (accuracy.value >= 80) return 'B';
  if (accuracy.value >= 70) return 'C';
  if (accuracy.value >= 60) return 'D';
  return 'F';
});

const gradeColor = computed(() => {
  switch (grade.value) {
    case 'A':
      return 'success';
    case 'B':
      return 'info';
    case 'C':
      return 'warning';
    case 'D':
      return 'orange';
    default:
      return 'error';
  }
});

const accuracyColor = computed(() => {
  if (accuracy.value >= 90) return 'success';
  if (accuracy.value >= 80) return 'info';
  if (accuracy.value >= 70) return 'warning';
  if (accuracy.value >= 60) return 'orange';
  return 'error';
});

const userCorrect = computed(() =>
  props.questions.map((q, idx) => props.userAnswers[idx] === q.answer)
);

const getOptionClass = (questionIndex, optionIndex) => {
  if (optionIndex === props.questions[questionIndex].answer) {
    return 'font-weight-bold text-success';
  }
  if (optionIndex === props.userAnswers[questionIndex]) {
    return 'text-decoration-line-through text-error';
  }
  return 'text-medium-emphasis';
};
</script>

<style scoped>
.question-title {
  font-size: 1.1rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
