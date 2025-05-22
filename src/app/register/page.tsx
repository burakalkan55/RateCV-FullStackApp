'use client'
import { useState, useEffect } from 'react'
import styles from '../../styles/RegisterPage.module.css'

export default function RegisterPage() {
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('') // Önceki mesajı temizle

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage('✅ Kayıt başarılı!')
        setName('')
        setEmail('')
        setPassword('')
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (err: unknown) {
      console.error(err)
      setMessage('❌ Sunucu hatası.')
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className={styles['register-container']}>
      <div className={styles['register-card']}>
        <div className={styles['register-header']}>
          <h1 className={styles['register-title']}>Create an account</h1>
         
        </div>

        <form onSubmit={handleSubmit} className={styles['form-container']}>
          <div className={styles['input-group']}>
            <label className={styles['input-label']}>Full name</label>
            <input
              type="text"
              className={styles['form-input']}
              placeholder="Full name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles['input-group']}>
            <label className={styles['input-label']}>Email</label>
            <input
              type="email"
              className={styles['form-input']}
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles['input-group']}>
            <label className={styles['input-label']}>Password</label>
            <input
              type="password"
              className={styles['form-input']}
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles['submit-button']}>
            Submit
          </button>
        </form>

        {message && (
          <div className={`${styles['message-container']} ${
            message.includes('✅') ? styles['message-success'] : styles['message-error']
          }`}>
            {message}
          </div>
        )}

        <div className={styles['login-link-container']}>
          <p className={styles['login-link-text']}>
            Already have an account?
            <a href="/login" className={styles['login-link']}>
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}