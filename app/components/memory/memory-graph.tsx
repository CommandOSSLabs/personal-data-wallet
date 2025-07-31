'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, Text, Group, ActionIcon, Badge, Stack, Box } from '@mantine/core'
import { IconRefresh, IconZoomIn, IconZoomOut } from '@tabler/icons-react'

interface MemoryNode {
  id: string
  label: string
  category: string
  connections: number
}

interface MemoryEdge {
  source: string
  target: string
  weight: number
}

interface MemoryGraphProps {
  memories: Array<{
    id: string
    content: string
    category: string
    similarity?: number
  }>
}

export function MemoryGraph({ memories }: MemoryGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<MemoryNode[]>([])
  const [edges, setEdges] = useState<MemoryEdge[]>([])
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (memories.length === 0) return

    // Convert memories to graph nodes
    const graphNodes: MemoryNode[] = memories.map((memory, index) => ({
      id: memory.id,
      label: memory.content.slice(0, 30) + (memory.content.length > 30 ? '...' : ''),
      category: memory.category,
      connections: 0
    }))

    // Create edges based on category similarity and content similarity
    const graphEdges: MemoryEdge[] = []
    for (let i = 0; i < graphNodes.length; i++) {
      for (let j = i + 1; j < graphNodes.length; j++) {
        const node1 = graphNodes[i]
        const node2 = graphNodes[j]
        
        // Connect nodes in same category
        if (node1.category === node2.category) {
          graphEdges.push({
            source: node1.id,
            target: node2.id,
            weight: 0.8
          })
          node1.connections++
          node2.connections++
        }
        
        // Connect nodes with similar content (simple word overlap)
        const words1 = memories[i].content.toLowerCase().split(' ')
        const words2 = memories[j].content.toLowerCase().split(' ')
        const commonWords = words1.filter(word => words2.includes(word) && word.length > 3)
        
        if (commonWords.length >= 2) {
          graphEdges.push({
            source: node1.id,
            target: node2.id,
            weight: Math.min(commonWords.length / 5, 0.6)
          })
          node1.connections++
          node2.connections++
        }
      }
    }

    setNodes(graphNodes)
    setEdges(graphEdges)
  }, [memories])

  useEffect(() => {
    drawGraph()
  }, [nodes, edges, zoom])

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate node positions using force-directed layout (simplified)
    const nodePositions: { [key: string]: { x: number; y: number } } = {}
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.3 * zoom

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI
      nodePositions[node.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      }
    })

    // Draw edges
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    edges.forEach(edge => {
      const source = nodePositions[edge.source]
      const target = nodePositions[edge.target]
      if (source && target) {
        ctx.globalAlpha = edge.weight
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositions[node.id]
      if (!pos) return

      // Node circle
      ctx.globalAlpha = 1
      ctx.fillStyle = getCategoryColor(node.category)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 20 + node.connections * 2, 0, 2 * Math.PI)
      ctx.fill()

      // Node border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Node label
      ctx.fillStyle = '#333'
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(node.label, pos.x, pos.y + 40)
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'auto-detected': '#4dabf7',
      'personal': '#69db7c',
      'work': '#ffd43b',
      'preferences': '#ff8cc8',
      'skills': '#9775fa',
      'default': '#ced4da'
    }
    return colors[category] || colors.default
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5))
  const handleReset = () => setZoom(1)

  if (memories.length === 0) {
    return (
      <Card p="md" style={{ height: 400 }}>
        <Stack align="center" justify="center" h="100%">
          <Text c="dimmed" ta="center">
            No memories to visualize yet.<br />
            Start chatting to build your memory graph!
          </Text>
        </Stack>
      </Card>
    )
  }

  return (
    <Card p="md">
      <Group justify="space-between" mb="md">
        <Group>
          <Text fw={600}>Memory Graph</Text>
          <Badge variant="light" color="blue">
            {nodes.length} memories
          </Badge>
        </Group>
        <Group gap="xs">
          <ActionIcon variant="light" onClick={handleZoomOut}>
            <IconZoomOut size={16} />
          </ActionIcon>
          <ActionIcon variant="light" onClick={handleReset}>
            <IconRefresh size={16} />
          </ActionIcon>
          <ActionIcon variant="light" onClick={handleZoomIn}>
            <IconZoomIn size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Box style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          style={{
            width: '100%',
            height: 400,
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            cursor: 'grab'
          }}
        />
      </Box>

      <Group mt="sm" gap="md">
        {Object.entries({
          'auto-detected': '#4dabf7',
          'personal': '#69db7c',
          'work': '#ffd43b',
          'preferences': '#ff8cc8',
          'skills': '#9775fa'
        }).map(([category, color]) => (
          <Group key={category} gap={4}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: color
              }}
            />
            <Text size="xs" c="dimmed">
              {category}
            </Text>
          </Group>
        ))}
      </Group>
    </Card>
  )
}