'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import styles from '../../styles/Navbar.module.css'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, loading, refreshAuth } = useAuth()
  
  // Track meaningful path changes that require auth refresh
  const previousPathRef = useRef(pathname)
  const authSensitivePaths = ['/login', '/register', '/profile', '/CV']
  
  useEffect(() => {
    // Only refresh auth when navigating to/from auth-sensitive pages
    if (previousPathRef.current !== pathname) {
      const wasAuthPath = authSensitivePaths.some(path => previousPathRef.current?.startsWith(path))
      const isAuthPath = authSensitivePaths.some(path => pathname?.startsWith(path))
      
      if (wasAuthPath || isAuthPath) {
        refreshAuth()
      }
      
      previousPathRef.current = pathname
    }
  }, [pathname, refreshAuth])

  const handleLogout = async () => {
    try {
      // Clear session indicator immediately for faster UI feedback
      localStorage.removeItem('hasSession');
      
      await fetch('/api/logout', { method: 'POST' })
      // Force a full page refresh after logout to reset all state
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Determine which links to show
  const renderNavLinks = () => {
    // Show skeleton loading state if we're loading and don't have previous auth state
    if (loading && typeof window !== 'undefined' && localStorage.getItem('hasSession') === null) {
      return (
        <>
          <div className={styles.skeletonButton}></div>
          <div className={styles.skeletonButton}></div>
        </>
      );
    }

    // Otherwise show links based on current auth state
    if (isAuthenticated) {
      return (
        <>
          <Link
            href="/CV"
            className={`${styles.button} ${pathname === '/CV' ? styles.active : ''}`}
          >
            Rate CVs
          </Link>
          <Link
            href="/profile"
            className={`${styles.button} ${pathname === '/profile' ? styles.active : ''}`}
          >
            Profile
          </Link>
          <button 
            onClick={handleLogout}
            className={`${styles.button} ${styles.logoutButton}`}
          >
            🚪 Logout
          </button>
        </>
      );
    } else {
      return (
        <>
          <Link
            href="/login"
            className={`${styles.button} ${pathname === '/login' ? styles.active : ''}`}
          >
            Login
          </Link>
          <Link
            href="/register"
            className={`${styles.button} ${pathname === '/register' ? styles.active : ''}`}
          >
            Sign Up
          </Link>
        </>
      );
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>🌟 RateMyCV</Link>

        <div className={styles.hamburger} onClick={() => setOpen(!open)}>
          <span className={open ? styles.barOpen : styles.bar}></span>
          <span className={open ? styles.barOpen : styles.bar}></span>
          <span className={open ? styles.barOpen : styles.bar}></span>
        </div>

        <div className={`${styles.links} ${open ? styles.open : ''}`}>
          {renderNavLinks()}
        </div>
      </div>
    </nav>
  )
}
