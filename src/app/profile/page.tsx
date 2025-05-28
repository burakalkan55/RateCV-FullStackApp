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

  // Add this useEffect to auto-clear messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 2000) // 2 seconds

      // Cleanup function to clear timer if component unmounts or message changes
      return () => clearTimeout(timer)
    }
  }, [message])

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
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {name ? name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.title}>Welcome back!</h1>
              <p className={styles.subtitle}>Manage your profile and CV</p>
            </div>
          </div>
          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Profile</span>
              <span className={styles.statValue}>Active</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>CV Status</span>
              <span className={`${styles.statValue} ${cvBase64 ? styles.cvActive : styles.cvInactive}`}>
                {cvBase64 ? 'Uploaded' : 'Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>👤</span>
            Personal Information
          </h2>
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Full Name</label>
            <p className={styles.infoValue}>{name || 'Not provided'}</p>
          </div>
          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Email Address</label>
            <p className={styles.infoValue}>{email || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* CV Status Card */}
      {cvBase64 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>📄</span>
              Your CV
            </h2>
          </div>
          <div className={styles.cvStatusContent}>
            <div className={styles.cvStatus}>
              <div className={styles.cvStatusIndicator}>
                <span className={styles.cvStatusIcon}>✅</span>
                <div>
                  <p className={styles.cvStatusText}>CV Successfully Uploaded</p>
                  <p className={styles.cvStatusDesc}>Your CV is ready for employers to view</p>
                </div>
              </div>
            </div>
            <div className={styles.cvActions}>
              <button className={styles.viewButton} onClick={handleViewPDF}>
                <span className={styles.buttonIcon}>👁️</span>
                Preview CV
              </button>
              <button className={styles.deleteButton} onClick={handleDeleteCV}>
                <span className={styles.buttonIcon}>🗑️</span>
                Remove CV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>✏️</span>
            Edit Profile
          </h2>
        </div>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>About Me</label>
            <textarea
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself, your skills, and experience..."
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Upload CV
              <span className={styles.fileRequirements}>PDF only, max 1MB</span>
            </label>
            <div className={styles.fileInputWrapper}>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className={styles.fileInput}
                id="cvUpload"
              />
              <label htmlFor="cvUpload" className={styles.fileInputLabel}>
                <span className={styles.fileIcon}>📎</span>
                {cvFile ? cvFile.name : 'Choose PDF file'}
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.saveButton} onClick={handleUpdate}>
              <span className={styles.buttonIcon}>💾</span>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>⚙️</span>
            Account Settings
          </h2>
        </div>
        <div className={styles.accountActions}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <span className={styles.buttonIcon}>🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={styles.messageContainer}>
          <div className={styles.message}>{message}</div>
        </div>
      )}
    </div>
  )
}
