import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/config/firebase';

// Mock User interface for fallback mode
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: User | MockUser | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Fallback authentication for when Firebase is not available
class FallbackAuth {
  private users: Map<string, { email: string; password: string; name: string; uid: string }> = new Map();
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  constructor() {
    // Pre-populate demo account
    this.users.set('demo@skillos.com', {
      email: 'demo@skillos.com',
      password: 'demo123456',
      name: 'Demo User',
      uid: 'demo-user-uid'
    });

    // Load from localStorage
    const savedUser = localStorage.getItem('fallback_auth_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  async signup(email: string, password: string, name: string): Promise<MockUser> {
    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const uid = 'user-' + Date.now();
    this.users.set(email, { email, password, name, uid });
    
    const user: MockUser = {
      uid,
      email,
      displayName: name,
      photoURL: null
    };

    this.currentUser = user;
    localStorage.setItem('fallback_auth_user', JSON.stringify(user));
    this.notifyListeners();
    
    return user;
  }

  async login(email: string, password: string): Promise<MockUser> {
    const userData = this.users.get(email);
    if (!userData || userData.password !== password) {
      throw new Error('Invalid email or password');
    }

    const user: MockUser = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.name,
      photoURL: null
    };

    this.currentUser = user;
    localStorage.setItem('fallback_auth_user', JSON.stringify(user));
    this.notifyListeners();
    
    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('fallback_auth_user');
    this.notifyListeners();
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    this.listeners.push(callback);
    // Immediately call with current user
    callback(this.currentUser);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

const fallbackAuth = new FallbackAuth();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFirebase, setUseFirebase] = useState(true);

  const signup = async (email: string, password: string, name: string) => {
    if (!useFirebase) {
      const user = await fallbackAuth.signup(email, password, name);
      setCurrentUser(user);
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await updateProfile(user, { displayName: name });
      
      // Set current user immediately (don't wait for Firestore)
      setCurrentUser(user);
      
      // Create user document in Firestore asynchronously (non-blocking)
      if (db) {
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          analysisCount: 0,
          lastLogin: new Date().toISOString()
        }).catch(error => console.warn('Firestore write failed:', error));
      }
    } catch (error) {
      console.error('Firebase signup error:', error);
      // Fallback to local auth
      setUseFirebase(false);
      await fallbackAuth.signup(email, password, name);
    }
  };

  const login = async (email: string, password: string) => {
    if (!useFirebase) {
      await fallbackAuth.login(email, password);
      setCurrentUser(fallbackAuth.currentUser);
      return;
    }

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Set current user immediately (don't wait for Firestore)
      setCurrentUser(user);
      
      // Update last login asynchronously (non-blocking)
      if (db) {
        setDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date().toISOString()
        }, { merge: true }).catch(error => console.warn('Firestore update failed:', error));
      }
    } catch (error) {
      console.error('Firebase login error:', error);
      // Fallback to local auth
      setUseFirebase(false);
      await fallbackAuth.login(email, password);
    }
  };

  const loginWithGoogle = async () => {
    if (!useFirebase || !googleProvider) {
      throw new Error('Google login not available in fallback mode');
    }

    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // Set current user immediately (don't wait for Firestore)
      setCurrentUser(user);
      
      // Handle Firestore operations asynchronously (non-blocking)
      if (db) {
        getDoc(doc(db, 'users', user.uid))
          .then(userDoc => {
            if (!userDoc.exists()) {
              return setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: new Date().toISOString(),
                analysisCount: 0,
                lastLogin: new Date().toISOString()
              });
            } else {
              return setDoc(doc(db, 'users', user.uid), {
                lastLogin: new Date().toISOString()
              }, { merge: true });
            }
          })
          .catch(error => console.warn('Firestore operation failed:', error));
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!useFirebase) {
      await fallbackAuth.logout();
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase logout error:', error);
      // Fallback to local auth
      setUseFirebase(false);
      await fallbackAuth.logout();
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Try Firebase first
    if (auth && useFirebase) {
      try {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          setLoading(false);
        });
      } catch (error) {
        console.error('Firebase auth state change error:', error);
        setUseFirebase(false);
      }
    }

    // Use fallback if Firebase failed
    if (!useFirebase) {
      unsubscribe = fallbackAuth.onAuthStateChanged((user) => {
        setCurrentUser(user);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [useFirebase]);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};