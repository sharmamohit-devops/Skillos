import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface UserProfile {
  resumeFile: string | null; // base64 encoded file
  resumeText: string;
  linkedInUrl: string;
  githubUrl: string;
  name: string;
  email: string;
  skills: string[];
  hasCompletedOnboarding: boolean;
  lastAnalysis: any | null;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  saveProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => void;
  hasResume: boolean;
}

const defaultProfile: UserProfile = {
  resumeFile: null,
  resumeText: '',
  linkedInUrl: '',
  githubUrl: '',
  name: '',
  email: '',
  skills: [],
  hasCompletedOnboarding: false,
  lastAnalysis: null,
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.uid || 'demo-user-uid';
      const savedProfile = localStorage.getItem(`user_profile_${userId}`);
      if (savedProfile) {
        setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
      } else {
        setProfile({ ...defaultProfile, email: currentUser.email || '', name: currentUser.displayName || '' });
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [currentUser]);

  const saveProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !profile) return;
    
    const userId = currentUser.uid || 'demo-user-uid';
    const updatedProfile = { ...profile, ...data, hasCompletedOnboarding: true };
    
    // Save to localStorage
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(updatedProfile));
    
    // TODO: Also save to backend when API is ready
    // await fetch('/api/users/profile', { method: 'POST', body: JSON.stringify(updatedProfile) });
    
    setProfile(updatedProfile);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !profile) return;
    
    const userId = currentUser.uid || 'demo-user-uid';
    const updatedProfile = { ...profile, ...data };
    
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  };

  const clearProfile = () => {
    if (currentUser) {
      const userId = currentUser.uid || 'demo-user-uid';
      localStorage.removeItem(`user_profile_${userId}`);
    }
    setProfile(null);
  };

  const hasResume = Boolean(profile?.resumeText && profile.resumeText.length > 20);

  return (
    <UserProfileContext.Provider value={{ 
      profile, 
      loading, 
      saveProfile, 
      updateProfile,
      clearProfile,
      hasResume 
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
