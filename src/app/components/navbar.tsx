'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import styles from '../../styles/Navbar.module.css'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, loading, refreshAuth } = useAuth()
  
  // Refresh auth state when pathname changes (navigation)
  useEffect(() => {
    refreshAuth()
  }, [pathname, refreshAuth])

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
          {!loading && (
            <>
              {isAuthenticated ? (
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
                </>
              ) : (
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
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
