<template>
  <aside class="panel" :class="{ open: open }">
    <div v-if="node" class="panel-hd">
      <div class="panel-hd-left">
        <span class="panel-icon">{{ node.icon }}</span>
        <span class="panel-title">{{ node.label || "Node" }}</span>
      </div>
      <button class="panel-close" type="button" @click="$emit('close')">×</button>
    </div>

    <div v-if="node" class="panel-body">
      <div class="sec">Node type</div>
      <div class="type-grid">
        <button
          v-for="type in types"
          :key="type.type"
          class="type-chip"
          :class="{ active: node.type === type.type }"
          :style="{ color: type.color }"
          type="button"
          @click="$emit('apply-type', node.id, type.type)"
        >
          <span class="type-chip-icon">{{ type.icon }}</span>
          <span class="type-chip-lbl">{{ type.type }}</span>
        </button>
      </div>

      <div class="sec">Identity</div>
      <label class="field">
        <span class="field-lbl">Label</span>
        <input v-model="node.label" type="text" />
      </label>
      <label class="field">
        <span class="field-lbl">Value (runtime)</span>
        <input v-model="node.value" type="text" placeholder="e.g. ok, 42, true..." />
      </label>
      <label class="field">
        <span class="field-lbl">Description</span>
        <input v-model="node.desc" type="text" />
      </label>

      <div class="sec">State</div>
      <div class="state-row">
        <button
          v-for="stateItem in states"
          :key="stateItem.value"
          class="state-chip"
          :class="[stateItem.className, { on: node.state === stateItem.value }]"
          type="button"
          @click="node.state = stateItem.value"
        >
          {{ stateItem.label }}
        </button>
      </div>

      <div class="sec">Visibility condition</div>

      <div v-if="node.cond.rules.length > 1" class="logic-row">
        <span class="logic-lbl">Rules linked by:</span>
        <button class="logic-btn" type="button" @click="toggleConditionLogic(node)">
          {{ node.cond.logic }}
        </button>
      </div>

      <div class="cond-list">
        <div v-for="(rule, index) in node.cond.rules" :key="`${node.id}-${index}`" class="cond-row">
          <select v-model="rule.nodeId">
            <option value="">- node -</option>
            <option
              v-for="otherNode in availableNodes(node.id)"
              :key="otherNode.id"
              :value="otherNode.id"
            >
              {{ truncateLabel(otherNode.label || otherNode.type) }}
            </option>
          </select>

          <select v-model="rule.op">
            <option v-for="operator in operators" :key="operator" :value="operator">
              {{ operator }}
            </option>
          </select>

          <input
            v-if="rule.op !== 'exists' && rule.op !== '!exists'"
            v-model="rule.value"
            type="text"
            placeholder="value"
          />
          <div v-else />

          <button class="cond-rm" type="button" @click="removeConditionRule(node, index)">×</button>
        </div>
      </div>

      <button class="cond-add" type="button" @click="addConditionRule(node)">
        + Add condition rule
      </button>

      <div v-if="node.cond.rules.length" class="eval-box" :class="isVisible ? 'eval-t' : 'eval-f'">
        <span v-if="isVisible">✓ Condition true - visible in Read mode</span>
        <span v-else>✗ Condition false - hidden in Read mode</span>
      </div>
    </div>

    <div v-if="node" class="panel-ft">
      <button
        class="btn btn-g"
        style="flex: 1"
        type="button"
        @click="$emit('delete-node', node.id)"
      >
        🗑 Delete node
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { FLOW_OPERATORS, truncateText } from "~/utils/flow"
  import type { FlowNode, FlowNodeState, FlowTypeDefinition } from "~/types/flow"

  const props = defineProps<{
    open: boolean
    node: FlowNode | null
    nodes: FlowNode[]
    types: FlowTypeDefinition[]
    isVisible: boolean
  }>()

  defineEmits<{
    close: []
    "delete-node": [nodeId: string]
    "apply-type": [nodeId: string, nodeType: string]
  }>()

  const operators = FLOW_OPERATORS

  const states: Array<{ value: FlowNodeState; label: string; className: string }> = [
    { value: "ok", label: "Ok", className: "s-ok" },
    { value: "warning", label: "Warning", className: "s-warn" },
    { value: "error", label: "Error", className: "s-err" },
    { value: "disabled", label: "Disabled", className: "s-dis" },
  ]

  function availableNodes(currentNodeId: string): FlowNode[] {
    return props.nodes.filter((node) => node.id !== currentNodeId)
  }

  function addConditionRule(node: FlowNode): void {
    node.cond.rules.push({ nodeId: "", op: "==", value: "" })
  }

  function removeConditionRule(node: FlowNode, index: number): void {
    node.cond.rules.splice(index, 1)
  }

  function toggleConditionLogic(node: FlowNode): void {
    node.cond.logic = node.cond.logic === "AND" ? "OR" : "AND"
  }

  function truncateLabel(value: string): string {
    return truncateText(value, 12)
  }
</script>
