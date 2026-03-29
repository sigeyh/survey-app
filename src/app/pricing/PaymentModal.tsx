"use client";

import React, { useState } from 'react';
import { CheckCircle, Loader2, Smartphone, Copy, ArrowLeft, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, doc, updateDoc } from '@/lib/firebase';
import { payHero, formatPhoneNumber } from '@/lib/payhero';
import { paymentTracker } from '@/lib/paymentTracker';
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
  const [payHeroStatus, setPayHeroStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [payHeroUrl, setPayHeroUrl] = useState<string | null>(null);
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

  // PayHero payment integration
  const handlePayHeroPayment = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Please login to continue');
      return;
    }

    setPayHeroStatus('processing');

    try {
      // Create payment record
      const reference = await paymentTracker.createPayment(
        user.uid,
        selectedPlan.id,
        selectedPlan.price,
        phoneNumber
      );

      // Use server-side API method (bypassing problematic button SDK)
      const paymentRequest = {
        amount: selectedPlan.price,
        phoneNumber: formatPhoneNumber(phoneNumber),
        reference: reference,
        description: `Upgrade to ${selectedPlan.name} Plan`
      };

      const response = await fetch('/api/payhero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPayHeroUrl(data.checkoutUrl);
        setPayHeroStatus('success');

        // Open PayHero checkout in new tab if checkout URL is provided
        if (data.checkoutUrl) {
          window.open(data.checkoutUrl, '_blank');
        } else {
          // If no checkout URL, show success message
          alert('Payment initiated successfully! Please complete the payment.');
        }
      } else {
        setPayHeroStatus('error');
        alert(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('PayHero payment error:', error);
      setPayHeroStatus('error');
      alert('Payment initiation failed. Please try again.');
    }
  };

  // Handle PayHero button callback
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.paymentSuccess) {
        console.log("Payment Successful:", event.data);
        alert('Payment successful! Your plan has been upgraded.');
        onClose();
      } else if (event.data.paymentSuccess === false) {
        alert('Oopsie! Payment failed');
        setPayHeroStatus('error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  // Manual verification for PayHero payments
  const verifyPayHeroPayment = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Please login to continue');
      return;
    }

    setPayHeroStatus('processing');

    try {
      // This would check the payment status via PayHero API
      // For now, we'll rely on webhooks, but you can implement manual verification
      alert('Payment verification in progress. You will be notified when payment is confirmed.');
      onClose();
    } catch (error) {
      console.error('PayHero verification error:', error);
      setPayHeroStatus('error');
    }
  };

  return (
    <div className={styles.paymentOverlay} onClick={onClose}>
      <div className={styles.paymentModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          <ArrowLeft size={20} />
        </button>

        <div className={styles.paymentMethods}>
          <div className={styles.methodCard}>
            <h4>Traditional M-Pesa</h4>
            <div className={styles.tillInfo}>
              <Smartphone size={32} />
              <div>
                <strong>Mpesa Till: {TILL_NUMBER}</strong>
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

          <div className={styles.methodCard}>
            <h4>PayHero Payment</h4>
            <div className={styles.payHeroInfo}>
              <CreditCard size={32} />
              <div>
                <strong>Instant Payment</strong>
                <small>Secure M-Pesa payment via PayHero</small>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number (2547XXXXXXXX)</label>
              <input
                type="tel"
                className={styles.phoneInput}
                placeholder="2547XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className={styles.payHeroActions}>
              <button
                className={styles.payHeroBtn}
                onClick={handlePayHeroPayment}
                disabled={payHeroStatus === 'processing'}
              >
                {payHeroStatus === 'processing' ? (
                  <>
                    <Loader2 className="animate-spin" /> Processing...
                  </>
                ) : (
                  'Pay with PayHero'
                )}
              </button>

              <button
                className={styles.verifyPayHeroBtn}
                onClick={verifyPayHeroPayment}
                disabled={payHeroStatus === 'processing'}
              >
                Verify Payment
              </button>
            </div>

            {/* PayHero Button Container - Always render but conditionally show */}
            <div className={styles.payHeroContainer} style={{ display: payHeroStatus === 'success' ? 'block' : 'none' }}>
              <div id="payHero" style={{ width: '100%', height: '500px' }}></div>
            </div>

            {payHeroStatus === 'success' && payHeroUrl && (
              <div className={styles.success}>
                <CheckCircle size={48} />
                <p>Payment initiated! Complete payment in new tab.</p>
              </div>
            )}

            {payHeroStatus === 'error' && (
              <div className={styles.error}>
                Payment failed. Please try again or use traditional M-Pesa.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
