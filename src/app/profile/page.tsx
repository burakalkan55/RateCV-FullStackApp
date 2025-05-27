'use client'

import { useState, useEffect } from 'react'
import styles from '../../styles/Profile.module.css'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')

  const [cvBase64, setCvBase64] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/me')
      if (!res.ok) return
      const data = await res.json()
      setName(data.name || '')
      setEmail(data.email || '')
      setBio(data.bio || '')
     
      setCvBase64(data.cvBase64 || null)
    }

    fetchProfile()
  }, [])

  const handleViewPDF = () => {
  if (!cvBase64) return
  const byteCharacters = atob(cvBase64)
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i))
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)
  window.open(blobUrl, '_blank')
}


  const handleUpdate = async () => {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('bio', bio)
    if (cvFile) {
      if (cvFile.type !== 'application/pdf') {
        setMessage('❌ Sadece PDF dosyası yüklenebilir.')
        return
      }
      if (cvFile.size > 1000 * 1024) {
        setMessage('❌ Dosya boyutu 1000KB\'yi geçemez.')
        return
      }
      formData.append('cv', cvFile)
    }

    const res = await fetch('/api/me', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setMessage(res.ok ? '✅ Profil güncellendi!' : `❌ ${data.message}`)

    if (res.ok) {
      
      if (data.cvBase64) setCvBase64(data.cvBase64)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      // Force a full page refresh after logout to reset all state
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  const handleDeleteCV = async () => {
    const res = await fetch('/api/me', { method: 'DELETE' })
    if (res.ok) {
      setCvBase64(null)
    }
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

        <label className={styles.label}>CV Yükle (.pdf / max 100KB)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          className={styles.input}
        />
{cvBase64 && (
  <div className={styles.cvSection}>
    <button className={styles.viewButton} onClick={handleViewPDF}>
      📄 CV’yi Yeni Sekmede Aç
    </button>
    <button className={styles.deleteButton} onClick={handleDeleteCV}>❌ Sil</button>
  </div>
)}



        <button className={styles.button} onClick={handleUpdate}>
          💾 Kaydet
        </button>

        <button className={styles.logoutButton} onClick={handleLogout}>
          🚪 Çıkış Yap
        </button>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  )
}
