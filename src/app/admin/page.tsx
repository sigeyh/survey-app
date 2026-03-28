'use client';

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { collection, query, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import styles from "../dashboard/Dashboard.module.css";

interface UserData {
  uid: string;
  email: string;
  role: "user" | "admin";
  activePlan: string;
  surveysCompleted: number;
  totalCredits: number;
  joinedAt: number;
}

export default function AdminDashboard() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalEarnings: 0, activeSurveys: 0 });
  const [searchEmail, setSearchEmail] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const q = query(
        collection(db, "users"), 
        orderBy("joinedAt", "desc")
      );
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map((d) => ({
        uid: d.id,
        ...d.data()
      })) as UserData[];
      setUsers(userList);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const userSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = userSnapshot.size;
      let totalEarnings = 0;
      
      userSnapshot.forEach((d) => {
        const data = d.data() as UserData;
        totalEarnings += data.totalCredits || 0;
      });

      setStats({ totalUsers, totalEarnings, activeSurveys: 0 });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  const makeAdmin = async (uid: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { role: "admin" as const });
      loadUsers();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "admin")) {
      router.replace("/auth/login");
      return;
    }

    if (profile?.role === "admin") {
      loadUsers();
      loadStats();
    }
  }, [profile, loading, router, loadUsers, loadStats]);

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  if (loading) return <div className={styles.dashboard}>Loading...</div>;
  if (!profile || profile.role !== "admin") return null; // Redirect handled by router

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.welcome}>
          <h1>Admin Panel <span className="text-gradient">Control</span></h1>
          <p>Manage users, monitor earnings and analytics</p>
        </div>
        <div className={`${styles.statCard} glass`}>
          <span className={styles.statValue}>{stats.totalUsers}</span>
          <span className={styles.statLabel}>Total Users</span>
        </div>
      </header>

      {/* Stats and table as before */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <span className={styles.statValue}>Ksh {stats.totalEarnings.toLocaleString()}</span>
          <span className={styles.statLabel}>Total Earnings Paid</span>
        </div>
        <div className={`${styles.statCard} glass`}>
          <span className={styles.statValue}>{stats.activeSurveys}</span>
          <span className={styles.statLabel}>Active Surveys</span>
        </div>
        <div className={`${styles.statCard} glass`}>
          <span className={styles.statValue}>{profile.email}</span>
          <span className={styles.statLabel}>Logged in as Admin</span>
        </div>
      </section>

      <div className={styles.sectionTitle}>
        <h2>User Management</h2>
        <div className="glass" style={{ padding: "0.2rem 0.8rem", fontSize: "0.8rem" }}>
          {filteredUsers.length} Users
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input 
          type="text" 
          placeholder="Search by email..." 
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          style={{
            padding: "0.8rem 1rem",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            width: "300px"
          }}
        />
        <button 
          onClick={loadUsers}
          style={{
            marginLeft: "1rem",
            padding: "0.8rem 1.5rem",
            background: "var(--primary-gold)",
            border: "none",
            borderRadius: "8px",
            color: "#000",
            fontWeight: "600"
          }}
        >
          Refresh
        </button>
      </div>

      <div className={styles.jobGrid}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.1)" }}>
              <th>Email</th>
              <th>Role</th>
              <th>Plan</th>
              <th>Surveys</th>
              <th>Credits</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((userData) => (
              <tr key={userData.uid} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <td>{userData.email}</td>
                <td>
                  <span style={{ 
                    padding: "0.3rem 0.8rem", 
                    borderRadius: "20px", 
                    fontSize: "0.8rem",
                    background: userData.role === "admin" ? "#ef4444" : "var(--primary-gold)",
                    color: "#000"
                  }}>
                    {userData.role.toUpperCase()}
                  </span>
                </td>
                <td>{userData.activePlan}</td>
                <td>{userData.surveysCompleted}</td>
                <td>Ksh {userData.totalCredits}</td>
                <td>{new Date(userData.joinedAt).toLocaleDateString()}</td>
                <td>
                  {userData.role === "user" && (
                    <button onClick={() => makeAdmin(userData.uid)}>
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

