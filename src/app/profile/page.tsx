'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './Profile.module.css';
import Link from 'next/link';
import { User, Shield, CreditCard, Calendar, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className={styles.profileContainer}>Loading profile...</div>;
  if (!user || !profile) return null;

  return (
    <div className={styles.profileContainer}>
      <header className={styles.profileHeader}>
        <div className={styles.avatar}>
          {profile.email ? profile.email[0].toUpperCase() : 'A'}
        </div>
        <div className={styles.userInfo}>
          <h1>Agent Profile</h1>
          <p className={styles.email}>{profile.email}</p>
        </div>
      </header>

      <div className={styles.detailsGrid}>
        <div className={`${styles.infoCard} glass`}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--primary-gold)" /> Subscription Status
          </h2>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>Active Plan</span>
            <span className={styles.planBadge}>{profile.activePlan}</span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>Billing Period</span>
            <span className={styles.value}>Monthly</span>
          </div>

          <Link href="/pricing" className={styles.actionBtn}>
            Upgrade or Change Plan
          </Link>
        </div>

        <div className={`${styles.infoCard} glass`}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} color="var(--secondary-green)" /> Earning Stats
          </h2>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>Total Earnings</span>
            <span className={styles.value} style={{ color: 'var(--secondary-green)' }}>
              Ksh {profile.totalCredits || 0}
            </span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>Surveys Completed</span>
            <span className={styles.value}>{profile.surveysCompleted || 0}</span>
          </div>

          <Link href="/withdraw" className={styles.actionBtn} style={{ background: 'var(--secondary-green)', color: '#000', border: 'none' }}>
            Withdraw Earnings
          </Link>
        </div>

        <div className={`${styles.infoCard} glass`}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--primary-gold)" /> Account Details
          </h2>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>Joined On</span>
            <span className={styles.value}>
              {new Date(profile.joinedAt).toLocaleDateString('en-KE', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>Account ID</span>
            <span className={styles.value} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {profile.uid}
            </span>
          </div>

          <button className={styles.actionBtn} onClick={() => alert('Settings coming soon!')}>
            Account Settings
          </button>
        </div>

        <div className={`${styles.infoCard} glass`}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} color="var(--primary-gold)" /> Achievements
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Complete 10 more surveys to reach "Trust Tier 2" and unlock exclusive Ksh 500+ tasks.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(profile.surveysCompleted / 10) * 100}%`, 
              height: '100%', 
              background: 'var(--primary-gold)' 
            }}></div>
          </div>
          <span style={{ fontSize: '0.8rem', textAlign: 'right', display: 'block' }}>
            {profile.surveysCompleted}/10 surveys
          </span>
        </div>
      </div>
    </div>
  );
}
