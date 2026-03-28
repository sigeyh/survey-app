'use client';

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Login.module.css"; // Local admin login styles or inline

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@survey.ke");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!auth) throw new Error("Firebase Auth not initialized");
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(`Invalid admin credentials. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer || "auth-container"}> {/* Fallback classes */}
      <div className="glass auth-card">
        <h1 className="text-gradient auth-title">Admin Panel</h1>
        <p className="auth-subtitle">Manage users, surveys and analytics</p>
        
        <form onSubmit={handleAdminLogin}>
          {error && <p style={{ color: "var(--accent-red)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</p>}
          
          <div className="input-group">
            <label>Admin Email</label>
            <input 
              type="email" 
              className="input" 
              placeholder="admin@survey.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Admin Login"}
          </button>
        </form>
        
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "1.5rem" }}>
          Default: admin@survey.ke / admin123
        </p>
        
        <p className="switch-auth" style={{ marginTop: "1rem" }}>
          User login? <Link href="/auth/login" className="switch-link">Go to User Login</Link>
        </p>
      </div>
    </div>
  );
}

