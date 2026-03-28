import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  role: "user" | "admin";
  activePlan: "free" | "silver" | "gold" | "platinum" | "elite";
  surveysCompleted: number;
  totalCredits: number;
  joinedAt: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "user",  // default user
              activePlan: "free",
              surveysCompleted: 0,
              totalCredits: 0,
              joinedAt: Date.now(),
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error("Failed to load profile:", err);
          // Fallback profile
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || null,
            role: "user",
            activePlan: "free",
            surveysCompleted: 0,
            totalCredits: 0,
            joinedAt: Date.now(),
          });
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}

