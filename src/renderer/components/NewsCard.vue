<template>
  <v-card class="d-flex flex-column" height="100%" hover>
    <v-img
      :src="news.coverUrl || defaultImage"
      class="align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      height="200px"
      cover
    >
      <v-card-title class="text-white">{{ news.title }}</v-card-title>
    </v-img>

    <v-card-text class="flex-grow-1">
      {{ news.description }}
    </v-card-text>

    <v-card-actions>
      <v-btn color="primary" variant="text" @click.stop="openLink">
        {{ $t('newsCard.readMore') }}
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn 
        :loading="loading"
        color="primary" 
        variant="elevated" 
        @click.stop="$emit('select', news)"
      >
        {{ $t('newsCard.select') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  news: {
    type: Object,
    required: true,
    default: () => ({
      coverUrl: '',
      title: 'No Title',
      description: 'No description available.',
      newsLink: '#',
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  }
});

defineEmits(['select']);

const defaultImage = 'https://cdn.vuetifyjs.com/images/cards/docks.jpg';

const openLink = () => {
  if (props.news.newsLink) {
    window.open(props.news.newsLink, '_blank');
  }
};
</script>