import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, PersonalContext, Workspace } from '../types';
import { INITIAL_TASKS, INITIAL_PROJECTS, INITIAL_NOTIFICATIONS } from '../data/mockData';

export const authService = {
  // Listen to auth state
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  // Email / Password Registration
  async registerWithEmail(email: string, pass: string, displayName: string, profileType: PersonalContext = 'professional') {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    await updateProfile(user, { displayName });
    
    // Create User Document & Personal Workspace
    const profile = await this.ensureUserProfile(user, profileType);
    return { user, profile };
  },

  // Email / Password Login
  async loginWithEmail(email: string, pass: string) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await this.getUserProfile(cred.user.uid);
    return { user: cred.user, profile };
  },

  // Google Sign In
  async loginWithGoogle(profileType: PersonalContext = 'professional') {
    const cred = await signInWithPopup(auth, googleProvider);
    const profile = await this.ensureUserProfile(cred.user, profileType);
    return { user: cred.user, profile };
  },

  // Sign out
  async logout() {
    await fbSignOut(auth);
  },

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  },

  // Ensure user profile & bootstrap default personal workspace
  async ensureUserProfile(user: FirebaseUser, defaultProfileType: PersonalContext = 'professional'): Promise<UserProfile> {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      // Update last active
      await updateDoc(userRef, {
        lastActiveAt: new Date().toISOString(),
      });
      return snap.data() as UserProfile;
    }

    // Check if user has personal workspace
    const personalWsId = `ws-personal-${user.uid}`;
    const personalWsRef = doc(db, 'workspaces', personalWsId);
    const wsSnap = await getDoc(personalWsRef);

    if (!wsSnap.exists()) {
      const personalWs: Workspace = {
        id: personalWsId,
        name: `${user.displayName || 'My'} Space`,
        description: 'Personal tasks, goals, routines, and habits visible only to you.',
        type: 'personal',
        ownerId: user.uid,
        memberIds: [user.uid],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(personalWsRef, personalWs);

      // Create Workspace Member
      const memberRef = doc(db, 'workspaces', personalWsId, 'members', user.uid);
      await setDoc(memberRef, {
        userId: user.uid,
        workspaceId: personalWsId,
        role: 'owner',
        displayName: user.displayName || 'SmartDude User',
        email: user.email || '',
        photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        joinedAt: new Date().toISOString(),
        status: 'active',
      });

      // Seed Initial Tasks for this user
      for (const t of INITIAL_TASKS) {
        const taskId = `${t.id}-${user.uid.slice(0, 5)}`;
        const taskRef = doc(db, 'tasks', taskId);
        await setDoc(taskRef, {
          ...t,
          id: taskId,
          workspaceId: personalWsId,
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Seed Initial Projects
      for (const p of INITIAL_PROJECTS) {
        const projId = `${p.id}-${user.uid.slice(0, 5)}`;
        const projRef = doc(db, 'projects', projId);
        await setDoc(projRef, {
          ...p,
          id: projId,
          workspaceId: personalWsId,
          ownerId: user.uid,
          memberIds: [user.uid],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Seed Initial Notifications
      for (const n of INITIAL_NOTIFICATIONS) {
        const notifId = `${n.id}-${user.uid.slice(0, 5)}`;
        const notifRef = doc(db, 'notifications', notifId);
        await setDoc(notifRef, {
          ...n,
          id: notifId,
          userId: user.uid,
          workspaceId: personalWsId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'SmartDude User',
      email: user.email || '',
      photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'Product Lead',
      profileType: defaultProfileType,
      onboardingCompleted: true,
      activeWorkspaceId: personalWsId,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      locale: navigator.language || 'en-US',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  },

  // Update profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
};
