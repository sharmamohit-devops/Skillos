import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA6rgEyDwZtuBvBcgm38Fs2J3watWVEJ0g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillos-abe52.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillos-abe52",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillos-abe52.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "609632714387",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:609632714387:web:2275fdbf9921ca48741766",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KT5E0N6268"
};

// Initialize Firebase with error handling and optimization
let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services with optimizations
  auth = getAuth(app);
  
  // Enable persistence for faster subsequent loads
  auth.setPersistence({
    type: 'LOCAL' // Use local storage for persistence
  } as any);
  
  // Lazy initialize Firestore and Storage (only when needed)
  db = getFirestore(app);
  storage = getStorage(app);

  // Google Auth Provider with optimizations
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    // Add these for faster login
    login_hint: '',
    access_type: 'online' // Faster than offline
  });
  
  // Add scopes only if needed (less scopes = faster)
  googleProvider.addScope('profile');
  googleProvider.addScope('email');

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