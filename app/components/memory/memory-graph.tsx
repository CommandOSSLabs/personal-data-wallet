'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, Text, Group, ActionIcon, Badge, Stack, Box, Select } from '@mantine/core'
import { IconRefresh, IconZoomIn, IconZoomOut, IconCube, IconCircle } from '@tabler/icons-react'

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
  const animationRef = useRef<number>()
  const [nodes, setNodes] = useState<MemoryNode[]>([])
  const [edges, setEdges] = useState<MemoryEdge[]>([])
  const [zoom, setZoom] = useState(1)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    if (memories.length === 0) return

    // Convert memories to graph nodes with physics properties
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
  }, [nodes, edges, zoom, selectedNode, animationFrame])

  // Animation loop for selected node pulsing
  useEffect(() => {
    if (selectedNode) {
      const animate = () => {
        setAnimationFrame(prev => prev + 1)
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [selectedNode])

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f8fafc')
    gradient.addColorStop(1, '#e2e8f0')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Calculate node positions using the helper function
    const nodePositions = calculateNodePositions(width, height)

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
        
        // Enhanced edge styling with glow
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)'
        ctx.shadowBlur = 5
        ctx.strokeStyle = `rgba(59, 130, 246, ${edge.weight * 0.8})`
        ctx.lineWidth = Math.max(2, edge.weight * 3)
        ctx.stroke()

        // Reset shadow
        ctx.shadowBlur = 0
      }
    })

    // Draw nodes with enhanced 3D-like styling
    nodes.forEach(node => {
      const pos = nodePositions[node.id]
      if (!pos) return

      const baseNodeSize = Math.min(35, 20 + node.connections * 4)
      const isSelected = selectedNode === node.id
      const baseColor = getCategoryColor(node.category)

      // Add pulsing effect for selected node
      const pulseScale = isSelected ? 1 + Math.sin(animationFrame * 0.1) * 0.1 : 1
      const nodeSize = baseNodeSize * pulseScale

      // Parse color to get RGB values for gradient
      const colorMatch = baseColor.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
      let r = 107, g = 114, b = 128 // default gray
      if (colorMatch) {
        r = parseInt(colorMatch[1], 16)
        g = parseInt(colorMatch[2], 16)
        b = parseInt(colorMatch[3], 16)
      }

      // Drop shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = isSelected ? 15 : 8
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3

      // Outer glow effect
      const outerGlow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, nodeSize + 15)
      outerGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`)
      outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.globalAlpha = isSelected ? 0.6 : 0.3
      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeSize + 15, 0, 2 * Math.PI)
      ctx.fill()

      // Main node with radial gradient for 3D effect
      const nodeGradient = ctx.createRadialGradient(
        pos.x - nodeSize * 0.3, pos.y - nodeSize * 0.3, 0,
        pos.x, pos.y, nodeSize
      )
      nodeGradient.addColorStop(0, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, 1)`)
      nodeGradient.addColorStop(0.7, baseColor)
      nodeGradient.addColorStop(1, `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, 1)`)

      ctx.globalAlpha = 1
      ctx.fillStyle = nodeGradient
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeSize, 0, 2 * Math.PI)
      ctx.fill()

      // Enhanced border
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.strokeStyle = isSelected ? '#fbbf24' : '#ffffff'
      ctx.lineWidth = isSelected ? 4 : 2
      ctx.stroke()
      
      // Enhanced text rendering
      ctx.globalAlpha = 1

      // Text with shadow for better visibility
      ctx.font = 'bold 11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Text shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillText(node.label, pos.x + 1, pos.y + 1)

      // Main text
      ctx.fillStyle = '#ffffff'
      ctx.fillText(node.label, pos.x, pos.y)

      // Category label for selected nodes
      if (isSelected) {
        ctx.font = '10px Inter, sans-serif'
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillText(node.category, pos.x, pos.y + nodeSize + 20)
      }
    })
  }

  // Helper function to calculate node positions (shared between drawing and click detection)
  const calculateNodePositions = (canvasWidth: number, canvasHeight: number): { [key: string]: { x: number; y: number } } => {
    const nodePositions: { [key: string]: { x: number; y: number } } = {}
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const minDistance = 80

    // Group nodes by category
    const nodesByCategory: { [key: string]: MemoryNode[] } = {}
    nodes.forEach(node => {
      if (!nodesByCategory[node.category]) {
        nodesByCategory[node.category] = []
      }
      nodesByCategory[node.category].push(node)
    })

    let categoryIndex = 0
    const categoryCount = Object.keys(nodesByCategory).length

    if (categoryCount === 1) {
      // Single category - arrange in a circle
      const category = Object.keys(nodesByCategory)[0]
      const categoryNodes = nodesByCategory[category]
      const nodeCount = categoryNodes.length

      if (nodeCount === 1) {
        nodePositions[categoryNodes[0].id] = { x: centerX, y: centerY }
      } else {
        let currentRadius = 80
        let nodesPlaced = 0

        while (nodesPlaced < nodeCount) {
          const nodesInThisCircle = Math.min(
            Math.floor(2 * Math.PI * currentRadius / minDistance),
            nodeCount - nodesPlaced
          )

          for (let i = 0; i < nodesInThisCircle && nodesPlaced < nodeCount; i++) {
            const angle = (i / nodesInThisCircle) * 2 * Math.PI
            nodePositions[categoryNodes[nodesPlaced].id] = {
              x: centerX + Math.cos(angle) * currentRadius,
              y: centerY + Math.sin(angle) * currentRadius
            }
            nodesPlaced++
          }
          currentRadius += minDistance
        }
      }
    } else {
      // Multiple categories
      Object.entries(nodesByCategory).forEach(([category, categoryNodes]) => {
        const categoryAngle = (categoryIndex / categoryCount) * 2 * Math.PI
        const categoryRadius = Math.min(canvasWidth, canvasHeight) * 0.25
        const categoryX = centerX + Math.cos(categoryAngle) * categoryRadius
        const categoryY = centerY + Math.sin(categoryAngle) * categoryRadius

        const nodeCount = categoryNodes.length

        if (nodeCount === 1) {
          nodePositions[categoryNodes[0].id] = { x: categoryX, y: categoryY }
        } else {
          const nodeRadius = Math.max(60, minDistance * nodeCount / (2 * Math.PI))

          categoryNodes.forEach((node, nodeIndex) => {
            const nodeAngle = (nodeIndex / nodeCount) * 2 * Math.PI
            nodePositions[node.id] = {
              x: categoryX + Math.cos(nodeAngle) * nodeRadius,
              y: categoryY + Math.sin(nodeAngle) * nodeRadius
            }
          })
        }

        categoryIndex++
      })
    }

    return nodePositions
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      // Match the actual categories from the backend
      'personal_info': '#3b82f6',
      'location': '#10b981',
      'career': '#f59e0b',
      'preference': '#ef4444',
      'custom': '#8b5cf6',
      'education': '#06b6d4',
      'contact': '#84cc16',
      'background': '#f97316',
      'health': '#ec4899',

      // Legacy categories
      'personal': '#69db7c',
      'work': '#ffd43b',
      'preferences': '#ff8cc8',
      'skills': '#9775fa',
      'auto-detected': '#4dabf7',

      'default': '#6b7280'
    }
    return colors[category] || colors.default
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setSelectedNode(null)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert to canvas coordinates
    const canvasX = (x / rect.width) * canvas.width
    const canvasY = (y / rect.height) * canvas.height

    // Use the same positioning logic as drawGraph
    const nodePositions = calculateNodePositions(canvas.width, canvas.height)

    // Find clicked node
    let closestNode = null
    let minDistance = Infinity

    for (const node of nodes) {
      const pos = nodePositions[node.id]
      if (pos) {
        const nodeSize = Math.min(35, 20 + node.connections * 4)
        const distance = Math.sqrt(Math.pow(canvasX - pos.x, 2) + Math.pow(canvasY - pos.y, 2))

        if (distance <= nodeSize && distance < minDistance) {
          minDistance = distance
          closestNode = node.id
        }
      }
    }

    setSelectedNode(closestNode)
  }

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
          <Select
            value={viewMode}
            onChange={(value) => setViewMode(value as '2d' | '3d')}
            data={[
              { value: '2d', label: '2D View' },
              { value: '3d', label: '3D View' }
            ]}
            size="xs"
            w={100}
          />
          <ActionIcon variant="light" onClick={handleZoomOut} title="Zoom Out">
            <IconZoomOut size={16} />
          </ActionIcon>
          <ActionIcon variant="light" onClick={handleReset} title="Reset View">
            <IconRefresh size={16} />
          </ActionIcon>
          <ActionIcon variant="light" onClick={handleZoomIn} title="Zoom In">
            <IconZoomIn size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Box style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onClick={handleCanvasClick}
          style={{
            width: '100%',
            height: 400,
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        />
      </Box>

      {/* Selected Node Info */}
      {selectedNode && (
        <Box mt="sm" p="sm" bg="gray.0" style={{ borderRadius: 8 }}>
          {(() => {
            const node = nodes.find(n => n.id === selectedNode)
            if (!node) return null

            return (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={600} size="sm">Selected Memory</Text>
                  <Badge size="xs" color={getCategoryColor(node.category)}>
                    {node.category}
                  </Badge>
                </Group>
                <Text size="sm">
                  {node.fullContent || node.label}
                </Text>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    Connections: {node.connections}
                  </Text>
                  {node.isEncrypted && (
                    <Badge size="xs" color="red" variant="light">
                      Encrypted
                    </Badge>
                  )}
                </Group>
              </Stack>
            )
          })()}
        </Box>
      )}

      <Group mt="sm" gap="md">
        {Object.entries({
          'personal_info': '#3b82f6',
          'location': '#10b981',
          'career': '#f59e0b',
          'preference': '#ef4444',
          'custom': '#8b5cf6',
          'education': '#06b6d4'
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
              {category.replace('_', ' ')}
            </Text>
          </Group>
        ))}
      </Group>
    </Card>
  )
}