'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, User, Wallet, LogOut, Trophy, Clock, Shield } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const { profile, user, loading } = useAuth();

  // Don't show navbar on landing/auth/admin-login pages
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdminLogin = pathname === "/admin/login";
  const isLandingPage = pathname === "/";
  
  if ((isAuthPage || isAdminLogin || isLandingPage) || loading) return null;

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
    window.location.href = "/";
  };

  const isAdmin = profile?.role === "admin";

  return (
    <nav className={styles.navbar}>
      <Link href={isAdmin ? "/admin" : "/dashboard"} className={styles.logo}>
        {isAdmin ? "ADMIN " : ""}SURVEY<span style={{ color: "var(--primary-gold)" }}>.KE</span>
      </Link>

      <div className={styles.navLinks}>
        <Link 
          href={isAdmin ? "/admin" : "/dashboard"} 
          className={`${styles.navLink} ${pathname === (isAdmin ? "/admin" : "/dashboard") ? styles.active : ""}`}
        >
          <LayoutDashboard size={18} /> {isAdmin ? "Dashboard" : "Dashboard"}
        </Link>
        
        {!isAdmin && (
          <>
            <Link 
              href="/pricing" 
              className={`${styles.navLink} ${pathname === "/pricing" ? styles.active : ""}`}
            >
              <Trophy size={18} /> Pricing
            </Link>
            <Link 
              href="/withdraw" 
              className={`${styles.navLink} ${pathname === "/withdraw" ? styles.active : ""}`}
            >
              <Wallet size={18} /> Withdraw
            </Link>
            <Link 
              href="/history" 
              className={`${styles.navLink} ${pathname === "/history" ? styles.active : ""}`}
            >
              <Clock size={18} /> History
            </Link>
            <Link 
              href="/profile" 
              className={`${styles.navLink} ${pathname === "/profile" ? styles.active : ""}`}
            >
              <User size={18} /> Profile
            </Link>
          </>
        )}
        
        {isAdmin && (
          <Link 
            href="/admin" 
            className={`${styles.navLink} ${pathname === "/admin" ? styles.active : ""}`}
          >
            <Shield size={18} /> Users & Stats
          </Link>
        )}
      </div>

      <div className={styles.userSection}>
        {profile && (
          <div className={styles.balance}>
            {isAdmin ? "ADMIN" : `Ksh ${profile.totalCredits || 0}`}
          </div>
        )}
        <button 
          className={styles.navLink} 
          style={{ background: "none", border: "none", cursor: "pointer" }}
          onClick={handleLogout}
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}

