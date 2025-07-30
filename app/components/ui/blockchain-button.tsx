'use client'

import * as React from "react"
import { clsx } from "clsx"

export interface BlockchainButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'cyber'
  size?: 'default' | 'sm' | 'lg'
  glow?: boolean
}

const BlockchainButton = React.forwardRef<HTMLButtonElement, BlockchainButtonProps>(
  ({ className, variant = 'primary', size = 'default', glow = false, ...props }, ref) => {
    return (
      <button
        className={clsx(
          "relative inline-flex items-center justify-center rounded-lg text-sm font-mono font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border overflow-hidden group",
          {
            // Primary - Cyan gradient with glow
            "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 hover:from-cyan-400 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/25": variant === 'primary',
            
            // Secondary - Purple gradient
            "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 hover:from-purple-400 hover:to-indigo-500 shadow-lg hover:shadow-purple-500/25": variant === 'secondary',
            
            // Ghost - Transparent with border
            "bg-transparent text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400": variant === 'ghost',
            
            // Cyber - Green matrix style
            "bg-gradient-to-r from-green-500 to-emerald-600 text-black border-green-400 hover:from-green-400 hover:to-emerald-500 shadow-lg hover:shadow-green-500/25": variant === 'cyber',
          },
          {
            "h-10 px-4 py-2": size === 'default',
            "h-9 rounded-md px-3": size === 'sm',
            "h-11 rounded-md px-8": size === 'lg',
          },
          glow && "shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/75",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse" />
        
        {/* Content */}
        <span className="relative z-10">{props.children}</span>
        
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-30" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current opacity-30" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current opacity-30" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-30" />
      </button>
    )
  }
)
BlockchainButton.displayName = "BlockchainButton"

export { BlockchainButton }