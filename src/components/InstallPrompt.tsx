'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone, Zap, Wifi } from 'lucide-react';
import styles from './InstallPrompt.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    const dismissed = localStorage.getItem('install-dismissed');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isInstalled || dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so the dashboard loads first
      setTimeout(() => setShowPrompt(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS detection — show manual instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isInstalled) {
      setTimeout(() => setShowPrompt(true), 1500);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setJustInstalled(true);
        setTimeout(() => {
          setShowPrompt(false);
        }, 2500);
      }
    } catch (err) {
      console.error('Install failed:', err);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 24 hours
    localStorage.setItem('install-dismissed', Date.now().toString());
    setTimeout(() => {
      localStorage.removeItem('install-dismissed');
    }, 24 * 60 * 60 * 1000);
  };

  if (!showPrompt) return null;

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleDismiss} aria-label="Close">
          <X size={20} />
        </button>

        {justInstalled ? (
          // Success state
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <h2>App Installed!</h2>
            <p>Survey Pro is now on your home screen</p>
          </div>
        ) : (
          <>
            {/* App icon & branding */}
            <div className={styles.appBranding}>
              <div className={styles.appIcon}>
                <img src="/icon-512.png" alt="Survey Pro" width={72} height={72} />
              </div>
              <h2 className={styles.title}>
                Install <span className={styles.goldText}>Survey Pro</span>
              </h2>
              <p className={styles.subtitle}>
                Get the full app experience on your device
              </p>
            </div>

            {/* Benefits */}
            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <Zap size={20} className={styles.benefitIcon} />
                <div>
                  <strong>Instant Access</strong>
                  <span>Open directly from your home screen</span>
                </div>
              </div>
              <div className={styles.benefit}>
                <Wifi size={20} className={styles.benefitIcon} />
                <div>
                  <strong>Works Offline</strong>
                  <span>Browse surveys even without data</span>
                </div>
              </div>
              <div className={styles.benefit}>
                <Smartphone size={20} className={styles.benefitIcon} />
                <div>
                  <strong>Full Screen Mode</strong>
                  <span>No browser bars — native app feel</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {isIOS ? (
              <div className={styles.iosInstructions}>
                <p>
                  Tap <strong>Share</strong> <span className={styles.shareIcon}>⎙</span> then <strong>&quot;Add to Home Screen&quot;</strong>
                </p>
              </div>
            ) : (
              <button
                className={styles.installBtn}
                onClick={handleInstall}
                disabled={installing || !deferredPrompt}
              >
                {installing ? (
                  <span className={styles.spinner} />
                ) : (
                  <Download size={20} />
                )}
                {installing ? 'Installing...' : 'Install App'}
              </button>
            )}

            <button className={styles.skipBtn} onClick={handleDismiss}>
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}
