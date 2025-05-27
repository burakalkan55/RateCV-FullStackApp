'use client'

import { useState, useEffect } from 'react'
import styles from '../../styles/LoginPage.module.css'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage('✅ Giriş başarılı!')
        // Use a hard refresh instead of client-side navigation to ensure state is reset
        window.location.href = '/profile'
      } else {
        setMessage(`❌ ${data.message || 'Giriş hatası'}`)
      }
    } catch (err) {
      console.error('Login error:', err)
      setMessage('❌ Sunucu hatası')
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className={styles.wrapper}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Sign in to your account</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Username</label>
            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.button}>Sign in</button>
        </form>
        {message && <div className={styles.message}>{message}</div>}
        <div className={styles.registerLinkContainer}>
          <p className={styles.registerLinkText}>
            Don&apos;t have an account?
            <a href="/register" className={styles.registerLink}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
