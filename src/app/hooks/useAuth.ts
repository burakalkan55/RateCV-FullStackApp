'use client'

import { useState, useEffect, useCallback } from 'react'

// Cache auth state with an expiration time
interface CachedAuth {
  isAuthenticated: boolean;
  timestamp: number;
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000; 

// Global auth cache to persist across renders and components
let authCache: CachedAuth | null = null;

// Add a new function to check localStorage for a previous session
const getInitialAuthState = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if we have a session indicator in localStorage
  const hasSession = localStorage.getItem('hasSession') === 'true';
  
  // Also use existing authCache if available
  if (authCache && Date.now() - authCache.timestamp < CACHE_EXPIRATION) {
    return authCache.isAuthenticated;
  }
  
  return hasSession;
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuthState)
  const [loading, setLoading] = useState(true)
  const [isRequestInProgress, setIsRequestInProgress] = useState(false)

  const checkAuth = useCallback(async (force = false) => {
    // If a request is already in progress, don't start another one
    if (isRequestInProgress) return;
    
    // Check if we have a valid cached result
    const now = Date.now();
    if (!force && authCache && (now - authCache.timestamp < CACHE_EXPIRATION)) {
      setIsAuthenticated(authCache.isAuthenticated);
      setLoading(false);
      return;
    }
    
    try {
      setIsRequestInProgress(true);
      const res = await fetch('/api/me', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const authenticated = res.ok;
      setIsAuthenticated(authenticated);
      
      // Update the global cache
      authCache = {
        isAuthenticated: authenticated,
        timestamp: Date.now()
      };
      
      // Store auth state in localStorage for faster initial renders
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasSession', authenticated ? 'true' : 'false');
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hasSession');
      }
    } finally {
      setLoading(false);
      setIsRequestInProgress(false);
    }
  }, [isRequestInProgress]);

  // Function to refresh auth state
  const refreshAuth = useCallback(() => {
    if (!isRequestInProgress) {
      checkAuth(true); // Force refresh without setting loading to true
    }
  }, [checkAuth, isRequestInProgress]);

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, loading, refreshAuth }
}
