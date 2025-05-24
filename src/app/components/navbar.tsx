'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from '../../styles/Navbar.module.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

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

             <Link
            href="/CV"
            className={`${styles.button} ${pathname === '/CV' ? styles.active : ''}`}
          >
            Rate CVs
          </Link>
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
        </div>
      </div>
    </nav>
  )
}
