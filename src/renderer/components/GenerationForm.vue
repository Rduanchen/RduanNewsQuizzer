<template>
  <div class="form">
    <h3>設定生成參數</h3>
    <div class="row">
      <label>題目數量</label>
      <input type="number" min="1" v-model.number="amount" />
    </div>
    <div class="row">
      <label>風格</label>
      <select v-model.number="style">
        <option :value="0">ALL</option>
        <option :value="1">TOEFL</option>
        <option :value="2">IELTS</option>
      </select>
    </div>
    <div class="row">
      <label>題型</label>
      <div class="chips">
        <label><input type="checkbox" value="mcq" v-model="types" /> 選擇題</label>
        <label><input type="checkbox" value="open" v-model="types" /> 開放題</label>
        <label><input type="checkbox" value="tf" v-model="types" /> 是非題</label>
      </div>
      <small>目前生成器先完全支援選擇題，其它題型 UI 已就緒，稍後擴充。</small>
    </div>

    <div class="actions">
      <button @click="$emit('back')">上一步</button>
      <button class="primary" @click="emitGenerate">生成題目</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{ defaults?: { amount?: number; style?: number } }>();
const emit = defineEmits<{
  (e: "generate", payload: { amount: number; style: number; types: string[] }): void;
  (e: "back"): void;
}>();

const amount = ref(props.defaults?.amount ?? 5);
const style = ref(props.defaults?.style ?? 0);
const types = ref<string[]>(["mcq"]);

function emitGenerate() {
  emit("generate", { amount: Math.max(1, amount.value), style: style.value, types: types.value });
}
</script>

<style scoped>
.form { max-width: 720px; }
.row { display:flex; gap:12px; align-items:center; margin-bottom:12px; }
.row label { width: 100px; }
.chips { display:flex; gap:12px; }
.actions { display:flex; justify-content:space-between; margin-top:16px; }
.primary { background:#3b82f6; color:#fff; border:none; padding:8px 12px; border-radius:6px; }
</style>