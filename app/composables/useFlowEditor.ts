import {
  createInitialEdges,
  createInitialNodes,
  FLOW_STATE_COLORS,
  FLOW_TYPES,
  NODE_HEIGHT,
  NODE_WIDTH,
} from "~/utils/flow"
import type {
  FlowConditionRule,
  FlowEdge,
  FlowMode,
  FlowNode,
  FlowPort,
  FlowSnapshot,
  FlowTheme,
  FlowTransform,
  FlowTypeDefinition,
} from "~/types/flow"

interface DragEdgeState {
  sourceId: string
  sourcePort: FlowPort
}

export function useFlowEditor(workflowId = "default-workflow", workflowName = "Main workflow") {
  const workflowTreeStore = useWorkflowTreeStore()

  const nodes = ref<FlowNode[]>(createInitialNodes())
  const edges = ref<FlowEdge[]>(createInitialEdges())
  const transform = ref<FlowTransform>({ x: 0, y: 0, s: 1 })
  const mode = ref<FlowMode>("edit")
  const theme = ref<FlowTheme>("dark")
  const selectedNodeId = ref<string | null>(null)
  const isPanelOpen = ref(false)

  const ghostEdge = ref<string | null>(null)
  const dragEdgeState = ref<DragEdgeState | null>(null)

  const idCounter = ref(10)

  const visibilityMap = computed<Record<string, boolean>>(() => {
    return nodes.value.reduce<Record<string, boolean>>((accumulator, node) => {
      accumulator[node.id] = evaluateNode(node)
      return accumulator
    }, {})
  })

  const selectedNode = computed(
    () => nodes.value.find((node) => node.id === selectedNodeId.value) ?? null
  )

  const statsLabel = computed(() => `${nodes.value.length} nodes · ${edges.value.length} edges`)

  const serializedFlow = computed<FlowSnapshot>(() => {
    return {
      meta: {
        version: 3,
        exportedAt: new Date().toISOString(),
        mode: mode.value,
        theme: theme.value,
      },
      viewport: { ...transform.value },
      nodes: nodes.value.map((node) => ({
        ...node,
        cond: { ...node.cond, rules: [...node.cond.rules] },
      })),
      edges: edges.value.map((edge) => ({ ...edge })),
    }
  })

  const jsonOutput = computed(() => JSON.stringify(serializedFlow.value, null, 2))

  watch(
    serializedFlow,
    (snapshot) => {
      if (!workflowTreeStore.workflows[workflowId]) {
        workflowTreeStore.upsertWorkflow({
          id: workflowId,
          name: workflowName,
          snapshot,
        })
      } else {
        workflowTreeStore.updateWorkflowSnapshot(workflowId, snapshot)
      }

      if (workflowTreeStore.activeWorkflowId !== workflowId) {
        workflowTreeStore.setActiveWorkflow(workflowId)
      }
    },
    { immediate: true, deep: true }
  )

  function getNodeById(nodeId: string): FlowNode | undefined {
    return nodes.value.find((node) => node.id === nodeId)
  }

  function evaluateRule(rule: FlowConditionRule): boolean {
    const targetNode = getNodeById(rule.nodeId)

    if (!targetNode) {
      return false
    }

    if (rule.op === "exists") {
      return true
    }

    if (rule.op === "!exists") {
      return false
    }

    const targetValue = String(targetNode.value ?? "")
    const ruleValue = String(rule.value ?? "")
    const targetNumber = Number.parseFloat(targetValue)
    const ruleNumber = Number.parseFloat(ruleValue)
    const isNumericComparison = !Number.isNaN(targetNumber) && !Number.isNaN(ruleNumber)

    switch (rule.op) {
      case "==":
        return isNumericComparison ? targetNumber === ruleNumber : targetValue === ruleValue
      case "!=":
        return isNumericComparison ? targetNumber !== ruleNumber : targetValue !== ruleValue
      case ">":
        return isNumericComparison && targetNumber > ruleNumber
      case "<":
        return isNumericComparison && targetNumber < ruleNumber
      case ">=":
        return isNumericComparison && targetNumber >= ruleNumber
      case "<=":
        return isNumericComparison && targetNumber <= ruleNumber
      default:
        return false
    }
  }

  function evaluateNode(node: FlowNode): boolean {
    if (!node.cond?.rules?.length) {
      return true
    }

    const results = node.cond.rules.map((rule) => evaluateRule(rule))
    return node.cond.logic === "OR" ? results.some(Boolean) : results.every(Boolean)
  }

  function getNodeType(nodeType: string): FlowTypeDefinition {
    const fallbackType: FlowTypeDefinition = {
      type: "Generic",
      icon: "⬜",
      color: "#6b7a99",
      desc: "Generic node",
      inp: 1,
      out: 1,
    }

    return (
      FLOW_TYPES.find((definition) => definition.type === nodeType) ?? FLOW_TYPES[0] ?? fallbackType
    )
  }

  function getPortPosition(node: FlowNode, port: FlowPort): { x: number; y: number } {
    if (port === "out") {
      return { x: node.x + NODE_WIDTH + 8, y: node.y + NODE_HEIGHT / 2 }
    }
    return { x: node.x - 8, y: node.y + NODE_HEIGHT / 2 }
  }

  function buildBezierPath(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ): string {
    const deltaX = Math.max(Math.abs(targetX - sourceX) * 0.5, 50)
    return `M${sourceX},${sourceY} C${sourceX + deltaX},${sourceY} ${targetX - deltaX},${targetY} ${targetX},${targetY}`
  }

  function selectNode(nodeId: string): void {
    selectedNodeId.value = nodeId
    isPanelOpen.value = true
  }

  function closePanel(): void {
    isPanelOpen.value = false
  }

  function clearSelection(): void {
    selectedNodeId.value = null
    closePanel()
  }

  function deleteNode(nodeId: string): void {
    nodes.value = nodes.value.filter((node) => node.id !== nodeId)
    edges.value = edges.value.filter((edge) => edge.sourceId !== nodeId && edge.targetId !== nodeId)
    if (selectedNodeId.value === nodeId) {
      clearSelection()
    }
  }

  function deleteEdge(edgeId: string): void {
    edges.value = edges.value.filter((edge) => edge.id !== edgeId)
  }

  function updateNodePosition(nodeId: string, x: number, y: number): void {
    const node = getNodeById(nodeId)
    if (!node) {
      return
    }

    node.x = x
    node.y = y
  }

  function addNodeInViewport(width: number, height: number): FlowNode {
    const centerX = (-transform.value.x + width / 2) / transform.value.s - NODE_WIDTH / 2
    const centerY = (-transform.value.y + height / 2) / transform.value.s - NODE_HEIGHT / 2

    const node: FlowNode = {
      id: `n${idCounter.value++}`,
      x: centerX + (Math.random() - 0.5) * 160,
      y: centerY + (Math.random() - 0.5) * 120,
      type: "Generic",
      icon: "⬜",
      color: "#6b7a99",
      label: "New node",
      desc: "Generic node",
      inp: 1,
      out: 1,
      value: "",
      state: "ok",
      cond: { rules: [], logic: "AND" },
    }

    nodes.value.push(node)
    return node
  }

  function applyNodeType(nodeId: string, nodeType: string): void {
    const node = getNodeById(nodeId)
    const type = getNodeType(nodeType)

    if (!node) {
      return
    }

    node.type = type.type
    node.icon = type.icon
    node.color = type.color
    node.desc = type.desc
    node.inp = type.inp
    node.out = type.out
  }

  function toggleMode(): void {
    mode.value = mode.value === "edit" ? "read" : "edit"
    if (mode.value === "read") {
      clearSelection()
      cancelEdgeDrag()
    }
  }

  function toggleTheme(): void {
    theme.value = theme.value === "dark" ? "light" : "dark"
  }

  function resetView(): void {
    transform.value = { x: 0, y: 0, s: 1 }
  }

  function updatePan(clientX: number, clientY: number, panStartX: number, panStartY: number): void {
    transform.value.x = clientX - panStartX
    transform.value.y = clientY - panStartY
  }

  function zoomAtPoint(mouseX: number, mouseY: number, deltaY: number): void {
    const scaleDelta = deltaY > 0 ? 0.88 : 1.12
    const nextScale = Math.min(Math.max(transform.value.s * scaleDelta, 0.15), 4)
    transform.value.x = mouseX - (mouseX - transform.value.x) * (nextScale / transform.value.s)
    transform.value.y = mouseY - (mouseY - transform.value.y) * (nextScale / transform.value.s)
    transform.value.s = nextScale
  }

  function createEdge(sourceId: string, targetId: string): void {
    const edgeExists = edges.value.some(
      (edge) => edge.sourceId === sourceId && edge.targetId === targetId
    )
    if (edgeExists) {
      return
    }

    const sourceNode = getNodeById(sourceId)
    edges.value.push({
      id: `e${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourceId,
      targetId,
      color: sourceNode?.color ?? "#4f6ef7",
    })
  }

  function startEdgeDrag(nodeId: string, port: FlowPort): void {
    dragEdgeState.value = { sourceId: nodeId, sourcePort: port }
    ghostEdge.value = null
  }

  function updateEdgeGhost(targetX: number, targetY: number): void {
    if (!dragEdgeState.value) {
      ghostEdge.value = null
      return
    }

    const sourceNode = getNodeById(dragEdgeState.value.sourceId)
    if (!sourceNode) {
      ghostEdge.value = null
      return
    }

    const sourcePosition = getPortPosition(sourceNode, dragEdgeState.value.sourcePort)
    ghostEdge.value =
      dragEdgeState.value.sourcePort === "out"
        ? buildBezierPath(sourcePosition.x, sourcePosition.y, targetX, targetY)
        : buildBezierPath(targetX, targetY, sourcePosition.x, sourcePosition.y)
  }

  function finishEdgeDrag(nodeId: string, port: FlowPort): void {
    if (!dragEdgeState.value) {
      return
    }

    if (dragEdgeState.value.sourceId === nodeId) {
      cancelEdgeDrag()
      return
    }

    let sourceId: string | null = null
    let targetId: string | null = null

    if (dragEdgeState.value.sourcePort === "out" && port === "in") {
      sourceId = dragEdgeState.value.sourceId
      targetId = nodeId
    } else if (dragEdgeState.value.sourcePort === "in" && port === "out") {
      sourceId = nodeId
      targetId = dragEdgeState.value.sourceId
    }

    if (sourceId && targetId) {
      createEdge(sourceId, targetId)
    }

    cancelEdgeDrag()
  }

  function cancelEdgeDrag(): void {
    dragEdgeState.value = null
    ghostEdge.value = null
  }

  function buildEdgePath(edge: FlowEdge): string | null {
    const sourceNode = getNodeById(edge.sourceId)
    const targetNode = getNodeById(edge.targetId)

    if (!sourceNode || !targetNode) {
      return null
    }

    const sourcePosition = getPortPosition(sourceNode, "out")
    const targetPosition = getPortPosition(targetNode, "in")
    return buildBezierPath(sourcePosition.x, sourcePosition.y, targetPosition.x, targetPosition.y)
  }

  function exportJson(): string {
    return jsonOutput.value
  }

  return {
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
    jsonOutput,
    FLOW_TYPES,
    FLOW_STATE_COLORS,
    NODE_WIDTH,
    NODE_HEIGHT,
    getNodeType,
    getPortPosition,
    buildBezierPath,
    buildEdgePath,
    evaluateNode,
    selectNode,
    closePanel,
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
    updateEdgeGhost,
    finishEdgeDrag,
    cancelEdgeDrag,
    exportJson,
  }
}
