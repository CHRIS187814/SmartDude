import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserContextData, Task } from '../types';
import { activityService } from './activityService';

export const contextEngineService = {
  // Get or initialize User Context Document
  async getUserContext(userId: string): Promise<UserContextData> {
    try {
      const ref = doc(db, 'userContext', userId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        return snap.data() as UserContextData;
      }

      // Initialize default privacy-first signals
      const initialContext: UserContextData = {
        userId,
        preferredProductivityPeriods: ['morning', 'afternoon'],
        averageTaskCompletionTimeMinutes: 45,
        frequentlyUsedCategories: ['frontend', 'product', 'design'],
        commonTaskPriorities: { high: 4, med: 6, low: 2 },
        completionRate: 75,
        reschedulingRate: 12,
        activeGoalsCount: 3,
        activeProjectsCount: 4,
        workloadLevel: 'optimal',
        lastCalculatedAt: new Date().toISOString(),
        privacyPreferences: {
          allowLearnFromTasks: true,
          allowCalendarContext: true,
          allowProductivityPatterns: true,
        },
      };

      await setDoc(ref, initialContext);
      return initialContext;
    } catch (err) {
      console.error('Error fetching user context:', err);
      return {
        userId,
        preferredProductivityPeriods: ['morning'],
        averageTaskCompletionTimeMinutes: 45,
        frequentlyUsedCategories: [],
        commonTaskPriorities: { high: 0, med: 0, low: 0 },
        completionRate: 0,
        reschedulingRate: 0,
        activeGoalsCount: 0,
        activeProjectsCount: 0,
        workloadLevel: 'optimal',
        lastCalculatedAt: new Date().toISOString(),
        privacyPreferences: {
          allowLearnFromTasks: true,
          allowCalendarContext: true,
          allowProductivityPatterns: true,
        },
      };
    }
  },

  // Recalculate derived productivity signals based on explicit application events
  async recalculateContext(userId: string, tasks: Task[]): Promise<UserContextData> {
    const current = await this.getUserContext(userId);

    // If user opted out of learning from tasks, return current
    if (!current.privacyPreferences.allowLearnFromTasks) {
      return current;
    }

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const highCount = tasks.filter((t) => t.priority === 'High').length;
    const medCount = tasks.filter((t) => t.priority === 'Med').length;
    const lowCount = tasks.filter((t) => t.priority === 'Low').length;

    // Collect top tags
    const tagCounts: Record<string, number> = {};
    tasks.forEach((t) => {
      t.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topCategories = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    const workloadLevel: 'light' | 'optimal' | 'heavy' =
      tasks.filter((t) => t.status !== 'done').length > 8
        ? 'heavy'
        : tasks.filter((t) => t.status !== 'done').length < 3
        ? 'light'
        : 'optimal';

    const updatedContext: UserContextData = {
      ...current,
      completionRate,
      commonTaskPriorities: { high: highCount, med: medCount, low: lowCount },
      frequentlyUsedCategories: topCategories.length > 0 ? topCategories : current.frequentlyUsedCategories,
      workloadLevel,
      lastCalculatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'userContext', userId), updatedContext);
    return updatedContext;
  },

  // Update privacy preferences
  async updatePrivacyPreferences(userId: string, prefs: Partial<UserContextData['privacyPreferences']>) {
    const ref = doc(db, 'userContext', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const current = snap.data() as UserContextData;
    await updateDoc(ref, {
      privacyPreferences: {
        ...current.privacyPreferences,
        ...prefs,
      },
    });
  },

  // Reset personalization
  async resetPersonalization(userId: string) {
    const ref = doc(db, 'userContext', userId);
    await setDoc(ref, {
      userId,
      preferredProductivityPeriods: ['morning'],
      averageTaskCompletionTimeMinutes: 30,
      frequentlyUsedCategories: [],
      commonTaskPriorities: { high: 0, med: 0, low: 0 },
      completionRate: 0,
      reschedulingRate: 0,
      activeGoalsCount: 0,
      activeProjectsCount: 0,
      workloadLevel: 'optimal',
      lastCalculatedAt: new Date().toISOString(),
      privacyPreferences: {
        allowLearnFromTasks: true,
        allowCalendarContext: true,
        allowProductivityPatterns: true,
      },
    });
  },

  // Export full user data
  async exportUserData(userId: string) {
    // Fetch all user owned documents across collections
    const userSnap = await getDoc(doc(db, 'users', userId));
    const contextSnap = await getDoc(doc(db, 'userContext', userId));

    const tasksCol = collection(db, 'tasks');
    const tasksSnap = await getDocs(query(tasksCol, where('createdBy', '==', userId)));
    const tasks = tasksSnap.docs.map((d) => d.data());

    const notifsCol = collection(db, 'notifications');
    const notifsSnap = await getDocs(query(notifsCol, where('userId', '==', userId)));
    const notifications = notifsSnap.docs.map((d) => d.data());

    const activityCol = collection(db, 'activityEvents');
    const activitySnap = await getDocs(query(activityCol, where('userId', '==', userId)));
    const activity = activitySnap.docs.map((d) => d.data());

    return {
      exportedAt: new Date().toISOString(),
      userProfile: userSnap.exists() ? userSnap.data() : null,
      userContext: contextSnap.exists() ? contextSnap.data() : null,
      tasks,
      notifications,
      activityEvents: activity,
    };
  },

  // Delete user account and private user data
  async deleteUserData(userId: string) {
    // Delete user profile & userContext
    await deleteDoc(doc(db, 'users', userId));
    await deleteDoc(doc(db, 'userContext', userId));
  },
};
