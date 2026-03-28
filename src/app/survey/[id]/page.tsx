'use client';

import { useAuth } from "@/hooks/useAuth";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getSurveyById, type SurveyData } from "@/data/surveyQuestions";
import styles from "./Survey.module.css";

export default function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, user } = useAuth();
  const [step, setStep] = useState(0);
  const [surveyData, setSurveyData] = useState<SurveyData>({ 
    title: "", 
    description: "", 
    reward: 50, 
    questions: [] 
  });
  const [complete, setComplete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const data = getSurveyById(id as string);
      setSurveyData(data);
    }
  }, [id]);

  const handleComplete = async () => {
    if (!user || !profile) return;
    setIsUpdating(true);
    
    try {
      const { db } = await import("@/lib/firebase");
      if (!db) throw new Error("Firestore not initialized");
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        surveysCompleted: increment(1),
        totalCredits: increment(surveyData.reward), 
      });
      setComplete(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const questions = surveyData.questions;

  if (!user || !profile || questions.length === 0) {
    return <div>Loading survey...</div>;
  }

  return (
    <div className={styles.surveyContainer}>
      <div className={`${styles.surveyCard} glass`}>
        <h1 className={styles.surveyTitle}>{surveyData.title}</h1>
        <p className={styles.surveyDesc}>{surveyData.description}</p>
        <div className={styles.surveyReward}>Reward: Ksh {surveyData.reward}</div>
        
        {!complete ? (
          <>
            <div className={styles.progress}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            
            <h2 className={styles.questionNum}>Question {step + 1} of {questions.length}</h2>
            <h3 className={styles.questionText}>{questions[step].text}</h3>
            
            <div className={styles.options}>
              {questions[step].options.map((opt, index) => (
                <button 
                  key={`${step}-${index}`}
                  className={styles.optionBtn}
                  onClick={() => {
                    if (step < questions.length - 1) {
                      setStep(step + 1);
                    } else {
                      handleComplete();
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <h2>Survey Complete!</h2>
            <p>You earned <strong>Ksh {surveyData.reward}</strong></p>
            <p className={styles.redirectText}>Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}

