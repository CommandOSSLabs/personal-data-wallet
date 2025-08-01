'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, Text, Group, ActionIcon, Badge, Stack, Box } from '@mantine/core'
import { IconRefresh, IconZoomIn, IconZoomOut } from '@tabler/icons-react'

interface MemoryNode {
  id: string
  label: string
  category: string
  connections: number
  isEncrypted: boolean
  walrusHash?: string
  decrypted: boolean
  fullContent?: string
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
    isEncrypted?: boolean
    walrusHash?: string
  }>
  userAddress: string
}

export function MemoryGraph({ memories, userAddress }: MemoryGraphProps) {
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
      connections: 0,
      isEncrypted: memory.isEncrypted || false,
      walrusHash: memory.walrusHash,
      decrypted: false,
      fullContent: undefined
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

  // Add auto-decrypt functionality
  const [isDecrypting, setIsDecrypting] = useState(false)
  
  // Auto-decrypt nodes when loaded
  useEffect(() => {
    if (nodes.length > 0 && userAddress) {
      decryptAllNodes()
    }
  }, [nodes, userAddress]) // Re-run when nodes or userAddress changes
  
  const decryptAllNodes = async () => {
    if (isDecrypting || !userAddress) return
    
    setIsDecrypting(true)
    try {
      // Get nodes that need decryption and have walrusHash
      const nodesToDecrypt = nodes.filter(node => 
        node.isEncrypted && !node.decrypted && node.walrusHash
      )
      
      if (nodesToDecrypt.length === 0) {
        setIsDecrypting(false)
        return
      }
      
      // Process in batches
      const batchSize = 3
      const updatedNodes = [...nodes]
      
      for (let i = 0; i < nodesToDecrypt.length; i += batchSize) {
        const batch = nodesToDecrypt.slice(i, i + batchSize)
        await Promise.all(batch.map(async (node) => {
          try {
            if (node.walrusHash) {
              const response = await fetch(`/api/memory/content/${node.walrusHash}`)
              if (response.ok) {
                const contentData = await response.json()
                if (contentData.content) {
                  // Find node in the nodes array and update it
                  const nodeIndex = updatedNodes.findIndex(n => n.id === node.id)
                  if (nodeIndex !== -1) {
                    updatedNodes[nodeIndex] = {
                      ...updatedNodes[nodeIndex],
                      decrypted: true,
                      fullContent: contentData.content,
                      label: contentData.content.slice(0, 30) + (contentData.content.length > 30 ? '...' : '')
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Failed to decrypt node ${node.id}:`, err)
          }
        }))
      }
      
      // Update all nodes at once
      setNodes(updatedNodes)
    } catch (error) {
      console.error('Failed to decrypt all nodes:', error)
    } finally {
      setIsDecrypting(false)
    }
  }
  
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

    // Calculate node positions using force-directed layout (improved)
    const nodePositions: { [key: string]: { x: number; y: number } } = {}
    const centerX = width / 2
    const centerY = height / 2
    
    // Group nodes by category for better visualization
    const nodesByCategory: { [key: string]: MemoryNode[] } = {}
    nodes.forEach(node => {
      if (!nodesByCategory[node.category]) {
        nodesByCategory[node.category] = []
      }
      nodesByCategory[node.category].push(node)
    })
    
    // Position nodes in category clusters
    let categoryIndex = 0
    const categoryCount = Object.keys(nodesByCategory).length
    
    Object.entries(nodesByCategory).forEach(([category, categoryNodes]) => {
      const categoryAngle = (categoryIndex / categoryCount) * 2 * Math.PI
      const categoryRadius = Math.min(width, height) * 0.3 * zoom
      const categoryX = centerX + Math.cos(categoryAngle) * (categoryRadius / 2)
      const categoryY = centerY + Math.sin(categoryAngle) * (categoryRadius / 2)
      
      // Position nodes around their category center
      categoryNodes.forEach((node, nodeIndex) => {
        const nodeCount = categoryNodes.length
        const nodeAngle = (nodeIndex / Math.max(1, nodeCount)) * 2 * Math.PI
        const nodeRadius = Math.min(50, 120 / Math.max(1, Math.sqrt(nodeCount))) * zoom
        
        nodePositions[node.id] = {
          x: categoryX + Math.cos(nodeAngle) * nodeRadius,
          y: categoryY + Math.sin(nodeAngle) * nodeRadius
        }
      })
      
      categoryIndex++
    })

    // Draw edges with better styling
    edges.forEach(edge => {
      const source = nodePositions[edge.source]
      const target = nodePositions[edge.target]
      if (source && target) {
        // Draw curved edges for better visualization
        const midX = (source.x + target.x) / 2
        const midY = (source.y + target.y) / 2
        const offset = Math.min(40, Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / 4)
        
        // Compute control point offset
        const dx = target.x - source.x
        const dy = target.y - source.y
        const norm = Math.sqrt(dx * dx + dy * dy)
        const nx = -dy / norm
        const ny = dx / norm
        
        // Draw curved path
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.quadraticCurveTo(
          midX + nx * offset,
          midY + ny * offset,
          target.x, 
          target.y
        )
        
        // Style based on edge weight
        ctx.strokeStyle = `rgba(120, 120, 250, ${edge.weight})`
        ctx.lineWidth = edge.weight * 2 + 0.5
        ctx.stroke()
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositions[node.id]
      if (!pos) return

      // Node glow effect
      const nodeSize = Math.min(30, 15 + node.connections * 3)
      const glowSize = nodeSize + 10
      
      // Glow effect
      const gradient = ctx.createRadialGradient(
        pos.x, pos.y, nodeSize * 0.5,
        pos.x, pos.y, glowSize
      )
      gradient.addColorStop(0, getCategoryColor(node.category))
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      
      ctx.globalAlpha = 0.3
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, glowSize, 0, 2 * Math.PI)
      ctx.fill()
      
      // Node circle
      ctx.globalAlpha = 0.9
      ctx.fillStyle = getCategoryColor(node.category)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeSize, 0, 2 * Math.PI)
      ctx.fill()
      
      // Node border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Node label with improved visibility
      ctx.globalAlpha = 1
      
      // Text background for better readability
      const textWidth = node.label.length * 6
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.fillRect(pos.x - textWidth/2, pos.y + nodeSize + 5, textWidth, 16)
      
      // Text
      ctx.fillStyle = '#333'
      ctx.font = 'bold 12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(node.label, pos.x, pos.y + nodeSize + 18)
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