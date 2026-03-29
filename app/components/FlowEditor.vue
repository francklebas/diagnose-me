<template>
  <div class="flow-editor" :data-flow-theme="theme">
    <FlowEditorToolbar
      :mode="mode"
      :theme="theme"
      :stats-label="statsLabel"
      @add-node="handleAddNode"
      @reset-view="resetView"
      @toggle-mode="toggleMode"
      @toggle-theme="toggleTheme"
      @toggle-json="showJson = !showJson"
    />

    <div
      ref="typeOverlayRef"
      class="type-overlay"
      :class="{ show: typeOverlayOpen }"
      :style="typeOverlayStyle"
    >
      <div class="type-overlay-title">Choose node type</div>
      <div class="type-grid">
        <button
          v-for="type in FLOW_TYPES"
          :key="type.type"
          class="type-chip"
          :style="{ color: type.color }"
          type="button"
          @click="applyPendingType(type.type)"
        >
          <span class="type-chip-icon">{{ type.icon }}</span>
          <span class="type-chip-lbl">{{ type.type }}</span>
        </button>
      </div>
    </div>

    <FlowEditorCanvas
      ref="canvasRef"
      :nodes="nodes"
      :edges="edges"
      :mode="mode"
      :selected-node-id="selectedNodeId"
      :visibility-map="visibilityMap"
      :transform="transform"
      :ghost-edge="ghostEdge"
      :node-width="NODE_WIDTH"
      :node-height="NODE_HEIGHT"
      :is-panning="isPanning"
      :state-colors="FLOW_STATE_COLORS"
      :edge-path="buildEdgePath"
      :edge-handle-position="getEdgeHandlePosition"
      @canvas-mousedown="handleCanvasMouseDown"
      @canvas-wheel="handleCanvasWheel"
      @canvas-click="handleCanvasClick"
      @node-mousedown="handleNodeMouseDown"
      @node-click="handleNodeClick"
      @node-delete="deleteNode"
      @edge-click="deleteEdge"
      @edge-retarget-start="startEdgeRetarget"
      @port-mousedown="startEdgeDrag"
      @port-mouseup="finishEdgeDrag"
    />

    <FlowEditorPanel
      :open="isPanelOpen"
      :node="selectedNode"
      :nodes="nodes"
      :types="FLOW_TYPES"
      :is-visible="selectedNode ? visibilityMap[selectedNode.id] : true"
      @close="clearSelection"
      @delete-node="deleteNode"
      @apply-type="applyNodeType"
    />

    <FlowEditorJsonExport
      :open="showJson"
      :json="jsonOutput"
      @close="showJson = false"
      @copy-json="copyJson"
      @download-json="downloadJson"
    />

    <div class="zoom-badge">{{ Math.round(transform.s * 100) }}%</div>
    <div class="mode-badge" :class="{ read: mode === 'read' }">
      {{ mode === "edit" ? "✏️ Edit mode" : "👁 Read mode" }}
    </div>
    <div v-if="mode === 'edit'" class="help-badge">
      🖱 Pan: drag canvas · Scroll: zoom<br />
      ○ Connect: drag output ▷ to input ●<br />
      ↔ Edit link: drag blue handle on link · Click edge: delete
    </div>
  </div>
</template>

