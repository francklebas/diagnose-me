import type { FlowEdge, FlowNode, FlowOperator, FlowTypeDefinition } from "~/types/flow"

export const NODE_WIDTH = 200
export const NODE_HEIGHT = 88

export const FLOW_OPERATORS: FlowOperator[] = [
  "==",
  "!=",
  ">",
  "<",
  ">=",
  "<=",
  "exists",
  "!exists",
]

export const FLOW_STATE_COLORS = {
  ok: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  disabled: "#6b7a99",
} as const

export const FLOW_TYPES: FlowTypeDefinition[] = [
  { type: "Generic", icon: "⬜", color: "#6b7a99", desc: "Generic node", inp: 1, out: 1 },
  { type: "Trigger", icon: "⚡", color: "#f59e0b", desc: "Starts the workflow", inp: 0, out: 1 },
  {
    type: "HTTP Request",
    icon: "🌐",
    color: "#4f6ef7",
    desc: "Fetch external data",
    inp: 1,
    out: 1,
  },
  { type: "Transform", icon: "⚙", color: "#a855f7", desc: "Process and map data", inp: 1, out: 1 },
  { type: "Filter", icon: "🔍", color: "#06b6d4", desc: "Conditional routing", inp: 1, out: 1 },
  {
    type: "Database",
    icon: "🗄",
    color: "#10b981",
    desc: "Read and write records",
    inp: 1,
    out: 1,
  },
  { type: "Notify", icon: "🔔", color: "#ef4444", desc: "Send notification", inp: 1, out: 0 },
]

export function createInitialNodes(): FlowNode[] {
  return [
    {
      id: "n1",
      x: 80,
      y: 200,
      type: "Trigger",
      icon: "⚡",
      color: "#f59e0b",
      label: "On Schedule",
      desc: "Every 5 min",
      inp: 0,
      out: 1,
      value: "ok",
      state: "ok",
      cond: { rules: [], logic: "AND" },
    },
    {
      id: "n2",
      x: 380,
      y: 95,
      type: "HTTP Request",
      icon: "🌐",
      color: "#4f6ef7",
      label: "Fetch API",
      desc: "GET /api/data",
      inp: 1,
      out: 1,
      value: "200",
      state: "ok",
      cond: { rules: [{ nodeId: "n1", op: "==", value: "ok" }], logic: "AND" },
    },
    {
      id: "n3",
      x: 380,
      y: 305,
      type: "Database",
      icon: "🗄",
      color: "#10b981",
      label: "Read DB",
      desc: "SELECT * FROM users",
      inp: 1,
      out: 1,
      value: "null",
      state: "warning",
      cond: { rules: [{ nodeId: "n1", op: "exists", value: "" }], logic: "AND" },
    },
    {
      id: "n4",
      x: 660,
      y: 200,
      type: "Transform",
      icon: "⚙",
      color: "#a855f7",
      label: "Merge Data",
      desc: "Combine and remap",
      inp: 1,
      out: 1,
      value: "",
      state: "ok",
      cond: {
        rules: [
          { nodeId: "n2", op: "==", value: "200" },
          { nodeId: "n3", op: "!=", value: "null" },
        ],
        logic: "AND",
      },
    },
    {
      id: "n5",
      x: 940,
      y: 200,
      type: "Notify",
      icon: "🔔",
      color: "#ef4444",
      label: "Send Alert",
      desc: "Slack and email",
      inp: 1,
      out: 0,
      value: "",
      state: "ok",
      cond: { rules: [{ nodeId: "n4", op: "exists", value: "" }], logic: "AND" },
    },
  ]
}

export function createInitialEdges(): FlowEdge[] {
  return [
    { id: "e1", sourceId: "n1", targetId: "n2", color: "#f59e0b" },
    { id: "e2", sourceId: "n1", targetId: "n3", color: "#f59e0b" },
    { id: "e3", sourceId: "n2", targetId: "n4", color: "#4f6ef7" },
    { id: "e4", sourceId: "n3", targetId: "n4", color: "#10b981" },
    { id: "e5", sourceId: "n4", targetId: "n5", color: "#a855f7" },
  ]
}

export function truncateText(value: string, maxLength: number): string {
  if (!value) {
    return ""
  }
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value
}
