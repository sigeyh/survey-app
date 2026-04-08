'use client';

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { collection, query, getDocs, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./Admin.module.css";

interface UserData {
  uid: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  idNumber: string;
  county: string;
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
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalEarnings: 0, 
    totalPayouts: 0,
    activeSurveys: 0 
  });
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form states
  const [newBalance, setNewBalance] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [newRole, setNewRole] = useState("");

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
      const withdrawalSnapshot = await getDocs(collection(db, "withdrawals"));
      
      let totalEarnings = 0;
      userSnapshot.forEach((d) => {
        totalEarnings += d.data().totalCredits || 0;
      });

      let totalPayouts = 0;
      withdrawalSnapshot.forEach((d) => {
        totalPayouts += d.data().amount || 0;
      });

      setStats({ 
        totalUsers: userSnapshot.size, 
        totalEarnings, 
        totalPayouts,
        activeSurveys: 8 // Mock for now
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "admin")) {
      router.replace("/admin/login");
      return;
    }

    if (profile?.role === "admin") {
      loadUsers();
      loadStats();
    }
  }, [profile, loading, router, loadUsers, loadStats]);

  const [surveys, setSurveys] = useState<any[]>([]);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  
  // Survey form states
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyReward, setSurveyReward] = useState("");
  const [surveyTime, setSurveyTime] = useState("");
  const [surveyPlan, setSurveyPlan] = useState("Free");

  const loadSurveys = useCallback(async () => {
    try {
      const q = query(collection(db, "surveys"));
      const snapshot = await getDocs(q);
      const surveyList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSurveys(surveyList);
      setStats(prev => ({ ...prev, activeSurveys: surveyList.length }));
    } catch (error) {
      console.error("Failed to load surveys:", error);
    }
  }, []);

  const createSurvey = async () => {
    try {
      const { setDoc, collection, doc } = await import("firebase/firestore");
      const surveyRef = doc(collection(db, "surveys"));
      await setDoc(surveyRef, {
        title: surveyTitle,
        reward: parseInt(surveyReward),
        time: surveyTime,
        category: "General",
        minPlan: surveyPlan,
        questions: 10,
        createdAt: Date.now()
      });
      setIsSurveyModalOpen(false);
      loadSurveys();
    } catch (error) {
      console.error("Create survey failed:", error);
    }
  };

  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const loadWithdrawals = useCallback(async () => {
    try {
      const q = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setWithdrawals(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Failed to load withdrawals:", error);
    }
  }, []);

  const handleApproveWithdrawal = async (id: string, amount: number) => {
    try {
      const withdrawalRef = doc(db, "withdrawals", id);
      await updateDoc(withdrawalRef, {
        status: "completed",
        completedAt: Date.now()
      });
      loadWithdrawals();
      loadStats();
    } catch (error) {
      console.error("Failed to approve withdrawal:", error);
      alert("Failed to approve payout.");
    }
  };

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "admin")) {
      router.replace("/admin/login");
      return;
    }

    if (profile?.role === "admin") {
      loadUsers();
      loadStats();
      loadSurveys();
      loadWithdrawals();
    }
  }, [profile, loading, router, loadUsers, loadStats, loadSurveys, loadWithdrawals]);

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setNewBalance(user.totalCredits.toString());
    setNewPlan(user.activePlan);
    setNewRole(user.role);
    setIsEditModalOpen(true);
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;
    try {
      const userRef = doc(db, "users", selectedUser.uid);
      await updateDoc(userRef, {
        totalCredits: parseFloat(newBalance),
        activePlan: newPlan,
        role: newRole
      });
      setIsEditModalOpen(false);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update user.");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  if (loading) return <div className={styles.adminContainer}>Loading Obsidian Portal...</div>;
  if (!profile || profile.role !== "admin") return null;

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <div className={styles.welcome}>
          <h1>Admin <span className="text-gradient">Control</span></h1>
          <p>Obsidian Emerald Management System</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => { loadUsers(); loadStats(); loadSurveys(); loadWithdrawals(); }}>
          Sync Data
        </button>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalUsers}</span>
          <span className={styles.statLabel}>Total Agents</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>Ksh {stats.totalEarnings.toLocaleString()}</span>
          <span className={styles.statLabel}>Current Liablity</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>Ksh {stats.totalPayouts.toLocaleString()}</span>
          <span className={styles.statLabel}>Total Payouts</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.activeSurveys}</span>
          <span className={styles.statLabel}>Live Jobs</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Finance Hub: Payouts</h2>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Requested At</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div className={styles.userEmail}>{w.userEmail || w.userId}</div>
                    <div className={styles.userId}>{w.userId}</div>
                  </td>
                  <td className={styles.amountNeg}>Ksh {w.amount?.toLocaleString()}</td>
                  <td>{w.method}</td>
                  <td>
                    <span className={`${styles.badge} ${w.status === 'completed' ? styles.badgeUser : styles.badgePending}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className={styles.payoutMeta}>
                    <div className={styles.payoutDate}>{new Date(w.createdAt).toLocaleDateString()}</div>
                    {w.status === 'pending' && (
                      <button 
                        className={styles.approveBtn} 
                        onClick={() => handleApproveWithdrawal(w.id, w.amount)}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', opacity: 0.5 }}>No recent payout requests.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Survey Factory</h2>
          <button className={styles.actionBtn} onClick={() => setIsSurveyModalOpen(true)}>+ Add New Job</button>
        </div>
        <div className={styles.surveyGrid}>
          {surveys.map((s) => (
            <div key={s.id} className={styles.surveyItem}>
              <div className={styles.surveyInfo}>
                <h4>{s.title}</h4>
                <div className={styles.surveyMeta}>
                  Ksh {s.reward} • {s.time} • <span className={styles.pill}>{s.minPlan}</span>
                </div>
              </div>
              <button className={styles.actionBtn}>Edit</button>
            </div>
          ))}
          {surveys.length === 0 && <p style={{ opacity: 0.5 }}>No active jobs found in the factory.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Agent Management</h2>
          <div className={styles.controls}>
            <input 
              type="text" 
              placeholder="Search agents..." 
              className={styles.searchInput}
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Agent Details</th>
                <th>County</th>
                <th>ID / Phone</th>
                <th>Plan Status</th>
                <th>Balance</th>
                <th>Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.uid}>
                  <td>
                    <div className={styles.userEmail}>{u.fullName || 'No Name'}</div>
                    <div className={styles.userId}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgePlan}`}>
                      {u.county || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.payoutDate}>ID: {u.idNumber || 'N/A'}</div>
                    <div style={{ color: '#10b981', fontSize: '0.8rem' }}>{u.phoneNumber || 'N/A'}</div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeUser}`}>
                      {u.activePlan}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#10b981' }}>Ksh {u.totalCredits}</td>
                  <td>{u.surveysCompleted}</td>
                  <td>
                    <button className={styles.actionBtn} onClick={() => handleEditUser(u)}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      {isEditModalOpen && selectedUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Manage Agent: {selectedUser.email}</h3>
            
            <div className={styles.formGroup}>
              <label>Agent Balance (Ksh)</label>
              <input 
                title="Agent Balance"
                placeholder="0.00"
                type="number" 
                value={newBalance} 
                onChange={(e) => setNewBalance(e.target.value)} 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Subscription Plan</label>
              <select title="Subscription Plan" value={newPlan} onChange={(e) => setNewPlan(e.target.value)}>
                <option value="Free">Free</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Access Level</label>
              <select title="Access Level" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="user">User/Agent</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <button className={styles.submitBtn} onClick={saveUserChanges}>Save Identity Changes</button>
            <button className={styles.cancelBtn} onClick={() => setIsEditModalOpen(false)}>Discard</button>
          </div>
        </div>
      )}

      {isSurveyModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Initialize New Survey Job</h3>
            <div className={styles.formGroup}>
              <label>Job Title</label>
              <input placeholder="e.g. Market Research 2026" value={surveyTitle} onChange={(e) => setSurveyTitle(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Reward (Ksh)</label>
              <input 
                title="Survey Reward"
                placeholder="Amount in Ksh"
                type="number" 
                value={surveyReward} 
                onChange={(e) => setSurveyReward(e.target.value)} 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Estimated Time</label>
              <input placeholder="e.g. 15 mins" value={surveyTime} onChange={(e) => setSurveyTime(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Target Plan</label>
              <select title="Target Category Plan" value={surveyPlan} onChange={(e) => setSurveyPlan(e.target.value)}>
                <option value="Free">Free (All Users)</option>
                <option value="Silver">Silver Plan Only</option>
                <option value="Gold">Gold Plan Only</option>
                <option value="Platinum">Platinum Plan Only</option>
              </select>
            </div>
            <button className={styles.submitBtn} onClick={createSurvey}>Deploy to Dashboard</button>
            <button className={styles.cancelBtn} onClick={() => setIsSurveyModalOpen(false)}>Abort</button>
          </div>
        </div>
      )}
    </div>
  );
}

