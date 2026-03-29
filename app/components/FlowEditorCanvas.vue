<template>
  <svg
    ref="svgRef"
    class="cvs"
    :class="{ panning: isPanning }"
    @mousedown="$emit('canvas-mousedown', $event)"
    @click="$emit('canvas-click')"
    @wheel="$emit('canvas-wheel', $event)"
  >
    <defs>
      <pattern
        id="dots"
        :width="gridSize"
        :height="gridSize"
        patternUnits="userSpaceOnUse"
        :x="gridOffsetX"
        :y="gridOffsetY"
      >
        <circle :cx="gridSize / 2" :cy="gridSize / 2" r="1.2" fill="var(--dot)" />
      </pattern>
      <filter id="f-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3z" fill="#4f6ef7" />
      </marker>
      <marker id="arr-ghost" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3z" fill="#555" />
      </marker>
    </defs>

    <rect width="100%" height="100%" fill="url(#dots)" />

    <g :transform="`translate(${transform.x},${transform.y}) scale(${transform.s})`">
      <g>
        <g v-for="edge in edges" :key="edge.id" :opacity="edgeHidden(edge) ? 0 : 1">
          <path
            v-if="edgePath(edge)"
            :d="edgePath(edge) || ''"
            fill="none"
            stroke="rgba(0,0,0,.3)"
            stroke-width="5"
            stroke-linecap="round"
          />
          <path
            v-if="edgePath(edge)"
            :d="edgePath(edge) || ''"
            fill="none"
            :stroke="edge.color || '#4f6ef7'"
            stroke-width="2"
            stroke-linecap="round"
            marker-end="url(#arr)"
          />
          <path
            v-if="mode === 'edit' && edgePath(edge)"
            :d="edgePath(edge) || ''"
            fill="none"
            stroke="transparent"
            stroke-width="14"
            style="cursor: pointer"
            @click.stop="$emit('edge-click', edge.id)"
          />
        </g>
      </g>

      <g>
        <path
          v-if="ghostEdge"
          :d="ghostEdge"
          fill="none"
          stroke="#555"
          stroke-width="1.5"
          stroke-dasharray="6 3"
          stroke-linecap="round"
          marker-end="url(#arr-ghost)"
        />
      </g>

      <g>
        <g
          v-for="node in nodes"
          :key="node.id"
          :data-nid="node.id"
          :transform="`translate(${node.x},${node.y})`"
          :style="nodeHidden(node) ? 'opacity:0;pointer-events:none' : ''"
          @mousedown.stop="$emit('node-mousedown', $event, node.id)"
          @click.stop="$emit('node-click', node.id)"
        >
          <rect
            :width="nodeWidth"
            :height="nodeHeight"
            rx="10"
            fill="var(--ns)"
            transform="translate(3,5)"
          />
          <rect
            :width="nodeWidth"
            :height="nodeHeight"
            rx="10"
            :fill="selectedNodeId === node.id ? 'var(--nb-sel)' : 'var(--nb)'"
            :stroke="selectedNodeId === node.id ? node.color : 'var(--nbr)'"
            :stroke-width="selectedNodeId === node.id ? 2 : 1.5"
          />
          <rect :width="nodeWidth" height="40" rx="10" :fill="node.color" opacity=".1" />
          <rect y="24" :width="nodeWidth" height="16" :fill="node.color" opacity=".1" />
          <rect
            x="0"
            y="12"
            width="3"
            :height="nodeHeight - 24"
            rx="2"
            :fill="stateColor(node.state)"
            opacity=".9"
          />
          <rect x="13" y="10" width="22" height="22" rx="6" :fill="node.color" opacity=".18" />
          <text x="24" y="21" text-anchor="middle" dominant-baseline="middle" font-size="13">
            {{ node.icon }}
          </text>
          <text
            x="44"
            y="20"
            dominant-baseline="middle"
            font-family="'JetBrains Mono',monospace"
            font-size="11"
            font-weight="700"
            fill="var(--nl)"
          >
            {{ truncate(node.label, 18) }}
          </text>
          <text
            x="44"
            y="32"
            dominant-baseline="middle"
            font-family="'JetBrains Mono',monospace"
            font-size="9"
            :fill="node.color"
            opacity=".9"
          >
            {{ node.type.toUpperCase() }}
          </text>
          <text
            x="16"
            y="62"
            font-family="'JetBrains Mono',monospace"
            font-size="9"
            fill="var(--nd)"
          >
            {{ truncate(node.value ? `val: ${node.value}` : node.desc, 28) }}
          </text>

          <g v-if="node.cond.rules.length" :transform="`translate(${nodeWidth - 12},12)`">
            <circle
              r="5"
              :fill="visibilityMap[node.id] ? '#10b981' : '#ef4444'"
              opacity=".9"
              filter="url(#f-glow)"
            />
          </g>

          <g
            v-if="mode === 'edit'"
            :transform="`translate(${nodeWidth - 20},8)`"
            data-role="delete"
          >
            <rect width="14" height="14" rx="4" fill="#ff4466" opacity=".18" />
            <text
              x="7"
              y="7"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="13"
              fill="#ff4466"
              font-weight="700"
              @click.stop="$emit('node-delete', node.id)"
            >
              ×
            </text>
          </g>

          <g
            v-if="mode === 'edit' && node.inp > 0"
            :transform="`translate(${-8},${nodeHeight / 2})`"
            style="cursor: crosshair"
            @mousedown.stop="$emit('port-mousedown', node.id, 'in')"
            @mouseup.stop="$emit('port-mouseup', node.id, 'in')"
          >
            <circle r="7" fill="var(--nb)" stroke="var(--nbr)" stroke-width="1.5" />
            <circle r="3" :fill="node.color" opacity=".9" />
          </g>

          <g
            v-if="mode === 'edit' && node.out > 0"
            :transform="`translate(${nodeWidth + 8},${nodeHeight / 2})`"
            style="cursor: crosshair"
            @mousedown.stop="$emit('port-mousedown', node.id, 'out')"
            @mouseup.stop="$emit('port-mouseup', node.id, 'out')"
          >
            <circle r="7" fill="var(--nb)" stroke="var(--nbr)" stroke-width="1.5" />
            <polygon points="-3,-3 -3,3 4,0" :fill="node.color" opacity=".9" />
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
  import { truncateText } from "~/utils/flow"
  import type { FlowEdge, FlowMode, FlowNode, FlowPort, FlowTransform } from "~/types/flow"

  const props = defineProps<{
    nodes: FlowNode[]
    edges: FlowEdge[]
    mode: FlowMode
    selectedNodeId: string | null
    visibilityMap: Record<string, boolean>
    transform: FlowTransform
    ghostEdge: string | null
    nodeWidth: number
    nodeHeight: number
    isPanning: boolean
    stateColors: Record<string, string>
    edgePath: (edge: FlowEdge) => string | null
  }>()

  defineEmits<{
    "canvas-mousedown": [event: MouseEvent]
    "canvas-wheel": [event: WheelEvent]
    "canvas-click": []
    "node-mousedown": [event: MouseEvent, nodeId: string]
    "node-click": [nodeId: string]
    "node-delete": [nodeId: string]
    "edge-click": [edgeId: string]
    "port-mousedown": [nodeId: string, port: FlowPort]
    "port-mouseup": [nodeId: string, port: FlowPort]
  }>()

  const svgRef = ref<SVGSVGElement | null>(null)

  defineExpose({ svgRef })

  const gridSize = computed(() => 24 * props.transform.s)
  const gridOffsetX = computed(() => props.transform.x % gridSize.value)
  const gridOffsetY = computed(() => props.transform.y % gridSize.value)

  function edgeHidden(edge: FlowEdge): boolean {
    const sourceVisible = props.visibilityMap[edge.sourceId]
    const targetVisible = props.visibilityMap[edge.targetId]
    return props.mode === "read" && (!sourceVisible || !targetVisible)
  }

  function nodeHidden(node: FlowNode): boolean {
    return props.mode === "read" && !props.visibilityMap[node.id]
  }

  function truncate(value: string, maxLength: number): string {
    return truncateText(value, maxLength)
  }

  function stateColor(state: string): string {
    return props.stateColors[state] ?? props.stateColors.ok ?? "#10b981"
  }
</script>
