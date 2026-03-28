'use client';

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PaymentModal from './PaymentModal';
import { Check } from "lucide-react";
import styles from "./Pricing.module.css";

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
  const { profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

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

      {selectedPlan && <PaymentModal selectedPlan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
}
