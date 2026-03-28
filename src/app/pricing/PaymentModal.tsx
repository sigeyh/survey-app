 "use client";

import React, { useState } from 'react';
import { CheckCircle, Loader2, Smartphone, Copy, ArrowLeft } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import styles from './Pricing.module.css';

const TILL_NUMBER = '9824375';
const TILL_NAME = 'HAKIKA R PROVISION';

interface PaymentModalProps {
  selectedPlan: any;
  onClose: () => void;
}

export default function PaymentModal({ selectedPlan, onClose }: PaymentModalProps) {
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyTill = () => {
    navigator.clipboard.writeText(TILL_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyPayment = async () => {
    if (!mpesaMessage) return;

    const amountRegex = new RegExp(`Ksh *${selectedPlan.price}(?:\\.00)?`, 'i');
    const nameRegex = new RegExp(TILL_NAME.replace(/ /g, ''), 'i');
    const hasPaid = /paid to/i.test(mpesaMessage);
    const hasConfirmed = /Confirmed/i.test(mpesaMessage);

    if (!amountRegex.test(mpesaMessage) || !nameRegex.test(mpesaMessage) || !hasPaid || !hasConfirmed) {
      setStatus('error');
      return;
    }

    setIsVerifying(true);
    setStatus('idle');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user');

      const { db } = await import('@/lib/firebase');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { activePlan: selectedPlan.id });

      setStatus('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      setStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.paymentOverlay} onClick={onClose}>
      <div className={styles.paymentModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <ArrowLeft size={20} />
        </button>

        <div className={styles.tillInfo}>
          <Smartphone size={32} />
          <div>
            <strong>Till: {TILL_NUMBER}</strong>
            <small>{TILL_NAME}</small>
          </div>
          <button className={styles.copyBtn} onClick={handleCopyTill}>
            {copied ? '✓' : 'Copy'}
          </button>
        </div>

        <h3>Pay Ksh {selectedPlan.price} for <strong>{selectedPlan.name}</strong></h3>

        <textarea
          value={mpesaMessage}
          onChange={(e) => setMpesaMessage(e.target.value)}
          placeholder="Paste M-Pesa confirmation SMS..."
          className={styles.mpesaInput}
          rows={4}
        />

        {status === 'error' && (
          <div className={styles.error}>
            Invalid message. Check amount, till name, "Confirmed".
          </div>
        )}

        <button 
          className={styles.verifyBtn}
          onClick={verifyPayment}
          disabled={!mpesaMessage || isVerifying}
        >
          {isVerifying ? <Loader2 className="animate-spin" /> : 'Verify & Upgrade'}
        </button>

        {status === 'success' && (
          <div className={styles.success}>
            <CheckCircle size={48} />
            <p>Upgraded! Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
