'use client'

import { useState, useEffect } from 'react'
import styles from '../../styles/Profile.module.css'
import { useLoading } from '../context/LoadingContext'


export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [cvBase64, setCvBase64] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const { startLoading, stopLoading } = useLoading()
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(0)

  useEffect(() => {
    // Avoid re-fetching profile data too frequently
    const now = Date.now();
    const FETCH_THROTTLE = 10000; // 10 seconds minimum between fetches
    
    if (isProfileLoaded && (now - lastFetchTime < FETCH_THROTTLE)) {
      return;
    }
    
    const fetchProfile = async () => {
      startLoading('Loading your profile...')
      try {
        const res = await fetch('/api/me', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (!res.ok) {
          stopLoading()
          return
        }
        
        const data = await res.json()
        setName(data.name || '')
        setEmail(data.email || '')
        setBio(data.bio || '')
        setCvBase64(data.cvBase64 || null)
        setIsProfileLoaded(true)
        setLastFetchTime(Date.now())
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        stopLoading()
      }
    }

    fetchProfile()
  }, [startLoading, stopLoading, isProfileLoaded, lastFetchTime])

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
    startLoading('Updating your profile...')
    
    const formData = new FormData()
    formData.append('name', name)
    formData.append('bio', bio)
    if (cvFile) {
      if (cvFile.type !== 'application/pdf') {
        setMessage('❌ Sadece PDF dosyası yüklenebilir.')
        stopLoading()
        return
      }
      if (cvFile.size > 1000 * 1024) {
        setMessage('❌ Dosya boyutu 1000KB&apos;yi geçemez.')
        stopLoading()
        return
      }
      formData.append('cv', cvFile)
    }

    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      setMessage(res.ok ? '✅ Profil güncellendi!' : `❌ ${data.message}`)

      if (res.ok) {
        if (data.cvBase64) setCvBase64(data.cvBase64)
      }
      stopLoading()
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('❌ Güncelleme sırasında bir hata oluştu.')
      stopLoading()
    }
  }

  const handleLogout = async () => {
    startLoading('Logging out...')
    try {
      await fetch('/api/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      stopLoading()
    }
  }
  
  const handleDeleteCV = async () => {
    startLoading('Deleting CV...')
    try {
      const res = await fetch('/api/me', { method: 'DELETE' })
      if (res.ok) {
        setCvBase64(null)
        setMessage('✅ CV silindi!')
      } else {
        setMessage('❌ CV silinirken bir hata oluştu.')
      }
      stopLoading()
    } catch (error) {
      console.error('Error deleting CV:', error)
      setMessage('❌ CV silinirken bir hata oluştu.')
      stopLoading()
    }
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>👤 Profil Sayfan</h2>

      <div className={styles.profileRow}>
        <p><strong>Ad Soyad:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>

      {cvBase64 && (
        <div className={styles.cvIndicator}>
          <p><strong>CV Durumu:</strong> <span className={styles.cvUploaded}>✅ Yüklendi</span></p>
          <div className={styles.cvActions}>
            <button className={styles.viewButton} onClick={handleViewPDF}>
              📄 CV'yi Yeni Sekmede Aç
            </button>
            <button className={styles.deleteButton} onClick={handleDeleteCV}>❌ Sil</button>
          </div>
        </div>
      )}

      <div className={styles.form}>
        <label className={styles.label}>Bio</label>
        <textarea
          className={styles.textarea}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Kendinizi kısaca tanıtın"
        />

        <label className={styles.label}>CV Yükle (.pdf / max 1000KB)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          className={styles.input}
        />

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
