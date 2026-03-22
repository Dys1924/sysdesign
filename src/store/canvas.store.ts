import { Store } from '@tanstack/store'
import { useState, useEffect } from 'react'
import { applyNodeChanges, applyEdgeChanges, MarkerType } from '@xyflow/react'
import type { NodeChange, EdgeChange, Connection } from '@xyflow/react'
import type { DiagramNode, DiagramEdge } from '../types/diagram'
import { projectStore } from './project.store'
import { supabase } from '../lib/supabase'

let activeProjectId = projectStore.state.activeProjectId

function getStorageKey() {
  return activeProjectId ? `sysdesign-diagram-${activeProjectId}` : 'sysdesign-v2'
}

const MAX_HISTORY = 40

export interface Snapshot {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

export interface CanvasState {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  edgeCounter: number
  history: Snapshot[]
  historyIndex: number
  snapToGrid: boolean
}

const DEFAULT_CANVAS_STATE: CanvasState = {
  nodes: [],
  edges: [],
  edgeCounter: 0,
  history: [{ nodes: [], edges: [] }],
  historyIndex: 0,
  snapToGrid: false,
}

async function load(): Promise<Partial<CanvasState>> {
  if (typeof window === 'undefined') return {}
  
  const user = projectStore.state.user
  if (user && activeProjectId) {
    const { data, error } = await supabase
      .from('projects')
      .select('nodes, edges, edge_counter')
      .eq('id', activeProjectId)
      .single()
    
    if (error) {
      console.error('Supabase load error:', error.message)
      return {}
    }
    
    return {
      nodes: data.nodes as DiagramNode[],
      edges: data.edges as DiagramEdge[],
      edgeCounter: data.edge_counter as number,
    }
  }

  try {
    const raw = localStorage.getItem(getStorageKey())
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

async function save(s: CanvasState) {
  if (typeof window === 'undefined') return
  
  const user = projectStore.state.user
  if (user && activeProjectId) {
    // Autosave to Supabase
    const { error } = await supabase
      .from('projects')
      .update({
        nodes: s.nodes,
        edges: s.edges,
        edge_counter: s.edgeCounter,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeProjectId)
    
    if (error) console.error('Supabase save error:', error.message)
    return
  }

  try {
    localStorage.setItem(getStorageKey(), JSON.stringify({
      nodes: s.nodes, edges: s.edges, edgeCounter: s.edgeCounter,
      snapToGrid: s.snapToGrid,
    }))
  } catch {}
}

export const canvasStore = new Store<CanvasState>(DEFAULT_CANVAS_STATE)

// Load initial data
if (typeof window !== 'undefined') {
  load().then(saved => {
    canvasStore.setState((s) => ({
      ...s,
      nodes: saved.nodes ?? [],
      edges: saved.edges ?? [],
      edgeCounter: saved.edgeCounter ?? 0,
      history: [{ nodes: saved.nodes ?? [], edges: saved.edges ?? [] }],
      snapToGrid: saved.snapToGrid ?? false,
    }))
  })
}

// Subscribe to project changes to reload relevant data
projectStore.subscribe(() => {
  const newActiveId = projectStore.state.activeProjectId
  if (newActiveId !== activeProjectId) {
    activeProjectId = newActiveId
    load().then(newSaved => {
      canvasStore.setState((s) => ({
        ...s,
        nodes: newSaved.nodes ?? [],
        edges: newSaved.edges ?? [],
        edgeCounter: newSaved.edgeCounter ?? 0,
        history: [{ nodes: newSaved.nodes ?? [], edges: newSaved.edges ?? [] }],
        historyIndex: 0,
        snapToGrid: newSaved.snapToGrid ?? false,
      }))
    })
  }
})


export function toggleSnap() {
  canvasStore.setState((s) => {
    const next = { ...s, snapToGrid: !s.snapToGrid }
    save(next)
    return next
  })
}

function pushHistory(s: CanvasState): CanvasState {
  const snap: Snapshot = {
    nodes: JSON.parse(JSON.stringify(s.nodes)),
    edges: JSON.parse(JSON.stringify(s.edges)),
  }
  const trimmed = s.history.slice(0, s.historyIndex + 1)
  const next = [...trimmed, snap].slice(-MAX_HISTORY)
  return { ...s, history: next, historyIndex: next.length - 1 }
}

export function applyNodeChangesToStore(changes: NodeChange[]) {
  canvasStore.setState((s) => {
    const nodes = applyNodeChanges(changes, s.nodes) as DiagramNode[]
    const next = { ...s, nodes }
    save(next)
    return next
  })
}

export function applyEdgeChangesToStore(changes: EdgeChange[]) {
  canvasStore.setState((s) => {
    const edges = applyEdgeChanges(changes, s.edges)
    const next = { ...s, edges }
    save(next)
    return next
  })
}

export function connectNodes(connection: Connection) {
  canvasStore.setState((s) => {
    const edge: DiagramEdge = {
      id: `e-${s.edgeCounter + 1}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      type: 'smoothstep',
      style: { stroke: 'var(--border)', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border)' },
    }
    const next = pushHistory({ ...s, edges: [...s.edges, edge], edgeCounter: s.edgeCounter + 1 })
    save(next)
    return next
  })
}

export function updateEdgeConnection(oldEdge: DiagramEdge, newConnection: Connection) {
  canvasStore.setState((s) => {
    const edges = s.edges.map(e => {
      if (e.id === oldEdge.id) {
        return {
          ...e,
          source: newConnection.source,
          target: newConnection.target,
          sourceHandle: newConnection.sourceHandle ?? undefined,
          targetHandle: newConnection.targetHandle ?? undefined,
        }
      }
      return e
    })
    const next = pushHistory({ ...s, edges })
    save(next)
    return next
  })
}

export function addNode(node: DiagramNode) {
  canvasStore.setState((s) => {
    const next = pushHistory({ ...s, nodes: [...s.nodes, node] })
    save(next)
    return next
  })
}

export function updateNodeLabel(id: string, label: string) {
  canvasStore.setState((s) => {
    const nodes = s.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n)
    const next = pushHistory({ ...s, nodes })
    save(next)
    return next
  })
}

export function updateNodeMeta(id: string, meta: Partial<DiagramNode['data']>) {
  canvasStore.setState((s) => {
    const nodes = s.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...meta } } : n)
    const next = pushHistory({ ...s, nodes })
    save(next)
    return next
  })
}

export function updateEdgeMeta(id: string, meta: { label: string; animated?: boolean }) {
  canvasStore.setState((s) => {
    const edges = s.edges.map((e) => e.id === id ? { ...e, data: { ...e.data, ...meta }, label: meta.label } : e)
    const next = pushHistory({ ...s, edges })
    save(next)
    return next
  })
}

export function deleteSelected() {
  canvasStore.setState((s) => {
    const nodes = s.nodes.filter((n) => !n.selected)
    const edges = s.edges.filter((e) => !e.selected)
    if (nodes.length === s.nodes.length && edges.length === s.edges.length) return s
    const next = pushHistory({ ...s, nodes, edges })
    save(next)
    return next
  })
}

export function undo() {
  canvasStore.setState((s) => {
    if (s.historyIndex <= 0) return s
    const idx = s.historyIndex - 1
    const snap = s.history[idx]
    const next = { ...s, ...snap, historyIndex: idx }
    save(next)
    return next
  })
}

export function redo() {
  canvasStore.setState((s) => {
    if (s.historyIndex >= s.history.length - 1) return s
    const idx = s.historyIndex + 1
    const snap = s.history[idx]
    const next = { ...s, ...snap, historyIndex: idx }
    save(next)
    return next
  })
}

export function clearCanvas() {
  canvasStore.setState((s) => {
    const next: CanvasState = {
      ...s,
      nodes: [], edges: [], edgeCounter: 0,
      history: [{ nodes: [], edges: [] }], historyIndex: 0,
    }
    save(next)
    return next
  })
}

export function groupSelected() {
  canvasStore.setState((s) => {
    const selected = s.nodes.filter(n => n.selected && !n.parentId);
    if (selected.length < 1) return s;

    const minX = Math.min(...selected.map(n => n.position.x));
    const minY = Math.min(...selected.map(n => n.position.y));
    const maxX = Math.max(...selected.map(n => n.position.x + (n.measured?.width ?? 180)));
    const maxY = Math.max(...selected.map(n => n.position.y + (n.measured?.height ?? 80)));
    
    const pad = 40;
    const groupNode = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: minX - pad, y: minY - pad },
      style: {
        width: maxX - minX + pad * 2,
        height: maxY - minY + pad * 2 + 30, // Extra space for group label
        backgroundColor: 'oklch(0.5 0 0 / 0.05)',
        border: '1.5px dashed var(--border)',
        borderRadius: 8,
      },
      data: { label: 'New Group' }
    };

    const nodes = s.nodes.map(n => {
      if (n.selected && !n.parentId) {
        return {
          ...n,
          parentId: groupNode.id,
          position: { x: n.position.x - groupNode.position.x, y: n.position.y - groupNode.position.y }
        }
      }
      return n;
    });

    const next = pushHistory({ ...s, nodes: [groupNode as any, ...nodes] });
    save(next);
    return next;
  })
}

export function useCanvasStore<T>(selector: (state: CanvasState) => T): T {
  // Always start with default state for hydration matching
  const [value, setValue] = useState<T>(() => selector(DEFAULT_CANVAS_STATE));

  useEffect(() => {
    // Sync with actual client state on mount
    setValue(selector(canvasStore.state));
    const sub = canvasStore.subscribe(() => {
      setValue(selector(canvasStore.state));
    });
    return () => sub.unsubscribe();
  }, [selector]);

  return value;
}
