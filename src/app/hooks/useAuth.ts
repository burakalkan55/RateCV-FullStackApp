'use client'

import { useState, useEffect, useCallback } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authVersion, setAuthVersion] = useState(0)

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/me', {
        // Add cache control to prevent stale responses
        cache: 'no-store',
      })
      setIsAuthenticated(res.ok)
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Function to refresh authentication state
  const refreshAuth = useCallback(() => {
    setLoading(true)
    // Increment version to force a re-check
    setAuthVersion(prev => prev + 1)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth, authVersion])

  return { isAuthenticated, loading, refreshAuth }
}
