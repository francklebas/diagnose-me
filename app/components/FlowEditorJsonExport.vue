<template>
  <div class="json-panel" :class="{ open: open }">
    <div class="json-panel-hd">
      <span>Flow JSON</span>
      <button class="panel-close" type="button" @click="$emit('close')">×</button>
    </div>
    <div class="json-panel-body">
      <textarea class="json-text" readonly :value="json" />
    </div>
    <div class="json-panel-ft">
      <button class="btn btn-p" type="button" @click="$emit('copy-json')">Copy</button>
      <button class="btn btn-g" type="button" @click="$emit('download-json')">Download</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    open: boolean
    json: string
  }>()

  defineEmits<{
    close: []
    "copy-json": []
    "download-json": []
  }>()
</script>
