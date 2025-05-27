'use client'

import { useEffect, useState } from 'react'
import styles from '../../styles/ViewCV.module.css'


interface UserWithCV {
  id: number
  name: string
  bio?: string | null
  cvBase64?: string | null
  averageRating?: number
}

interface Comment {
  id: number
  text: string
  createdAt: string
  user: {
    name: string
  }
}

interface CurrentUser {
  id: number
  name: string
  email: string
}

interface RatingData {
  targetId: number
  value: number
}

export default function CVPage() {
  const [users, setUsers] = useState<UserWithCV[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [ratings, setRatings] = useState<{ [key: number]: number }>({})
  const [feedbacks, setFeedbacks] = useState<{ [key: number]: string }>({})
  const [, setSubmittedRatings] = useState<{ [key: number]: boolean }>({})
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false)
  const [selectedUserComments, setSelectedUserComments] = useState<Comment[]>([])
  const [selectedUserName, setSelectedUserName] = useState<string>('')
  const [loadingComments, setLoadingComments] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null)

  // Toast auto-hide effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch current user info first
        const userRes = await fetch('/api/me')
        let currentUserId = null
        if (userRes.ok) {        const userData = await userRes.json() as { id: number; name: string; email: string }
        setCurrentUser({ id: userData.id, name: userData.name, email: userData.email })
          currentUserId = userData.id
        }
        
        // Fetch CVs
        const res = await fetch('/api/cv-board')
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        setUsers(data.users)

        // Fetch user's existing ratings if user is authenticated
        if (currentUserId) {
          const ratingsRes = await fetch(`/api/get-user-ratings?userId=${currentUserId}`)
          if (ratingsRes.ok) {
            const ratingsData = await ratingsRes.json()
            const existingRatings: { [key: number]: number } = {}
            const existingSubmissions: { [key: number]: boolean } = {}
              ratingsData.ratings.forEach((rating: RatingData) => {
              existingRatings[rating.targetId] = rating.value
              existingSubmissions[rating.targetId] = true
            })
            
            setRatings(existingRatings)
            setSubmittedRatings(existingSubmissions)
          }
        }
      } catch (error) {
        console.error('Error fetching CVs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleViewCV = (base64: string | null) => {
    if (!base64) {
      setToast({ message: 'No CV available to view', type: 'error' })
      return
    }
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i))
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    } catch (error) {
      console.error('Error processing PDF:', error)
      setToast({ message: 'Failed to open CV.', type: 'error' })
    }
  }
  const handleRatingSubmit = async (
    userId: number,
    rating: number,
    comment: string
  ) => {
    if (userId === currentUser?.id) {
      setToast({ message: '❌ Kendi CV\'nize oy veremezsiniz!', type: 'error' })
      return
    }
    if (!rating) {
      setToast({ message: 'Lütfen bir yıldız seçin!', type: 'error' })
      return
    }
    try {
      const res = await fetch('/api/rate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          targetId: userId,
          rating,
          comment,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit rating/comment')
      // Update states immediately
      setFeedbacks((prev) => ({ ...prev, [userId]: '' }))
      // Refresh the page data to get updated averages
      const cvRes = await fetch('/api/cv-board')
      if (cvRes.ok) {
        const data = await cvRes.json()
        setUsers(data.users)
      }
      setToast({ message: '✅ Feedback submitted!', type: 'success' })
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setToast({ message: '❌ Error submitting feedback', type: 'error' })
    }
  }

  const handleViewComments = async (userId: number, userName: string) => {
    setLoadingComments(true)
    setSelectedUserName(userName)
    setShowCommentsModal(true)
    
    
    try {
      const res = await fetch(`/api/get-comments?targetId=${userId}`)
      if (!res.ok) throw new Error('Failed to fetch comments')
      const data = await res.json()
      setSelectedUserComments(data.comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      setSelectedUserComments([])
    } finally {
      setLoadingComments(false)
    }
  }  // Add toast animation styles
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.innerHTML = `@keyframes fadeInToast { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`
      document.head.appendChild(style)
    }
  }, [])

  return (
    <main className={styles.container}>
      {/* Toast Message */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 2000,
            background: toast.type === 'error' ? '#ff5252' : '#4caf50',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: 200,
            maxWidth: 350,
            textAlign: 'center',
            animation: 'fadeInToast 0.3s',
          }}
        >
          {toast.message}
        </div>
      )}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>✨ Rate Amazing CVs</h1>
        <p className={styles.pageSubtitle}>
          Discover talent and provide valuable feedback to job seekers
        </p>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading amazing CVs...</p>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <h3 className={styles.emptyTitle}>No CVs Available</h3>
          <p className={styles.emptyMessage}>
            Be the first to upload your CV and get feedback!
          </p>
        </div>
      ) : (
        <div className={styles.cvGrid}>
          {users.map((user) => (
            <div key={user.id} className={styles.cvCard}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>                <div className={styles.userInfo}>
                  <h3 className={styles.userName}>
                    {user.name}
                    {user.averageRating && (
                      <span className={styles.averageRating}>
                        ⭐ {user.averageRating.toFixed(1)}
                      </span>
                    )}
                  </h3>
                  <span className={styles.cvBadge}>CV Available</span>
                </div>
              </div>              <div className={styles.bioSection}>
                <p className={styles.userBio}>
                  {user.bio || "No bio available"}
                </p>
              </div>

              <div className={styles.ratingSection}>
                <p className={styles.ratingLabel}>Rate this CV:</p>
                <div className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        if (user.id === currentUser?.id) {
                          setToast({ message: '❌ Kendi CV\'nize oy veremezsiniz!', type: 'error' })
                          return
                        }
                        setRatings((prev) => ({ ...prev, [user.id]: star }))
                      }}
                      className={`${styles.star} ${star <= (ratings[user.id] || 0) ? styles.starActive : ''}`}
                      style={{ color: star <= (ratings[user.id] || 0) ? '#FFD700' : '#bbb', textShadow: star <= (ratings[user.id] || 0) ? '0 0 10px #FFD700' : 'none' }}
                      disabled={user.id === currentUser?.id}
                      aria-label={`Rate ${star} stars`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Write a feedback comment..."
                  value={feedbacks[user.id] || ''}
                  onChange={(e) =>
                    setFeedbacks((prev) => ({
                      ...prev,
                      [user.id]: e.target.value,
                    }))
                  }
                  className={styles.feedbackTextarea}
                  disabled={user.id === currentUser?.id}
                />
                <button
                  onClick={() =>
                    handleRatingSubmit(
                      user.id,
                      ratings[user.id] || 0,
                      feedbacks[user.id] || ''
                    )
                  }
                  className={styles.feedbackSubmit}
                  disabled={user.id === currentUser?.id}
                >
                  Submit Rating & Feedback
                </button>
              </div>              <div className={styles.cardActions}>
                <button
                  onClick={() =>
                    user.cvBase64 !== undefined
                      ? handleViewCV(user.cvBase64)
                      : handleViewCV(null)
                  }
                  className={styles.viewButton}
                  disabled={!user.cvBase64}
                >
                  <span className={styles.buttonIcon}>📄</span>
                  <span>View CV</span>
                </button>
                <button
                  onClick={() => handleViewComments(user.id, user.name)}
                  className={styles.commentsButton}
                >
                  <span className={styles.buttonIcon}>💬</span>
                  <span>View Comments</span>
                </button>
              </div>
            </div>
          ))}        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCommentsModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Comments for {selectedUserName}</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowCommentsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {loadingComments ? (
                <div className={styles.modalLoading}>
                  <div className={styles.modalSpinner}></div>
                  <p>Loading comments...</p>
                </div>
              ) : selectedUserComments.length === 0 ? (
                <div className={styles.noComments}>
                  <div className={styles.noCommentsIcon}>💬</div>
                  <p>No comments yet for this CV</p>
                </div>
              ) : (
                <div className={styles.commentsList}>
                  {selectedUserComments.map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>{comment.user.name}</span>
                        <span className={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={styles.commentText}>{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>      )}
    </main>
  )
}
