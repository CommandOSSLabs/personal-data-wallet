/**
 * Simple event emitter for memory-related events
 * Used to notify components when memories are updated
 */

type MemoryEventType = 'memoriesUpdated' | 'memoryAdded' | 'memoryDeleted'

type MemoryEventListener = (data?: any) => void

class MemoryEventEmitter {
  private listeners: Map<MemoryEventType, MemoryEventListener[]> = new Map()

  /**
   * Subscribe to memory events
   */
  on(event: MemoryEventType, listener: MemoryEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  /**
   * Unsubscribe from memory events
   */
  off(event: MemoryEventType, listener: MemoryEventListener) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit a memory event
   */
  emit(event: MemoryEventType, data?: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Error in memory event listener:', error)
        }
      })
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: MemoryEventType) {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// Export singleton instance
export const memoryEventEmitter = new MemoryEventEmitter()

// Helper functions for common events
export const emitMemoriesUpdated = (data?: any) => {
  memoryEventEmitter.emit('memoriesUpdated', data)
}

export const emitMemoryAdded = (memoryId: string) => {
  memoryEventEmitter.emit('memoryAdded', { memoryId })
}

export const emitMemoryDeleted = (memoryId: string) => {
  memoryEventEmitter.emit('memoryDeleted', { memoryId })
}
