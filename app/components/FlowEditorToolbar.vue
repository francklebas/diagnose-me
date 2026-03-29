<template>
  <div class="tb">
    <span class="tb-title">⚡ Flow Editor</span>
    <button class="btn btn-p" type="button" @click="$emit('add-node', $event)">+ Node</button>
    <button class="btn btn-g" type="button" @click="$emit('reset-view')">Reset</button>
    <div class="tb-sep" />
    <button class="btn-mode" :class="modeClass" type="button" @click="$emit('toggle-mode')">
      {{ modeLabel }}
    </button>
    <div class="tb-sep" />
    <button class="btn-theme" type="button" @click="$emit('toggle-theme')">
      {{ themeIcon }}
    </button>
    <div class="tb-sep" />
    <button class="btn btn-g" type="button" @click="$emit('toggle-json')">JSON</button>
    <div class="tb-sep" />
    <span class="tb-info">{{ statsLabel }}</span>
  </div>
</template>

<script setup lang="ts">
  import type { FlowMode, FlowTheme } from "~/types/flow"

  const props = defineProps<{
    mode: FlowMode
    theme: FlowTheme
    statsLabel: string
  }>()

  defineEmits<{
    "add-node": [event: MouseEvent]
    "reset-view": []
    "toggle-mode": []
    "toggle-theme": []
    "toggle-json": []
  }>()

  const modeClass = computed(() => (props.mode === "edit" ? "edit" : "read"))
  const modeLabel = computed(() => (props.mode === "edit" ? "✏️ Edit" : "👁 Read"))
  const themeIcon = computed(() => (props.theme === "dark" ? "🌙" : "☀️"))
</script>