<script setup lang="ts">
  import FlowEditorCanvas from "~/components/FlowEditorCanvas.vue"

  interface Point {
    x: number
    y: number
  }

  const {
    nodes,
    edges,
    mode,
    theme,
    transform,
    selectedNodeId,
    selectedNode,
    isPanelOpen,
    visibilityMap,
    statsLabel,
    ghostEdge,
    isEdgeDragging,
    jsonOutput,
    FLOW_TYPES,
    FLOW_STATE_COLORS,
    NODE_WIDTH,
    NODE_HEIGHT,
    buildEdgePath,
    getEdgeHandlePosition,
    selectNode,
    clearSelection,
    deleteNode,
    deleteEdge,
    updateNodePosition,
    addNodeInViewport,
    applyNodeType,
    toggleMode,
    toggleTheme,
    resetView,
    updatePan,
    zoomAtPoint,
    startEdgeDrag,
    startEdgeRetarget,
    updateEdgeGhost,
    finishEdgeDrag,
    cancelEdgeDrag,
  } = useFlowEditor()

  const canvasRef = ref<InstanceType<typeof FlowEditorCanvas> | null>(null)
  const typeOverlayRef = ref<HTMLElement | null>(null)

  const isPanning = ref(false)
  const panStart = ref<Point>({ x: 0, y: 0 })

  const dragNodeId = ref<string | null>(null)
  const dragOffset = ref<Point>({ x: 0, y: 0 })
  const dragMoved = ref(false)

  const typeOverlayOpen = ref(false)
  const typeOverlayPos = ref<Point>({ x: 0, y: 0 })
  const pendingTypeNodeId = ref<string | null>(null)

  const showJson = ref(false)

  const typeOverlayStyle = computed(() => ({
    left: `${typeOverlayPos.value.x}px`,
    top: `${typeOverlayPos.value.y}px`,
  }))

  function svgElement(): SVGSVGElement | null {
    return canvasRef.value?.svgRef ?? null
  }

  function toWorld(clientX: number, clientY: number): Point {
    const svg = svgElement()
    if (!svg) {
      return { x: 0, y: 0 }
    }
    const rect = svg.getBoundingClientRect()
    return {
      x: (clientX - rect.left - transform.value.x) / transform.value.s,
      y: (clientY - rect.top - transform.value.y) / transform.value.s,
    }
  }

  function handleCanvasMouseDown(event: MouseEvent): void {
    if (event.button !== 0 || mode.value === "read") {
      return
    }
    cancelEdgeDrag()
    isPanning.value = true
    panStart.value = {
      x: event.clientX - transform.value.x,
      y: event.clientY - transform.value.y,
    }
    hideTypeOverlay()
  }

  function handleCanvasWheel(event: WheelEvent): void {
    event.preventDefault()
    const svg = svgElement()
    if (!svg) {
      return
    }
    const rect = svg.getBoundingClientRect()
    zoomAtPoint(event.clientX - rect.left, event.clientY - rect.top, event.deltaY)
  }

  function handleCanvasClick(): void {
    if (dragMoved.value) {
      return
    }
    clearSelection()
    hideTypeOverlay()
  }

  function handleNodeMouseDown(event: MouseEvent, nodeId: string): void {
    if (event.button !== 0 || mode.value !== "edit") {
      return
    }
    isPanning.value = false
    dragNodeId.value = nodeId
    dragMoved.value = false
    const worldPoint = toWorld(event.clientX, event.clientY)
    const node = nodes.value.find((item) => item.id === nodeId)
    if (!node) {
      return
    }
    dragOffset.value = { x: worldPoint.x - node.x, y: worldPoint.y - node.y }
  }

  function handleNodeClick(nodeId: string): void {
    if (mode.value !== "edit" || dragMoved.value) {
      return
    }
    selectNode(nodeId)
  }

  function handleAddNode(event: MouseEvent): void {
    const svg = svgElement()
    const width = svg?.clientWidth ?? window.innerWidth
    const height = svg?.clientHeight ?? window.innerHeight
    const newNode = addNodeInViewport(width, height)
    pendingTypeNodeId.value = newNode.id
    typeOverlayPos.value = { x: event.clientX, y: event.clientY + 12 }
    typeOverlayOpen.value = true
  }

  function applyPendingType(nodeType: string): void {
    if (!pendingTypeNodeId.value) {
      return
    }
    applyNodeType(pendingTypeNodeId.value, nodeType)
    selectNode(pendingTypeNodeId.value)
    hideTypeOverlay()
  }

  function hideTypeOverlay(): void {
    typeOverlayOpen.value = false
    pendingTypeNodeId.value = null
  }

  function handleGlobalMouseMove(event: MouseEvent): void {
    if (isPanning.value) {
      updatePan(event.clientX, event.clientY, panStart.value.x, panStart.value.y)
      return
    }

    if (dragNodeId.value) {
      const worldPoint = toWorld(event.clientX, event.clientY)
      const node = nodes.value.find((item) => item.id === dragNodeId.value)
      if (!node) {
        return
      }
      const nextX = worldPoint.x - dragOffset.value.x
      const nextY = worldPoint.y - dragOffset.value.y
      if (!dragMoved.value && (Math.abs(nextX - node.x) > 4 || Math.abs(nextY - node.y) > 4)) {
        dragMoved.value = true
      }
      if (dragMoved.value) {
        updateNodePosition(node.id, nextX, nextY)
      }
      return
    }

    if (isEdgeDragging.value) {
      const worldPoint = toWorld(event.clientX, event.clientY)
      updateEdgeGhost(worldPoint.x, worldPoint.y)
    }
  }

  function handleGlobalMouseUp(): void {
    isPanning.value = false
    dragNodeId.value = null
    if (isEdgeDragging.value) {
      cancelEdgeDrag()
    }
    setTimeout(() => {
      dragMoved.value = false
    }, 0)
  }

  function handleGlobalClick(event: MouseEvent): void {
    if (!typeOverlayOpen.value) {
      return
    }
    const target = event.target as HTMLElement | null
    if (!target) {
      return
    }
    if (typeOverlayRef.value?.contains(target)) {
      return
    }
    hideTypeOverlay()
  }

  async function copyJson(): Promise<void> {
    if (!import.meta.client) {
      return
    }
    await navigator.clipboard.writeText(jsonOutput.value)
  }

  function downloadJson(): void {
    if (!import.meta.client) {
      return
    }
    const blob = new Blob([jsonOutput.value], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "flow-export.json"
    link.click()
    URL.revokeObjectURL(link.href)
  }

  onMounted(() => {
    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("click", handleGlobalClick)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("mousemove", handleGlobalMouseMove)
    window.removeEventListener("mouseup", handleGlobalMouseUp)
    window.removeEventListener("click", handleGlobalClick)
  })
</script>

<style>
  .flow-editor {
    --t: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
    font-family: "JetBrains Mono", monospace;
  }

  .flow-editor[data-flow-theme="dark"] {
    --bg: #0d0f1a;
    --dot: #1a1d30;
    --nb: #12152a;
    --nb-sel: #1a2444;
    --nbr: #1e2235;
    --ns: rgba(0, 0, 0, 0.5);
    --nl: #e2e8f0;
    --nd: #4b5580;
    --tb: rgba(18, 21, 42, 0.96);
    --tbr: #1e2235;
    --tbt: #e2e8f0;
    --tbm: #4b5270;
    --pb: #12152a;
    --pbr: #1e2235;
    --pt: #e2e8f0;
    --pm: #4b5580;
    --ib: #0d0f1a;
    --ir: #1e2235;
    --it: #e2e8f0;
    --if: #4f6ef7;
    --bb: rgba(18, 21, 42, 0.9);
    --gh: transparent;
    --gbr: #1e2235;
    --gt: #6b7a99;
    --gh2: #1a1d2e;
    background: var(--bg);
  }

  .flow-editor[data-flow-theme="light"] {
    --bg: #f0f2f8;
    --dot: #c8cde0;
    --nb: #ffffff;
    --nb-sel: #eef2ff;
    --nbr: #dde1f0;
    --ns: rgba(0, 0, 0, 0.07);
    --nl: #1a1d2e;
    --nd: #8892b0;
    --tb: rgba(255, 255, 255, 0.96);
    --tbr: #dde1f0;
    --tbt: #1a1d2e;
    --tbm: #8892b0;
    --pb: #ffffff;
    --pbr: #dde1f0;
    --pt: #1a1d2e;
    --pm: #8892b0;
    --ib: #f0f2f8;
    --ir: #c8cde0;
    --it: #1a1d2e;
    --if: #4f6ef7;
    --bb: rgba(255, 255, 255, 0.9);
    --gh: transparent;
    --gbr: #c8cde0;
    --gt: #8892b0;
    --gh2: #eef2ff;
    background: var(--bg);
  }

  .tb {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    background: var(--tb);
    border: 1px solid var(--tbr);
    border-radius: 12px;
    backdrop-filter: blur(16px);
    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.25);
    white-space: nowrap;
  }

  .tb-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--tbt);
    letter-spacing: 0.06em;
    padding-right: 12px;
    border-right: 1px solid var(--tbr);
  }

  .tb-sep {
    width: 1px;
    height: 20px;
    background: var(--tbr);
    flex-shrink: 0;
  }

  .tb-info {
    font-size: 10px;
    color: var(--tbm);
  }

  .btn {
    padding: 5px 12px;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 600;
    border: none;
    border-radius: 7px;
    cursor: pointer;
  }

  .btn-p {
    background: #4f6ef7;
    color: #ffffff;
  }

  .btn-g {
    background: var(--gh);
    color: var(--gt);
    border: 1px solid var(--gbr);
  }

  .btn-mode {
    padding: 5px 14px;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    border-radius: 7px;
    cursor: pointer;
    border: none;
  }

  .btn-mode.edit {
    background: rgba(79, 110, 247, 0.15);
    color: #4f6ef7;
  }

  .btn-mode.read {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
  }

  .btn-theme {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--tbr);
    background: transparent;
    color: var(--tbt);
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cvs {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;
    position: absolute;
    top: 0;
    left: 0;
  }

  .cvs.panning {
    cursor: grabbing;
  }

  .panel,
  .json-panel {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 320px;
    background: var(--pb);
    border-left: 1px solid var(--pbr);
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 20;
    box-shadow: -8px 0 40px rgba(0, 0, 0, 0.18);
  }

  .json-panel {
    width: 380px;
    z-index: 22;
  }

  .panel.open,
  .json-panel.open {
    transform: translateX(0);
  }

  .panel-hd,
  .json-panel-hd {
    padding: 16px 20px;
    border-bottom: 1px solid var(--pbr);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }

  .panel-hd-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .panel-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .panel-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--pt);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .panel-close {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--pm);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .panel-body,
  .json-panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .panel-ft,
  .json-panel-ft {
    padding: 12px 20px;
    border-top: 1px solid var(--pbr);
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .json-text {
    width: 100%;
    min-height: 420px;
    border: 1px solid var(--ir);
    border-radius: 8px;
    background: var(--ib);
    color: var(--it);
    padding: 10px;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
  }

  .type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .type-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 8px 4px;
    border-radius: 8px;
    cursor: pointer;
    border: 1.5px solid var(--ir);
    background: var(--ib);
  }

  .type-chip.active {
    border-color: currentColor;
    background: rgba(255, 255, 255, 0.04);
  }

  .type-chip-icon {
    font-size: 16px;
    line-height: 1;
  }

  .type-chip-lbl {
    font-size: 8px;
    font-weight: 600;
    color: var(--pt);
    letter-spacing: 0.05em;
    text-align: center;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .field-lbl {
    font-size: 9px;
    font-weight: 700;
    color: var(--pm);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .field input,
  .field select,
  .field textarea,
  .cond-row select,
  .cond-row input {
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    background: var(--ib);
    color: var(--it);
    border: 1px solid var(--ir);
    border-radius: 7px;
    padding: 8px 10px;
    outline: none;
    width: 100%;
  }

  .sec {
    font-size: 9px;
    font-weight: 700;
    color: #4f6ef7;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding-top: 4px;
    border-top: 1px solid var(--pbr);
    padding-bottom: 2px;
  }

  .cond-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .cond-row {
    display: grid;
    grid-template-columns: 1fr 0.65fr 1fr 20px;
    gap: 4px;
    align-items: center;
  }

  .logic-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .logic-lbl {
    font-size: 9px;
    color: var(--pm);
  }

  .logic-btn {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    background: rgba(79, 110, 247, 0.12);
    color: #4f6ef7;
  }

  .cond-add {
    font-size: 10px;
    font-weight: 600;
    color: #4f6ef7;
    background: transparent;
    border: 1px dashed var(--ir);
    border-radius: 7px;
    padding: 7px;
    cursor: pointer;
    text-align: center;
    width: 100%;
    font-family: "JetBrains Mono", monospace;
  }

  .cond-rm {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: var(--pm);
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .eval-box {
    padding: 8px 10px;
    border-radius: 7px;
    font-size: 10px;
    font-weight: 600;
  }

  .eval-t {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .eval-f {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .state-row {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }

  .state-chip {
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: 700;
    cursor: pointer;
    border: 1.5px solid transparent;
    background: transparent;
  }

  .s-ok {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  .s-ok.on {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.2);
  }

  .s-warn {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  .s-warn.on {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.2);
  }

  .s-err {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .s-err.on {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.2);
  }

  .s-dis {
    color: #6b7a99;
    background: rgba(107, 122, 153, 0.1);
  }

  .s-dis.on {
    border-color: #6b7a99;
    background: rgba(107, 122, 153, 0.2);
  }

  .zoom-badge,
  .mode-badge,
  .help-badge {
    position: absolute;
    background: var(--bb);
    border: 1px solid var(--tbr);
    border-radius: 7px;
    font-size: 10px;
    color: var(--tbm);
    backdrop-filter: blur(8px);
    pointer-events: none;
  }

  .zoom-badge {
    bottom: 16px;
    right: 16px;
    padding: 4px 10px;
  }

  .mode-badge {
    bottom: 16px;
    left: 16px;
    padding: 4px 10px;
  }

  .mode-badge.read {
    color: #10b981;
    border-color: rgba(16, 185, 129, 0.3);
    background: rgba(16, 185, 129, 0.07);
  }

  .help-badge {
    bottom: 48px;
    left: 16px;
    padding: 8px 12px;
    font-size: 9px;
    line-height: 2;
  }

  .type-overlay {
    position: absolute;
    z-index: 25;
    background: var(--pb);
    border: 1px solid var(--pbr);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
    display: none;
    flex-direction: column;
    gap: 8px;
    min-width: 220px;
  }

  .type-overlay.show {
    display: flex;
  }

  .type-overlay-title {
    font-size: 9px;
    font-weight: 700;
    color: var(--pm);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  @media (max-width: 960px) {
    .tb {
      left: 12px;
      right: 12px;
      transform: none;
      overflow-x: auto;
    }

    .panel,
    .json-panel {
      width: min(100vw, 360px);
    }
  }
</style>
