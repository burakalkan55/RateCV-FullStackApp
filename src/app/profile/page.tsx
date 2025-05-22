'use client'

import { useState, useEffect } from 'react'
import styles from '../../styles/Profile.module.css'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/me')
      if (!res.ok) return
      const data = await res.json()
      setName(data.name || '')
      setEmail(data.email || '')
      setBio(data.bio || '')
      setCvUrl(data.cvUrl || null)
    }

    fetchProfile()
  }, [])

  const handleUpdate = async () => {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('bio', bio)
    if (cvFile) formData.append('cv', cvFile)

    const res = await fetch('/api/me', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setMessage(res.ok ? '✅ Profil güncellendi!' : `❌ ${data.message}`)

    if (res.ok && data.cvUrl) {
      setCvUrl(data.cvUrl)
    }
  }

  const handleDeleteCV = async () => {
    const res = await fetch('/api/me/delete-cv', { method: 'DELETE' })
    if (res.ok) setCvUrl(null)
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>👤 Profil Sayfan</h2>

      <div className={styles.profileRow}>
        <p><strong>Ad Soyad:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>

      <div className={styles.form}>
        <label className={styles.label}>Bio</label>
        <textarea
          className={styles.textarea}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Kendinizi kısaca tanıtın"
        />

        <label className={styles.label}>Yeni CV Yükle (.pdf, .jpg, .png)</label>
        <input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          className={styles.input}
        />

        {cvUrl && (
          <div className={styles.cvSection}>
            <a href={cvUrl} target="_blank" rel="noopener noreferrer">📎 Güncel CV’yi Görüntüle</a>
            <button className={styles.deleteButton} onClick={handleDeleteCV}>❌ Sil</button>
          </div>
        )}

        <button className={styles.button} onClick={handleUpdate}>
          💾 Kaydet
        </button>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  )
}
