'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Landmark, Smartphone, ArrowRight, Loader2, CheckCircle, Info } from "lucide-react";
import styles from "./Withdraw.module.css";

const MIN_WITHDRAWAL = 5000;

export default function WithdrawPage() {
  const { profile, user, loading } = useAuth();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className={styles.withdrawContainer}>Loading wallet...</div>;
  if (!user || !profile) return null;

  const balance = profile.totalCredits || 0;
  const canWithdraw = parseFloat(amount) >= MIN_WITHDRAWAL && parseFloat(amount) <= balance;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWithdraw) return;

    setIsProcessing(true);
    try {
      const { db } = await import("@/lib/firebase");
      const { doc, updateDoc, increment, collection, setDoc } = await import("firebase/firestore");
      
      const userRef = doc(db, "users", user.uid);
      const withdrawalAmount = parseFloat(amount);
      
      // 1. Deduct from balance
      await updateDoc(userRef, {
        totalCredits: increment(-withdrawalAmount)
      });
      
      // 2. Log withdrawal record with pending status
      const withdrawalRef = doc(collection(db, "withdrawals"));
      await setDoc(withdrawalRef, {
        userId: user.uid,
        userEmail: profile.email,
        amount: withdrawalAmount,
        status: "pending", // Now pending admin approval
        method: "M-Pesa",
        createdAt: Date.now()
      });
      
      console.log(`Withdrawal request submitted: Ksh ${amount}`);
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Failed to process withdrawal. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.withdrawContainer}>
      <header>
        <h1 className="text-gradient">Cash Out</h1>
        <p style={{ color: "var(--text-secondary)" }}>Instant payouts to M-Pesa. Minimum Ksh {MIN_WITHDRAWAL}.</p>
      </header>

      <div className={`${styles.withdrawCard} glass`}>
        <div className={styles.balanceHero}>
          <h2>Available Balance</h2>
          <div className={styles.currentAmount}>Ksh {balance.toLocaleString()}</div>
          {balance < MIN_WITHDRAWAL && (
            <div style={{ fontSize: "0.8rem", color: "var(--accent-orange)" }}>
              Need Ksh {(MIN_WITHDRAWAL - balance).toLocaleString()} more
            </div>
          )}
        </div>

        <form onSubmit={handleWithdraw}>
          <div className={styles.inputGroup}>
            <label>Amount (Min Ksh {MIN_WITHDRAWAL})</label>
            <div className={styles.inputWrapper}>
              <span className={styles.currencyPrefix}>Ksh</span>
              <input 
                type="number" 
                className={styles.withdrawInput}
                placeholder={MIN_WITHDRAWAL.toString()}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={MIN_WITHDRAWAL}
                max={balance}
                required
              />
            </div>
            {parseFloat(amount) > balance && (
              <p className={styles.error}>Insufficient balance</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label>M-Pesa Phone Number</label>
            <input 
              type="tel" 
              className={styles.phoneInput}
              placeholder="2547XXXXXXXX"
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.withdrawBtn}
            disabled={!canWithdraw || isProcessing}
          >
            {isProcessing ? (
              <>Processing <Loader2 className="spin" size={20} /></>
            ) : (
              <>Withdraw to M-Pesa <ArrowRight size={18} /></>
            )}
          </button>

          <div className={styles.notice}>
            <Info size={14} /> Instant payouts. Standard M-Pesa rates apply.
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={`${styles.successCard} glass`}>
            <CheckCircle size={48} className={styles.successIcon} />
            <h2>Request Submitted!</h2>
            <p>Ksh {amount} is pending admin approval</p>
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>Funds will be sent to your M-Pesa once approved</p>
          </div>
        </div>
      )}
    </div>
  );
}

