import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import { workspaceService } from '../services/workspaceService';
import { UserProfile, Workspace, PersonalContext, WorkspaceContext } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, profileType: PersonalContext) => Promise<void>;
  loginWithGoogle: (profileType?: PersonalContext) => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  switchPersonalContext: (context: PersonalContext) => Promise<void>;
  createWorkspace: (name: string, description: string, type: WorkspaceContext) => Promise<Workspace>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to Auth changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setIsLoading(true);
      setError(null);

      if (user) {
        setCurrentUser(user);
        try {
          // Load or ensure profile
          const profile = await authService.ensureUserProfile(user);
          setUserProfile(profile);

          // Load workspaces
          const wsList = await workspaceService.getUserWorkspaces(user.uid);
          setWorkspaces(wsList);

          // Set active workspace
          const active = wsList.find((w) => w.id === profile.activeWorkspaceId) || wsList[0] || null;
          setActiveWorkspace(active);
        } catch (err: any) {
          console.error('Error bootstrapping user session:', err);
          setError(err.message || 'Failed to load user profile');
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to real-time workspaces when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    const unsub = workspaceService.subscribeUserWorkspaces(currentUser.uid, (wsList) => {
      setWorkspaces(wsList);
      if (userProfile?.activeWorkspaceId) {
        const found = wsList.find((w) => w.id === userProfile.activeWorkspaceId);
        if (found) setActiveWorkspace(found);
      }
    });
    return () => unsub();
  }, [currentUser, userProfile?.activeWorkspaceId]);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.loginWithEmail(email, pass);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, profileType: PersonalContext) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.registerWithEmail(email, pass, name, profileType);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (profileType: PersonalContext = 'professional') => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.loginWithGoogle(profileType);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
  };

  const switchWorkspace = async (workspaceId: string) => {
    if (!currentUser || !userProfile) return;
    const targetWs = workspaces.find((w) => w.id === workspaceId);
    if (!targetWs) return;

    setActiveWorkspace(targetWs);
    await authService.updateUserProfile(currentUser.uid, {
      activeWorkspaceId: workspaceId,
    });
    setUserProfile({ ...userProfile, activeWorkspaceId: workspaceId });
  };

  const switchPersonalContext = async (context: PersonalContext) => {
    if (!currentUser || !userProfile) return;
    await authService.updateUserProfile(currentUser.uid, {
      profileType: context,
    });
    setUserProfile({ ...userProfile, profileType: context });
  };

  const createWorkspace = async (name: string, description: string, type: WorkspaceContext) => {
    if (!currentUser) throw new Error('Must be logged in to create workspace');
    const newWs = await workspaceService.createWorkspace(
      currentUser.uid,
      currentUser.displayName || 'SmartDude User',
      currentUser.email || '',
      currentUser.photoURL || '',
      name,
      description,
      type
    );
    await switchWorkspace(newWs.id);
    return newWs;
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const p = await authService.getUserProfile(currentUser.uid);
    if (p) setUserProfile(p);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        workspaces,
        activeWorkspace,
        isLoading,
        error,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        switchWorkspace,
        switchPersonalContext,
        createWorkspace,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
