<template>
    <v-col cols="12" md="6">
        <v-textarea v-model="customArticleTitle" label="自訂文章標題" prepend-inner-icon="mdi-file-document-edit"
            variant="outlined" placeholder="請輸入你想分析的文章標題" rows="1" auto-grow></v-textarea>
        <v-textarea v-model="customArticle" label="自訂文章內容" prepend-inner-icon="mdi-file-document-edit"
            variant="outlined" placeholder="請貼上或輸入你想分析的文章" rows="5" auto-grow></v-textarea>
        <v-btn color="success" class="mt-2" :loading="customLoading" :disabled="!customArticle"
            @click="submitCustomArticle">
            <v-icon left>mdi-arrow-right</v-icon>
            送出文章
        </v-btn>
        <v-alert v-if="customError" type="error" variant="tonal" class="mt-2" closable @click:close="customError = ''">
            {{ customError }}
        </v-alert>
    </v-col>
</template>
<script setup>
import { ref } from 'vue';

const emit = defineEmits(['articleSubmitted']);

const customArticle = ref('');
const customLoading = ref(false);
const customError = ref('');
const customArticleTitle = ref('');

let articlePayload = ref({
    title: '',
    author: '',
    date: '',
    content: ''
});

const getCustomArticle = () => {
    articlePayload.value = {
        title: customArticleTitle.value,
        author: 'user',
        date: new Date().toISOString(),
        content: customArticle.value
    };
};

const submitCustomArticle = () => {
    getCustomArticle();
    // convert articlePayload to a JSON string
    // const encodedArticle = JSON.stringify(articlePayload.value);
    const encodedArticle = {
        coverUrl: "",
        title: articlePayload.value.title,
        description: "",
        newsLink: JSON.stringify(articlePayload.value)
    }
    emit('articleSubmitted', encodedArticle);
};

</script>