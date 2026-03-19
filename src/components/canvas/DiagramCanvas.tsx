import { useCallback, useRef, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  ReactFlow, Background, Controls, MiniMap, SelectionMode, useReactFlow,
  type OnNodesChange, type OnEdgesChange, type OnConnect, type NodeTypes, type EdgeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import {
  canvasStore, applyNodeChangesToStore, applyEdgeChangesToStore,
  connectNodes, addNode, deleteSelected, undo, redo, groupSelected, updateEdgeConnection, useCanvasStore
} from '../../store/canvas.store'
import { CATEGORY_STYLE, type NodeTemplate } from '../../types/diagram'
import type { DiagramNode, DiagramEdge } from '../../types/diagram'
import DiagramNodeComponent from './DiagramNode'
import DiagramEdgeComponent from './DiagramEdge'

const nodeTypes: NodeTypes = { diagram: DiagramNodeComponent }
const edgeTypes: EdgeTypes = { smoothstep: DiagramEdgeComponent }
let nodeCounter = Date.now()

export default function DiagramCanvas() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && (resolvedTheme === 'dark')
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const snapToGrid = useCanvasStore((s) => s.snapToGrid)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { fitView } = useReactFlow()
  const [showDelete, setShowDelete] = useState(false)

  const selectedCount = nodes.filter(n => n.selected).length + edges.filter(e => e.selected).length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (typeof tag === 'string' && (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')) return
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') { e.preventDefault(); groupSelected() }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const hasSelection = canvasStore.state.nodes.some(n => n.selected) || canvasStore.state.edges.some(e => e.selected)
        if (hasSelection) {
          setShowDelete(true)
        }
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        const selectedNodes = canvasStore.state.nodes.filter((n) => n.selected)
        if (selectedNodes.length > 0) fitView({ nodes: selectedNodes, duration: 400 })
        else fitView({ duration: 400 })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!showDelete) return
    const onModalKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        deleteSelected()
        setShowDelete(false)
      }
      if (e.key === 'Escape') {
        setShowDelete(false)
      }
    }
    window.addEventListener('keydown', onModalKey)
    return () => window.removeEventListener('keydown', onModalKey)
  }, [showDelete])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => applyNodeChangesToStore(changes),
    []
  )
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => applyEdgeChangesToStore(changes),
    []
  )
  const onConnect: OnConnect = useCallback((conn) => connectNodes(conn), [])

  const onReconnect = useCallback((oldEdge: any, newConnection: any) => {
    updateEdgeConnection(oldEdge as DiagramEdge, newConnection)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/sysdesign')
    if (!raw) return
    const template: NodeTemplate = JSON.parse(raw)
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    nodeCounter++
    const node: DiagramNode = {
      id: `node-${nodeCounter}`,
      type: 'diagram',
      position: { x: e.clientX - rect.left - 75, y: e.clientY - rect.top - 40 },
      data: {
        label: template.label,
        category: template.category,
        subtype: template.subtype,
        icon: template.icon,
        description: template.description,
      },
    }
    addNode(node)
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        colorMode={isDark ? 'dark' : 'light'}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={SelectionMode.Partial}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
      >
        <Background color="var(--border)" gap={20} size={1} />
        <Controls />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            const cat = (n.data as { category?: string })?.category
            return cat ? CATEGORY_STYLE[cat as keyof typeof CATEGORY_STYLE]?.color ?? '#aaa' : '#aaa'
          }}
        />
      </ReactFlow>

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight">
                Delete items?
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Are you sure you want to delete {selectedCount} selected item{selectedCount !== 1 ? 's' : ''}? This action can be undone later with Ctrl+Z.
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-2.5 mt-2">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteSelected();
                  setShowDelete(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
