// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCnOS12tIJD5agoMV2HlBuiu__V7QFLMg",
  authDomain: "smartapp-623f7.firebaseapp.com",
  projectId: "smartapp-623f7",
  storageBucket: "smartapp-623f7.firebasestorage.app",
  messagingSenderId: "417225905248",
  appId: "1:417225905248:web:e25281cf5297e6d72e1f05",
  measurementId: "G-ZQ7QTL3499"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;