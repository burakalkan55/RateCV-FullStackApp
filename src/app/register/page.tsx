'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err) {
      console.error(err)
      setMessage('❌ Sunucu hatası.')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h1>👤 Register</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="İsim"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Kaydol</button>
      </form>

      {message && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>
      )}
    </div>
  )
}
