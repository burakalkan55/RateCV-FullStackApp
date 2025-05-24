'use client'

import { useEffect, useState } from 'react'
import styles from '../../styles/ViewCV.module.css'

interface UserWithCV {
    id: number
    name: string
    bio?: string | null
    cvBase64?: string | null
}


const handleViewCV = (base64: string) => {
    // Skip processing if no base64 data
    if (!base64) {
        alert('No CV available to view');
        return;
    }
    
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
}


export default function HomePage() {
    const [users, setUsers] = useState<UserWithCV[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchData = async () => {            try {
                setLoading(true);
                const res = await fetch('/api/cv-board')
                const data = await res.json()
                setUsers(data.users)
            } catch (error) {
                console.error('Error fetching CV data:', error)
            } finally {
                setLoading(false)            }
        }
        fetchData()
    }, []);
    
    return (
        <main className={styles.container}>
          

            {loading ? (                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>CV&apos;ler yükleniyor...</p>
                </div>
            ) : users.length === 0 ? (
                <div className={styles.emptyMessage}>Gösterilecek CV bulunamadı.</div>
            ) : (
                <ul className={styles.cvList}>
                    {users.map((user) => (
                        <li key={user.id} className={styles.cvItem}>
                            <h3 className={styles.userName}>{user.name}</h3>
                            {user.bio && <p className={styles.userBio}>{user.bio}</p>}                            <button
                                onClick={() => handleViewCV(user.cvBase64!)}
                                className={styles.viewButton}
                            >
                                <span className={styles.icon}>📄</span> View CV
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    )
}
