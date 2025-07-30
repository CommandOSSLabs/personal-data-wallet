'use client'

import * as React from "react"
import { clsx } from "clsx"

export interface CyberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'ghost' | 'glow'
}

const CyberInput = React.forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    
    return (
      <div className="relative">
        <input
          type={type}
          className={clsx(
            "flex h-12 w-full rounded-lg border bg-transparent px-4 py-2 text-base font-mono transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            {
              "border-cyan-400/30 text-cyan-100 focus-visible:border-cyan-400 focus-visible:shadow-lg focus-visible:shadow-cyan-500/25": variant === 'default',
              "border-transparent text-gray-300 bg-gray-900/20 focus-visible:border-cyan-400/50": variant === 'ghost',
              "border-cyan-400 text-cyan-100 shadow-lg shadow-cyan-500/20 focus-visible:shadow-cyan-500/40": variant === 'glow',
            },
            isFocused && "ring-2 ring-cyan-400/20",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          ref={ref}
          {...props}
        />
        
        {/* Corner decorations */}
        <div className={clsx(
          "absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 transition-all duration-300",
          isFocused ? "border-cyan-400 opacity-100" : "border-cyan-400/30 opacity-50"
        )} />
        <div className={clsx(
          "absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 transition-all duration-300",
          isFocused ? "border-cyan-400 opacity-100" : "border-cyan-400/30 opacity-50"
        )} />
        <div className={clsx(
          "absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 transition-all duration-300",
          isFocused ? "border-cyan-400 opacity-100" : "border-cyan-400/30 opacity-50"
        )} />
        <div className={clsx(
          "absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 transition-all duration-300",
          isFocused ? "border-cyan-400 opacity-100" : "border-cyan-400/30 opacity-50"
        )} />
        
        {/* Scanning line animation when focused */}
        {isFocused && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 animate-pulse" />
          </div>
        )}
      </div>
    )
  }
)
CyberInput.displayName = "CyberInput"

export { CyberInput }