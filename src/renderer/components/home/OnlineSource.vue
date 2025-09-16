<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-select
          v-model="selectedSource"
          :items="sources"
          :label="$t('onlineSource.sourceSelectLabel')"
          :loading="isLoadingSources"
          item-title="name"
          item-value="index"
          return-object
          @update:modelValue="handleSourceSelection"
          variant="outlined"
        ></v-select>
      </v-col>
    </v-row>

    <v-progress-linear v-if="isLoadingHeadlines" indeterminate color="primary"></v-progress-linear>

    <v-alert v-if="error" type="error" prominent class="my-4">
      {{ error }}
    </v-alert>

    <v-row v-if="!isLoadingHeadlines && headlines.length > 0">
      <v-col v-for="(news, index) in headlines" :key="index" cols="12" sm="6" md="4" lg="3">
        <NewsCard :news="news" />
      </v-col>
    </v-row>

    <v-row v-if="!isLoadingHeadlines && headlines.length === 0 && hasSelectedSource" justify="center">
        <v-col cols="auto" class="text-center">
            <p>{{ $t('onlineSource.noHeadlines') }}</p>
        </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import NewsCard from '../NewsCard.vue';

const { t } = useI18n();

// --- Reactive State ---
const sources = ref([]);
const selectedSource = ref(null);
const headlines = ref([]);
const isLoadingSources = ref(false);
const isLoadingHeadlines = ref(false);
const hasSelectedSource = ref(false);
const error = ref('');

// --- API Communication ---
const api = window.api.news; 

// --- Logic ---
const fetchSources = async () => {
  isLoadingSources.value = true;
  error.value = '';
  try {
    const reply = await api.getSources();
    if (reply.statusCode === 200 && reply.data && reply.data.length > 0) {
      sources.value = reply.data.map((name, index) => ({ name, index }));
      
      // --- MODIFICATION START ---
      // Set the first source as the default selection
      const defaultSource = sources.value[0];
      selectedSource.value = defaultSource;
      // Automatically fetch headlines for the default source
      await handleSourceSelection(defaultSource);
      // --- MODIFICATION END ---

    } else if (reply.statusCode !== 200) {
      throw new Error(reply.message || 'Failed to fetch sources');
    }
    // If reply.data is empty or null, the dropdown will simply remain empty.
  } catch (err) {
    error.value = `${t('onlineSource.errorSources')}: ${err.message}`;
  } finally {
    isLoadingSources.value = false;
  }
};

const fetchHeadlines = async () => {
    isLoadingHeadlines.value = true;
    error.value = '';
    headlines.value = [];
    try {
        const reply = await api.getHeadlines();
        if (reply.statusCode === 200) {
            headlines.value = reply.data;
        } else {
            throw new Error(reply.message || 'Failed to fetch headlines');
        }
    } catch (err) {
        error.value = `${t('onlineSource.errorHeadlines')}: ${err.message}`;
    } finally {
        isLoadingHeadlines.value = false;
    }
}

const handleSourceSelection = async (source) => {
  if (!source) return;
  
  hasSelectedSource.value = true;
  // Set loading state for headlines, but don't clear them yet for a smoother UI
  isLoadingHeadlines.value = true; 
  error.value = '';
  try {
    const reply = await api.selectSource(source.index);
    if (reply.statusCode !== 200) {
        throw new Error(reply.message || 'Failed to select source');
    }
    await fetchHeadlines();
  } catch (err) {
    error.value = `${t('onlineSource.errorSelect')}: ${err.message}`;
    isLoadingHeadlines.value = false;
    headlines.value = []; // Clear headlines on error
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchSources();
});
</script>