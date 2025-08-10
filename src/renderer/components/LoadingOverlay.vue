<template>
  <div class="overlay">
    <div class="panel">
      <div class="spinner"></div>
      <div>{{ text || 'Loading...' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ text?: string }>();
</script>

<style scoped>
.overlay { position:fixed; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; z-index:9999; }
.panel { background:#fff; padding:24px; border-radius:8px; display:flex; flex-direction:column; align-items:center; gap:12px; }
.spinner { width:32px; height:32px; border:4px solid #eee; border-top-color:#3b82f6; border-radius:50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>