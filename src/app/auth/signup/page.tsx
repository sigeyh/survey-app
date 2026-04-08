'use client';

import { useState } from 'react';
import { auth, db, doc, setDoc } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../login/Login.module.css';

const KENYAN_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta", "Garissa", 
  "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", 
  "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", 
  "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans-Nzoia", "Uasin Gishu", 
  "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", 
  "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", 
  "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi"
];

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [county, setCounty] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!county) {
      return setError('Please select your county');
    }
    
    setLoading(true);
    setError('');

    try {
      if (!auth || !db) throw new Error("Firebase not initialized");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile explicitly with sign-up data
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName,
        phoneNumber,
        idNumber,
        county,
        role: "user",
        activePlan: "free",
        surveysCompleted: 0,
        totalCredits: 0,
        joinedAt: Date.now()
      });

      console.log("Profile created successfully in Firestore");
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} ${styles.authCardScrollable} glass`}>
        <h1 className={`${styles.authTitle} text-gradient`}>Agent Registration</h1>
        <p className={styles.authSubtitle}>Complete your profile to start earning</p>
        
        <form onSubmit={handleSignup}>
          {error && <p className={styles.error}>{error}</p>}
          
          <div className={styles.inputGroup}>
            <label>Full Name (as per ID)</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>National ID Number</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="12345678"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>M-Pesa Phone Number</label>
            <input 
              type="tel" 
              className={styles.input} 
              placeholder="2547XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>County (Location)</label>
            <select 
              title="Select your county"
              className={styles.selectInput} 
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              required
            >
              <option value="">Select County</option>
              {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Create Password</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
        
        <p className={styles.switchAuth}>
          Already have an account? 
          <Link href="/auth/login" className={styles.switchLink}>Login</Link>
        </p>
      </div>
    </div>
  );
}
