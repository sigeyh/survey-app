import Link from 'next/link';
import styles from './Home.module.css';
import { Target, Shield, Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.badge}>#1 Survey Platform in Kenya</div>
        <h1 className={styles.title}>
          Turn Your Insights into <br />
          <span className="text-gradient">Real Earnings.</span>
        </h1>
        <p className={styles.description}>
          Join thousands of Kenyans earning from high-value survey jobs. 
          Start with 5000 free tasks and upgrade to unlock premium rewards.
        </p>
        
        <div className={styles.ctaGroup}>
          <Link href="/auth/signup" className={`${styles.mainBtn} hover-scale`}>
            Get Started Now <ArrowRight size={20} style={{ marginLeft: '10px', verticalAlign: 'middle' }} />
          </Link>
          <Link href="/pricing" className={`${styles.secBtn} hover-scale`}>
            View Plans
          </Link>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureGrid}>
          <div className={`${styles.featureCard} glass hover-scale`}>
            <div className={styles.iconWrapper}>
              <Target size={32} />
            </div>
            <h3>Targeted Jobs</h3>
            <p>We match you with surveys that fit your profile, ensuring high success rates and better rewards.</p>
          </div>

          <div className={`${styles.featureCard} glass hover-scale`}>
            <div className={styles.iconWrapper}>
              <Shield size={32} />
            </div>
            <h3>Secure Payouts</h3>
            <p>Direct M-Pesa integration ensures your earnings reach you instantly and securely after every task.</p>
          </div>

          <div className={`${styles.featureCard} glass hover-scale`}>
            <div className={styles.iconWrapper}>
              <Zap size={32} />
            </div>
            <h3>Elite Access</h3>
            <p>Upgrade to Silver, Gold, or Platinum to unlock surveys paying up to Ksh 1,500 per task.</p>
          </div>
        </div>
      </section>
      
      <footer style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          © 2026 Kenyan Survey Jobs. Built for the modern Kenyan earner.
        </p>
      </footer>
    </main>
  );
}
