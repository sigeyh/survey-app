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
    // Fetch actual history from Firestore
    const fetchHistory = async () => {
      if (!user) return;
      
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, query, where, getDocs, orderBy } = await import("firebase/firestore");
        
        const completionsRef = collection(db, "completedSurveys");
        const q = query(
          completionsRef, 
          where("userId", "==", user.uid),
          orderBy("completedAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const historyData: HistoryItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          historyData.push({
            id: doc.id,
            title: data.title,
            date: data.completedAt,
            reward: data.reward,
            status: 'completed'
          });
        });
        
        setHistory(historyData);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
  }, [user]);

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
