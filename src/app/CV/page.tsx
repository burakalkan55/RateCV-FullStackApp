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
    // Skip processing if no base64 data
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
    
    return (
        <main className={styles.container}>
            <h1 className={styles.pageTitle}>Rate CVs</h1>

            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Loading CVs...</p>
                </div>
            ) : users.length === 0 ? (
                <div className={styles.emptyMessage}>No CVs found to display.</div>
            ) : (
                <div className={styles.cvList}>
                    {users.map((user) => (
                        <div key={user.id} className={styles.cvItem}>
                            <h3 className={styles.userName}>{user.name}</h3>
                            {user.bio && <p className={styles.userBio}>{user.bio}</p>}
                            <button
                                onClick={() => user.cvBase64 !== undefined ? handleViewCV(user.cvBase64) : handleViewCV(null)}
                                className={styles.viewButton}
                                disabled={!user.cvBase64}
                            >
                                <span className={styles.icon}>📄</span> View CV
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
