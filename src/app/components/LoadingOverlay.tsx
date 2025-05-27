'use client'

import React from 'react'
import styles from '../../styles/LoadingOverlay.module.css'

interface LoadingOverlayProps {
  isLoading: boolean
  message: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message }) => {
  if (!isLoading) return null
  
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  )
}

export default LoadingOverlay
