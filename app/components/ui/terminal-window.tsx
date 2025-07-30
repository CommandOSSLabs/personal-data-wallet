'use client'

import * as React from "react"
import { clsx } from "clsx"

interface TerminalWindowProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export function TerminalWindow({ children, title = "Personal Data Wallet", className }: TerminalWindowProps) {
  return (
    <div className={clsx(
      "bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 overflow-hidden",
      className
    )}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 border-b border-cyan-500/20">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" />
          </div>
          <div className="text-xs font-mono text-gray-400 ml-4">
            {title}
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>ONLINE</span>
          </div>
          <div className="text-cyan-400">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Terminal Content */}
      <div className="relative">
        {children}
        
        {/* Scanning line effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  )
}