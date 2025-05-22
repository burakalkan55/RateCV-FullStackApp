import React from 'react'
import styles from '../styles/Page.module.css'


export default function Home() {
  return (
    <div className={styles.pageContainer}>
 
      <main className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.yellow}>Rate My CV</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Get your CV reviewed by the community and increase your chances of getting hired!
          </p>
          <a href="/register" className={styles.ctaButton}>
            Get Started For Free
          </a>
        </div>
        <div className={styles.featuresSection}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Community Voting</h3>
            <p className={styles.featureDesc}>
              Upload your CV and let real people vote and comment on your strengths and areas to improve.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Boost Your Career</h3>
            <p className={styles.featureDesc}>
              Discover what recruiters and professionals think about your CV and stand out in job applications.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>100% Free & Easy</h3>
            <p className={styles.featureDesc}>
              Sign up in seconds and join a supportive community dedicated to helping you succeed.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}