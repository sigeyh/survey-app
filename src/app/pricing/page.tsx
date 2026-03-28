'use client';

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Check, Smartphone, Copy, Loader2 } from "lucide-react";
import styles from "./Pricing.module.css";

const TILL_NUMBER = "9824375";
const TILL_NAME = "HAKIKA R PROVISION";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "silver",
    name: "Silver",
    price: 200,
    features: ["Access to Basic Jobs", "Daily Payouts", "Email Support"]
  },
  {
    id: "gold",
    name: "Gold",
    price: 400,
    features: ["Access to Standard Jobs", "Higher Reward Tasks", "Priority Support", "Weekly Analytics"]
  },
  {
    id: "platinum",
    name: "Platinum",
    price: 800,
    features: ["Access to Premium Jobs", "Exclusive Surveys", "Direct Account Manager", "Multi-device Access"]
  },
  {
    id: "elite",
    name: "Elite",
    price: 1500,
    features: ["Access to ALL Jobs", "Maximum Rewards", "24/7 VIP Support", "Early Access to New Tasks"]
  }
];

export default function PricingPage() {
  const { profile, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"success" | "error" | null>(null);
  const router = useRouter();

  const handleCopyTill = () => {
    navigator.clipboard.writeText(TILL_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyPayment = async () => {
    if (!selectedPlan || !user || !mpesaMessage) return;
    
    // Real M-Pesa message verification
    // Updated regex to match sample M-Pesa message without requiring till number (till not always shown)
    const amountRegex = new RegExp(`Ksh *${selectedPlan.price}(?:\\.00)?`, 'i');
    const nameRegex = new RegExp(TILL_NAME.replace(/ /g, ''), 'i');
    const hasPaid = /paid to/i.test(mpesaMessage);
    const hasConfirmed = /Confirmed/i.test(mpesaMessage);
    
    if (!amountRegex.test(mpesaMessage) || !nameRegex.test(mpesaMessage) || !hasPaid || !hasConfirmed) {
      setVerificationStatus("error");
      return;
    }

    setIsVerifying(true);
    
    try {
      const { db } = await import("@/lib/firebase");
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        activePlan: selectedPlan.id,
      });
      setVerificationStatus("success");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      console.error("Upgrade failed:", error);
      setVerificationStatus("error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.pricingContainer}>
      <h1 className={styles.title}>Upgrade Your <span className="text-gradient">Potential</span></h1>
      <p className={styles.subtitle}>
        Choose a plan that fits your earning goals. Higher tiers unlock exclusive, high-paying survey jobs.
      </p>

      <div className={styles.plansGrid}>
        {PLANS.map((plan) => (
          <div key={plan.id} className={`${styles.planCard} glass`}>
            <span className={styles.planName}>{plan.name}</span>
            <div className={styles.planPrice}>
              <span className={styles.currency}>Ksh</span>
              <span className={styles.amount}>{plan.price}</span>
            </div>
            <ul className={styles.featuresList}>
              {plan.features.map((feature, i) => (
                <li key={i} className={styles.feature}>
                  <Check size={18} /> {feature}
                </li>
              ))}
            </ul>
            <button 
              className={styles.selectBtn}
              onClick={() => setSelectedPlan(plan)}
            >
              Select {plan.name}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className={styles.paymentModal}>
          <div className={`${styles.modalContent} glass`}>
            <h3>Pay Ksh {selectedPlan.price} for {selectedPlan.name}</h3>
            
            <div className={styles.tillInfo}>
              <div className={styles.tillDisplay}>
                <Smartphone size={24} />
                <strong>Till Number: {TILL_NUMBER}</strong>
                <button 
                  className={styles.copyBtn}
                  onClick={handleCopyTill}
                  title="Copy till number"
                >
                  {copied ? "✓ Copied!" : <Copy size={18} />}
                </button>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                Business Name: {TILL_NAME}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Paste your M-Pesa confirmation message here:</label>
              <textarea
                value={mpesaMessage}
                onChange={(e) => setMpesaMessage(e.target.value)}
                placeholder="Paste full M-Pesa confirmation SMS here..."
                rows={4}
                className={styles.mpesaInput}
              />
            </div>

            {verificationStatus === "error" && (
              <div className={styles.errorMsg}>
              Invalid M-Pesa message. Must contain payee &#34;{TILL_NAME}&#34;, exact amount Ksh {selectedPlan.price}, and &#34;Confirmed&#34; + &#34;paid to&#34;.
              </div>
            )}

            <button 
              className={styles.verifyBtn}
              onClick={verifyPayment}
              disabled={!mpesaMessage || isVerifying}
            >
              {isVerifying ? <Loader2 className="spin" size={20} /> : "Verify & Upgrade"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

