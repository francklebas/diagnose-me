export type FlowOperator = "==" | "!=" | ">" | "<" | ">=" | "<=" | "exists" | "!exists"

export type FlowConditionLogic = "AND" | "OR"

export type FlowMode = "edit" | "read"

export type FlowTheme = "dark" | "light"

export type FlowPort = "in" | "out"

export type FlowEdgeEndpoint = "source" | "target"

export type FlowNodeState = "ok" | "warning" | "error" | "disabled"

export interface FlowConditionRule {
  nodeId: string
  op: FlowOperator
  value: string
}

export interface FlowCondition {
  rules: FlowConditionRule[]
  logic: FlowConditionLogic
}

export interface FlowNode {
  id: string
  x: number
  y: number
  type: string
  icon: string
  color: string
  label: string
  desc: string
  inp: number
  out: number
  value: string
  state: FlowNodeState
  cond: FlowCondition
}

export interface FlowEdge {
  id: string
  sourceId: string
  targetId: string
  color: string
}

export interface FlowTransform {
  x: number
  y: number
  s: number
}

export interface FlowTypeDefinition {
  type: string
  icon: string
  color: string
  desc: string
  inp: number
  out: number
}

export interface FlowExportMeta {
  version: number
  exportedAt: string
  mode: FlowMode
  theme: FlowTheme
}

export interface FlowSnapshot {
  meta: FlowExportMeta
  viewport: FlowTransform
  nodes: FlowNode[]
  edges: FlowEdge[]
}
