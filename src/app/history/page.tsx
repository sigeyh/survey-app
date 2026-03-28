'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './History.module.css';
import { Clock, CheckCircle, TrendingUp, Filter } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  date: number;
  reward: number;
  status: 'completed' | 'pending';
}

export default function HistoryPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Mock history data based on profile stats
    if (profile && profile.surveysCompleted > 0) {
      const mockHistory: HistoryItem[] = [
        {
          id: '1',
          title: 'Nairobi Market Trends 2026',
          date: Date.now() - 86400000,
          reward: 50,
          status: 'completed' as const
        },
        {
          id: '2',
          title: 'Digital Payments in Kenya',
          date: Date.now() - 172800000,
          reward: 80,
          status: 'completed' as const
        }
      ].slice(0, profile.surveysCompleted);
      setHistory(mockHistory);
    }
  }, [profile]);

  if (loading) return <div className={styles.historyContainer}>Loading history...</div>;
  if (!user || !profile) return null;

  return (
    <div className={styles.historyContainer}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient">Task History</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your earnings and completed surveys.</p>
        </div>
        <div className="glass" style={{ padding: '0.8rem', borderRadius: '50%', cursor: 'pointer' }}>
          <Filter size={20} />
        </div>
      </header>

      <div className={styles.historyList}>
        {history.length > 0 ? (
          history.map((item) => (
            <div key={item.id} className={`${styles.historyItem} glass hover-scale`}>
              <div className={styles.historyInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <CheckCircle size={14} color="var(--secondary-green)" />
                  <h3 style={{ margin: 0 }}>{item.title}</h3>
                </div>
                <span className={styles.historyDate}>
                  {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={styles.historyReward}>
                +Ksh {item.reward}
              </div>
            </div>
          ))
        ) : (
          <div className={`${styles.emptyState} glass`}>
            <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No tasks completed yet.</p>
            <button 
              className="actionBtn" 
              style={{ padding: '0.5rem 1rem', background: 'var(--primary-gold)', color: '#000', border: 'none', borderRadius: '4px', marginTop: '1rem', fontWeight: 700 }}
              onClick={() => router.push('/dashboard')}
            >
              Start Your First Task
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <TrendingUp color="var(--primary-gold)" />
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accuracy Rating</span>
            <span style={{ fontWeight: 800 }}>98.5% (Elite Performance)</span>
          </div>
        </div>
      )}
    </div>
  );
}
