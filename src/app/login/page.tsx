'use client'

import { useState } from 'react'
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
        setName('')
        setPassword('')
        // TODO: Yönlendirme yapılabilir (örneğin /dashboard)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      console.error(error)
      setMessage('❌ Sunucu hatası.')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>🔐 Login</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Kullanıcı adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>Giriş Yap</button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  )
}
