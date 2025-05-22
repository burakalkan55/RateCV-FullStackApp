import React from 'react'
import styles from '../styles/Page.module.css'
import RegisterPage from './register/page'

function Home() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <RegisterPage/>
      </div>
    </div>
  )
}

export default Home