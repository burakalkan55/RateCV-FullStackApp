'use client'

import { useEffect, useState } from 'react'
import styles from '../../styles/ViewCV.module.css'

interface UserWithCV {
    id: number
    name: string
    bio?: string | null
    cvBase64?: string | null
}

const handleViewCV = (base64: string | null) => {
    if (!base64) {
        alert('No CV available to view');
        return;
    }
    
    try {
        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i))
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl, '_blank')
    } catch (error) {
        console.error('Error processing PDF:', error)
        alert('Failed to open CV. The file may be corrupted.')
    }
}

export default function CVPage() {
    const [users, setUsers] = useState<UserWithCV[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [ratings, setRatings] = useState<{[key: number]: number}>({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await fetch('/api/cv-board')
                
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`)
                }
                
                const data = await res.json()
                setUsers(data.users)
            } catch (error) {
                console.error('Error fetching CV data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleRating = async (userId: number, rating: number) => {
        // Update local state immediately for UI responsiveness
        setRatings(prev => ({
            ...prev,
            [userId]: rating
        }))
        
        // Here you could add API call to save the rating to the backend
        try {
            // Example API call (implement the actual endpoint)
            // await fetch('/api/rate-cv', {
            //    method: 'POST',
            //    headers: { 'Content-Type': 'application/json' },
            //    body: JSON.stringify({ userId, rating })
            // })
            console.log(`Rating ${rating} saved for user ${userId}`)
        } catch (error) {
            console.error('Error saving rating:', error)
        }
    }
    
    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>✨ Rate Amazing CVs</h1>
                <p className={styles.pageSubtitle}>Discover talent and provide valuable feedback to job seekers</p>
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
                    <p className={styles.emptyMessage}>Be the first to upload your CV and get feedback!</p>
                </div>
            ) : (
                <div className={styles.cvGrid}>
                    {users.map((user) => (
                        <div key={user.id} className={styles.cvCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.userInfo}>
                                    <h3 className={styles.userName}>{user.name}</h3>
                                    <span className={styles.cvBadge}>CV Available</span>
                                </div>
                            </div>
                            
                            {user.bio && (
                                <div className={styles.bioSection}>
                                    <p className={styles.userBio}>{user.bio}</p>
                                </div>
                            )}
                            
                            <div className={styles.ratingSection}>
                                <p className={styles.ratingLabel}>Rate this CV:</p>
                                <div className={styles.starRating}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRating(user.id, star)}
                                            className={`${styles.star} ${
                                                star <= (ratings[user.id] || 0) ? styles.starActive : ''
                                            }`}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                                {ratings[user.id] && (
                                    <p className={styles.ratingText}>
                                        You rated: {ratings[user.id]} star{ratings[user.id] > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                            
                            <div className={styles.cardActions}>
                                <button
                                    onClick={() => user.cvBase64 !== undefined ? handleViewCV(user.cvBase64) : handleViewCV(null)}
                                    className={styles.viewButton}
                                    disabled={!user.cvBase64}
                                >
                                    <span className={styles.buttonIcon}>📄</span>
                                    <span>View CV</span>
                                </button>
                                <button className={styles.feedbackButton}>
                                    <span className={styles.buttonIcon}>💬</span>
                                    <span>Give Feedback</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
