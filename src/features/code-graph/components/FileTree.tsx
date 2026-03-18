import { useMemo } from 'react'
import type Graph from 'graphology'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

interface FileTreeNode {
  name: string
  path: string
  children: Map<string, FileTreeNode>
  isFile: boolean
}

interface FileTreeProps {
  graph: Graph | null
  selectedNode: string | null
  onSelectNode: (nodeId: string | null) => void
}

function createTreeNode(name: string, path: string): FileTreeNode {
  return {
    name,
    path,
    children: new Map<string, FileTreeNode>(),
    isFile: false,
  }
}

function buildFileTree(graph: Graph): FileTreeNode {
  const root = createTreeNode('root', '')

  graph.forEachNode((nodeId, attributes) => {
    if (attributes.type !== 'file') {
      return
    }

    const filePath = String(attributes.path ?? nodeId)
    const parts = filePath.split('/').filter(Boolean)
    let current = root

    parts.forEach((part, index) => {
      const nodePath = parts.slice(0, index + 1).join('/')
      const existing = current.children.get(part)

      if (existing) {
        current = existing
        return
      }

      const child = createTreeNode(part, nodePath)
      child.isFile = index === parts.length - 1
      current.children.set(part, child)
      current = child
    })
  })

  return root
}

function FileTreeBranch({
  node,
  selectedNode,
  onSelectNode,
}: {
  node: FileTreeNode
  selectedNode: string | null
  onSelectNode: (nodeId: string | null) => void
}) {
  const sortedChildren = Array.from(node.children.values()).sort((left, right) => {
    if (left.isFile === right.isFile) {
      return left.name.localeCompare(right.name)
    }
    return left.isFile ? 1 : -1
  })

  if (node.isFile) {
    const active = selectedNode === node.path

    return (
      <button
        className={cn(
          'block w-full rounded px-2 py-1 text-left text-xs text-text-muted transition hover:bg-elevated hover:text-text',
          active && 'bg-elevated text-text',
        )}
        onClick={() => onSelectNode(node.path)}
      >
        {node.name}
      </button>
    )
  }

  return (
    <details open>
      <summary className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-text-muted hover:bg-elevated hover:text-text">
        {node.name || 'src'}
      </summary>
      <div className="mt-1 space-y-1 pl-3">
        {sortedChildren.map((child) => (
          <FileTreeBranch
            key={child.path}
            node={child}
            selectedNode={selectedNode}
            onSelectNode={onSelectNode}
          />
        ))}
      </div>
    </details>
  )
}

export function FileTree({ graph, selectedNode, onSelectNode }: FileTreeProps) {
  const tree = useMemo(() => {
    if (!graph) {
      return null
    }

    return buildFileTree(graph)
  }, [graph])

  return (
    <Card className="h-full">
      <CardHeader className="mb-3">
        <CardTitle>File Tree</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[65vh] overflow-auto space-y-1">
        {!tree || tree.children.size === 0 ? (
          <p className="text-xs text-text-muted">No files parsed yet.</p>
        ) : (
          Array.from(tree.children.values()).map((node) => (
            <FileTreeBranch
              key={node.path}
              node={node}
              selectedNode={selectedNode}
              onSelectNode={onSelectNode}
            />
          ))
        )}
      </CardContent>
      <CardContent>
        <Button variant="ghost" size="sm" className="w-full" onClick={() => onSelectNode(null)}>
          Clear Selection
        </Button>
      </CardContent>
    </Card>
  )
}
