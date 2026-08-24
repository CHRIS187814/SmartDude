import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ActivityEvent, ActivityEventType } from '../types';

export const activityService = {
  // Log an activity event
  async logEvent(params: {
    userId: string;
    workspaceId: string;
    eventType: ActivityEventType;
    entityType: 'task' | 'project' | 'goal' | 'routine' | 'event' | 'workspace' | 'profile' | 'ai';
    entityId: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const id = `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const event: ActivityEvent = {
        id,
        userId: params.userId,
        workspaceId: params.workspaceId,
        eventType: params.eventType,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata || {},
        timestamp: new Date().toISOString(),
      };

      const eventRef = doc(db, 'activityEvents', id);
      await setDoc(eventRef, event);
    } catch (err) {
      console.warn('Failed to log activity event:', err);
    }
  },

  // Get activity events for a workspace or user
  async getActivityEvents(workspaceId: string, maxLimit = 20): Promise<ActivityEvent[]> {
    try {
      const col = collection(db, 'activityEvents');
      const q = query(
        col,
        where('workspaceId', '==', workspaceId),
        orderBy('timestamp', 'desc'),
        limit(maxLimit)
      );
      const snap = await getDocs(q);
      const list: ActivityEvent[] = [];
      snap.forEach((d) => list.push(d.data() as ActivityEvent));
      return list;
    } catch (err) {
      console.error('Error fetching activity events:', err);
      return [];
    }
  },

  // Get all user activity across workspaces
  async getUserActivity(userId: string, maxLimit = 50): Promise<ActivityEvent[]> {
    try {
      const col = collection(db, 'activityEvents');
      const q = query(
        col,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(maxLimit)
      );
      const snap = await getDocs(q);
      const list: ActivityEvent[] = [];
      snap.forEach((d) => list.push(d.data() as ActivityEvent));
      return list;
    } catch (err) {
      console.error('Error fetching user activity events:', err);
      return [];
    }
  },
};
