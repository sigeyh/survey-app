import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQTtsdHHr4xCt-3K_kZIDxFxEad2VpEJ0",
  authDomain: "survey-pro-46195.firebaseapp.com",
  projectId: "survey-pro-46195",
  storageBucket: "survey-pro-46195.firebasestorage.app",
  messagingSenderId: "397804202063",
  appId: "1:397804202063:web:6448361ef5898fbefbe23a"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
