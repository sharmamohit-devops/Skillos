import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA6rgEyDwZtuBvBcgm38Fs2J3watWVEJ0g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillos-abe52.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillos-abe52",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillos-abe52.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "609632714387",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:609632714387:web:2275fdbf9921ca48741766",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KT5E0N6268"
};

// Initialize Firebase with error handling
let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Google Auth Provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  console.log("Firebase initialized successfully");
} catch (error) {
  console.warn("Firebase initialization failed, using fallback mode:", error);
  
  // Set all services to null for fallback mode
  app = null;
  auth = null;
  db = null;
  storage = null;
  googleProvider = null;
}

export { auth, db, storage, googleProvider };
export default app;