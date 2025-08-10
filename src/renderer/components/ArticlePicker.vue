<template>
  <div class="picker">
    <div class="source">
      <h3>1) 請選擇文章來源</h3>
      <div class="row">
        <input v-model="url" class="input" placeholder="貼上 BBC/The Guardian 文章網址，例如：https://www.bbc.com/..." />
        <button @click="loadFromUrl">讀取文章</button>
      </div>

      <div class="row">
        <textarea v-model="pasted" class="textarea" placeholder="或直接貼上文章內容"></textarea>
        <button @click="choosePasted">使用貼上內容</button>
      </div>

      <div class="row">
        <input type="file" @change="onFile" accept=".txt,.docx" />
      </div>
    </div>

    <div v-if="previewUrl" class="preview">
      <h4>預覽（嘗試以 iframe 嵌入）</h4>
      <iframe
        :src="previewUrl"
        ref="iframeRef"
        sandbox="allow-scripts allow-same-origin allow-popups"
        @load="onIframeLoad"
        class="iframe"
      ></iframe>
      <div class="hint">
        <p>若無法顯示，可能因網站的 X-Frame-Options 或 frame-ancestors 限制。</p>
        <button @click="openInView">使用內嵌檢視（BrowserView）顯示</button>
        <a :href="previewUrl" target="_blank" rel="noreferrer">於外部瀏覽器開啟</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (e: "chosen", payload: { url: string; content?: string }): void;
}>();

const url = ref("");
const pasted = ref("");
const previewUrl = ref<string | null>(null);
const iframeRef = ref<HTMLIFrameElement | null>(null);

async function loadFromUrl() {
  if (!url.value) return;
  previewUrl.value = url.value;
  // 不阻塞：生成時才真正爬取內容
  emit("chosen", { url: url.value });
}

function choosePasted() {
  if (!pasted.value.trim()) return;
  emit("chosen", { url: "", content: pasted.value.trim() });
}

async function onFile(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const text = await file.text();
  pasted.value = text;
}

function onIframeLoad() {
  // 無法可靠偵測被 XFO 擋，但若視覺上仍空白，請使用下方 BrowserView 顯示
}

async function openInView() {
  if (!previewUrl.value) return;
  await window.api.showExternalArticle(previewUrl.value);
}
</script>

<style scoped>
.picker { display:flex; gap:16px; }
.source { flex:1; }
.preview { flex:1; display:flex; flex-direction:column; gap:8px; }
.row { display:flex; gap:8px; margin-bottom:8px; }
.input { flex:1; }
.textarea { width:100%; min-height:160px; }
.iframe { width:100%; height:50vh; border:1px solid #ddd; border-radius:6px; }
.hint { display:flex; gap:12px; align-items:center; }
</style>