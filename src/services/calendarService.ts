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
import { CalendarEvent } from '../types';
import { activityService } from './activityService';

export const calendarService = {
  // Subscribe to events
  subscribeEvents(workspaceId: string, callback: (events: CalendarEvent[]) => void) {
    const col = collection(db, 'events');
    const q = query(col, where('workspaceId', '==', workspaceId));

    return onSnapshot(q, (snap) => {
      const list: CalendarEvent[] = [];
      snap.forEach((d) => list.push(d.data() as CalendarEvent));
      callback(list);
    }, (err) => {
      console.error('Error listening to events:', err);
    });
  },

  // Get events
  async getEvents(workspaceId: string): Promise<CalendarEvent[]> {
    try {
      const col = collection(db, 'events');
      const q = query(col, where('workspaceId', '==', workspaceId));
      const snap = await getDocs(q);
      const list: CalendarEvent[] = [];
      snap.forEach((d) => list.push(d.data() as CalendarEvent));
      return list;
    } catch (err) {
      console.error('Error getting events:', err);
      return [];
    }
  },

  // Create event
  async createEvent(eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<CalendarEvent> {
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newEvent: CalendarEvent = {
      ...eventData,
      id,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'events', id), newEvent);

    await activityService.logEvent({
      userId,
      workspaceId: eventData.workspaceId,
      eventType: 'CALENDAR_EVENT_CREATED',
      entityType: 'event',
      entityId: id,
      metadata: { title: eventData.title, type: eventData.type },
    });

    return newEvent;
  },
};
