import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Goal, Routine } from '../types';
import { activityService } from './activityService';

export const goalService = {
  subscribeGoals(workspaceId: string, callback: (goals: Goal[]) => void) {
    const col = collection(db, 'goals');
    const q = query(col, where('workspaceId', '==', workspaceId));

    return onSnapshot(q, (snap) => {
      const list: Goal[] = [];
      snap.forEach((d) => list.push(d.data() as Goal));
      callback(list);
    }, (err) => console.error('Error listening to goals:', err));
  },

  async createGoal(data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Goal> {
    const id = `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newGoal: Goal = {
      ...data,
      id,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'goals', id), newGoal);

    await activityService.logEvent({
      userId,
      workspaceId: data.workspaceId,
      eventType: 'GOAL_CREATED',
      entityType: 'goal',
      entityId: id,
      metadata: { title: data.title, category: data.category },
    });

    return newGoal;
  },

  async updateGoal(goalId: string, updates: Partial<Goal>, userId: string, workspaceId: string) {
    const ref = doc(db, 'goals', goalId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    await activityService.logEvent({
      userId,
      workspaceId,
      eventType: updates.status === 'completed' ? 'GOAL_COMPLETED' : 'GOAL_UPDATED',
      entityType: 'goal',
      entityId: goalId,
    });
  },
};

export const routineService = {
  subscribeRoutines(workspaceId: string, callback: (routines: Routine[]) => void) {
    const col = collection(db, 'routines');
    const q = query(col, where('workspaceId', '==', workspaceId));

    return onSnapshot(q, (snap) => {
      const list: Routine[] = [];
      snap.forEach((d) => list.push(d.data() as Routine));
      callback(list);
    }, (err) => console.error('Error listening to routines:', err));
  },

  async createRoutine(data: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Routine> {
    const id = `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newRoutine: Routine = {
      ...data,
      id,
      ownerId: userId,
      streakCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'routines', id), newRoutine);
    return newRoutine;
  },

  async completeRoutine(routineId: string, userId: string, workspaceId: string) {
    const ref = doc(db, 'routines', routineId);
    const today = new Date().toISOString().split('T')[0];
    
    await updateDoc(ref, {
      lastCompletedDate: today,
      updatedAt: new Date().toISOString(),
    });

    await activityService.logEvent({
      userId,
      workspaceId,
      eventType: 'ROUTINE_COMPLETED',
      entityType: 'routine',
      entityId: routineId,
    });
  },
};
