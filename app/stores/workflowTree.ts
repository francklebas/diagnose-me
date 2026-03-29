import type { FlowSnapshot } from "~/types/flow"

export interface WorkflowTreeNode {
  id: string
  label: string
  children: WorkflowTreeNode[]
}

export interface WorkflowEntry {
  id: string
  name: string
  parentId: string | null
  snapshot: FlowSnapshot
  updatedAt: string
}

export const useWorkflowTreeStore = defineStore("workflow-tree", () => {
  const tree = ref<WorkflowTreeNode[]>([])
  const workflows = ref<Record<string, WorkflowEntry>>({})
  const activeWorkflowId = ref<string | null>(null)

  const activeWorkflow = computed(() => {
    if (!activeWorkflowId.value) {
      return null
    }
    return workflows.value[activeWorkflowId.value] ?? null
  })

  function setTree(nextTree: WorkflowTreeNode[]): void {
    tree.value = nextTree
  }

  function setActiveWorkflow(workflowId: string | null): void {
    activeWorkflowId.value = workflowId
  }

  function upsertWorkflow(entry: {
    id: string
    name: string
    parentId?: string | null
    snapshot: FlowSnapshot
  }): void {
    const existing = workflows.value[entry.id]
    workflows.value[entry.id] = {
      id: entry.id,
      name: entry.name,
      parentId: entry.parentId ?? null,
      snapshot: entry.snapshot,
      updatedAt: new Date().toISOString(),
    }

    if (!existing && !tree.value.some((node) => node.id === entry.id)) {
      tree.value.push({ id: entry.id, label: entry.name, children: [] })
    }

    if (!activeWorkflowId.value) {
      activeWorkflowId.value = entry.id
    }
  }

  function updateWorkflowSnapshot(workflowId: string, snapshot: FlowSnapshot): void {
    const workflow = workflows.value[workflowId]
    if (!workflow) {
      return
    }

    workflow.snapshot = snapshot
    workflow.updatedAt = new Date().toISOString()
  }

  function removeWorkflow(workflowId: string): void {
    if (!workflows.value[workflowId]) {
      return
    }

    delete workflows.value[workflowId]
    tree.value = tree.value.filter((node) => node.id !== workflowId)

    if (activeWorkflowId.value === workflowId) {
      activeWorkflowId.value = Object.keys(workflows.value)[0] ?? null
    }
  }

  return {
    tree,
    workflows,
    activeWorkflowId,
    activeWorkflow,
    setTree,
    setActiveWorkflow,
    upsertWorkflow,
    updateWorkflowSnapshot,
    removeWorkflow,
  }
})
