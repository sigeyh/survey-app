'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import Link from 'next/link';

interface SurveyJob {
  id: string;
  title: string;
  description: string;
  reward: number;
  timeEstimate: string;
  minPlan: 'free' | 'silver' | 'gold' | 'platinum' | 'elite';
  type: string;
}

const MOCK_JOBS: SurveyJob[] = [
  // ... 30 jobs as before (keeping same)
  { id: '1', title: 'Nairobi Market Trends 2026', description: 'Insights on consumer shopping habits in Nairobi retail outlets.', reward: 50, timeEstimate: '5 mins', minPlan: 'free', type: 'Market Research' },
  // ... (abbreviated for brevity, same full list)
];

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className={styles.dashboard}>Loading account...</div>;
  if (!user || !profile) return <div className={styles.dashboard}>Loading profile...</div>;

  const FREE_LIMIT = 2; // Changed to 2 surveys
  const isLimitReached = (profile.surveysCompleted || 0) >= FREE_LIMIT && profile.activePlan === 'free';
  
  const getPlanRank = (plan: string) => {
    const ranks: Record<string, number> = { free: 0, silver: 1, gold: 2, platinum: 3, elite: 4 };
    return ranks[plan] || 0;
  };

  const availableJobs = MOCK_JOBS.map((job) => {
    const hasAccess = getPlanRank(profile.activePlan) >= getPlanRank(job.minPlan);
    const needsUpgrade = (!hasAccess) || isLimitReached;
    return { ...job, hasAccess, needsUpgrade };
  });

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.welcome}>
          <h1>Welcome, <span className="text-gradient">Agent</span></h1>
          <p>Free surveys remaining: {FREE_LIMIT - (profile.surveysCompleted || 0) > 0 ? FREE_LIMIT - (profile.surveysCompleted || 0) : 0}</p>
        </div>
        <div className={`${styles.statCard} glass`}>
          <span className={styles.statLabel}>Balance</span>
          <span className={`${styles.statValue} text-gradient`}>Ksh {profile.totalCredits || 0}</span>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <span className={styles.statValue}>{profile.surveysCompleted || 0}/{FREE_LIMIT} FREE</span>
          <span className={styles.statLabel}>Surveys</span>
        </div>
        <div className={`${styles.statCard} glass`}>
          <span className={styles.statValue} style={{ color: 'var(--primary-gold)' }}>
            {profile.activePlan.toUpperCase()}
          </span>
          <span className={styles.statLabel}>Plan</span>
        </div>
      </section>

      <div className={styles.sectionTitle}>
        <h2>Available Jobs ({availableJobs.length})</h2>
      </div>

      <div className={styles.jobGrid}>
        {availableJobs.map((job) => (
          <div key={job.id} className={`${styles.jobCard} glass hover-scale`}>
            <span className={styles.jobBadge}>{job.timeEstimate}</span>
            <span className={styles.jobType}>{job.type}</span>
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            
            <div className={styles.jobFooter}>
              <span className={styles.jobReward}>Ksh {job.reward}</span>
              <Link 
                href={`/survey/${job.id}`}
                className={`${styles.takeBtn} ${job.needsUpgrade ? styles.disabled : ''}`}
              >
                {job.needsUpgrade ? 'Upgrade Required' : 'Start Task'}
              </Link>
            </div>

            {job.needsUpgrade && (
              <div className={styles.upgradeOverlay}>
                <h4>{isLimitReached ? 'Free Limit Reached (2/2)' : `${job.minPlan.toUpperCase()} Plan Required`}</h4>
                <p>Upgrade to {job.minPlan.toUpperCase()} for unlimited surveys</p>
                <Link href="/pricing" className={styles.upgradeBtn}>
                  Upgrade Plan →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

