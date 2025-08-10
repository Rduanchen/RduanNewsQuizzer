<template>
  <div class="editor">
    <h3>題目清單</h3>
    <div class="actions">
      <button @click="addMcq">新增選擇題</button>
    </div>
    <div v-if="!local.length" class="empty">尚未有題目</div>
    <div v-for="(q, idx) in local" :key="idx" class="card">
      <div class="row">
        <strong>#{{ idx + 1 }}</strong>
        <select v-model="q.kind">
          <option value="mcq">選擇題</option>
          <option value="open">開放題</option>
          <option value="tf">是非題</option>
        </select>
        <button class="danger" @click="remove(idx)">刪除</button>
      </div>

      <div class="row">
        <textarea v-model="q.question" class="qtext" placeholder="輸入題目"></textarea>
      </div>

      <div v-if="q.kind==='mcq'">
        <div v-for="(opt, oi) in q.options" :key="oi" class="row">
          <input v-model="q.options[oi]" placeholder="選項" />
          <label><input type="radio" :name="'ans-'+idx" :checked="q.answer===oi" @change="q.answer=oi" /> 正確</label>
          <button @click="q.options.splice(oi,1)" :disabled="q.options.length<=2">刪除選項</button>
        </div>
        <button @click="q.options.push('')">新增選項</button>
      </div>

      <div v-else-if="q.kind==='open'" class="row">
        <input v-model="(q as any).referenceAnswer" placeholder="參考答案（可選）" />
      </div>

      <div v-else-if="q.kind==='tf'" class="row">
        <label><input type="radio" :name="'tf-'+idx" :checked="(q as any).answer===true" @change="(q as any).answer=true" /> True</label>
        <label><input type="radio" :name="'tf-'+idx" :checked="(q as any).answer===false" @change="(q as any).answer=false" /> False</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import type { AnyQuestion, QuestionMCQ } from "../../shared/types";

const props = defineProps<{ questions: AnyQuestion[] }>();
const emit = defineEmits<{ (e: "update", payload: AnyQuestion[]): void }>();

const local = ref<AnyQuestion[]>(JSON.parse(JSON.stringify(props.questions || [])));

watch(
  () => props.questions,
  (v) => (local.value = JSON.parse(JSON.stringify(v || []))),
  { deep: true }
);

watch(local, (v) => emit("update", v), { deep: true });

function addMcq() {
  const q: QuestionMCQ = { kind: "mcq", question: "", options: ["", "" , ""], answer: 0 };
  local.value.push(q);
}

function remove(idx: number) {
  local.value.splice(idx, 1);
}
</script>

<style scoped>
.editor { padding:8px; }
.card { border:1px solid #eee; border-radius:6px; padding:8px; margin-bottom:8px; }
.row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.qtext { width:100%; min-height:80px; }
.danger { color:#c00; }
.empty { color:#777; }
</style>