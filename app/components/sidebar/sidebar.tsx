'use client'

import { useState } from 'react'
import { ChatSession, MemoryItem } from '@/app/types'
import { Button } from '@/app/components/ui/button'
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Brain, 
  Clock, 
  Tag,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { clsx } from 'clsx'

interface SidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  memories: MemoryItem[]
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onClearMemories: () => void
}

export function Sidebar({ 
  sessions, 
  currentSessionId, 
  memories,
  onNewChat, 
  onSelectSession, 
  onDeleteSession,
  onClearMemories
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'memories'>('chats')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['facts']))

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Group memories by category
  const memoriesByCategory = memories.reduce((acc, memory) => {
    if (!acc[memory.category]) {
      acc[memory.category] = []
    }
    acc[memory.category].push(memory)
    return acc
  }, {} as Record<string, MemoryItem[]>)

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={onNewChat}
          className="w-full justify-start"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('chats')}
          className={clsx(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'chats'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Chats
        </button>
        <button
          onClick={() => setActiveTab('memories')}
          className={clsx(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'memories'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Brain className="w-4 h-4 inline mr-2" />
          Memory
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' ? (
          <div className="p-2">
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chat history yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={clsx(
                      'group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors',
                      currentSessionId === session.id
                        ? 'bg-gray-200'
                        : 'hover:bg-gray-100'
                    )}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {session.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-2">
            {/* Memory Stats */}
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Memory Overview</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{memories.length}</div>
                  <div className="text-gray-500">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{Object.keys(memoriesByCategory).length}</div>
                  <div className="text-gray-500">Categories</div>
                </div>
              </div>
            </div>

            {/* Memory Categories */}
            {Object.keys(memoriesByCategory).length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No memories stored yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(memoriesByCategory).map(([category, items]) => (
                  <div key={category} className="border border-gray-200 rounded-md">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {category}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({items.length})
                        </span>
                      </div>
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedCategories.has(category) && (
                      <div className="border-t border-gray-200 p-2 space-y-2">
                        {items.map((memory) => (
                          <div
                            key={memory.id}
                            className="p-2 bg-gray-50 rounded text-xs"
                          >
                            <div className="font-medium text-gray-900 mb-1">
                              {memory.content.substring(0, 100)}
                              {memory.content.length > 100 && '...'}
                            </div>
                            <div className="text-gray-500 flex items-center justify-between">
                              <span className="capitalize">{memory.type}</span>
                              <span>{memory.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Memory Actions */}
            {memories.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={onClearMemories}
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Memories
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}