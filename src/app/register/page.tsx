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
    } catch (err: any) {
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
          <div className={styles['icon-container']}>
            <span>👤</span>
          </div>
          <h1 className={styles['register-title']}>Kayıt Ol</h1>
          <p className={styles['register-subtitle']}>Hesabınızı oluşturun</p>
        </div>

        <form onSubmit={handleSubmit} className={styles['form-container']}>
          <div className={styles['input-group']}>
            <label className={styles['input-label']}>İsim</label>
            <input
              type="text"
              className={styles['form-input']}
              placeholder="Adınızı girin"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles['input-group']}>
            <label className={styles['input-label']}>E-posta</label>
            <input
              type="email"
              className={styles['form-input']}
              placeholder="ornek@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles['input-group']}>
            <label className={styles['input-label']}>Şifre</label>
            <input
              type="password"
              className={styles['form-input']}
              placeholder="Güçlü bir şifre girin"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles['submit-button']}>
            Kaydol
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
            Zaten hesabınız var mı?{' '}
            <a href="/login" className={styles['login-link']}>
              Giriş yapın
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}