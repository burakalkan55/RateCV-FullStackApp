'use client'

import React, { createContext, useState, useContext, ReactNode, useRef } from 'react'
import LoadingOverlay from '../components/LoadingOverlay'

interface LoadingContextType {
  isLoading: boolean
  startLoading: (message?: string) => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const LoadingProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Loading...')
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const loadingCountRef = useRef<number>(0) // Track nested loading states
  
  const startLoading = (msg?: string) => {
    // Increment loading counter
    loadingCountRef.current += 1
    
    // Clear any existing timeout to prevent race conditions
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
    
    if (msg) setMessage(msg)
    setIsLoading(true)
  }

  const stopLoading = () => {
    // Decrement loading counter
    loadingCountRef.current = Math.max(0, loadingCountRef.current - 1)
    
    // Only stop loading when all loading operations are complete
    if (loadingCountRef.current === 0) {
      // Add a small delay before hiding the loading overlay
      // to prevent flickering for very fast operations
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }
  }

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <LoadingOverlay isLoading={isLoading} message={message} />
    </LoadingContext.Provider>
  )
}

// Custom hook to use the loading context
export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
