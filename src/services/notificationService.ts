import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NotificationItem } from '../types';

export const notificationService = {
  // Subscribe to user notifications in real-time
  subscribeNotifications(userId: string, callback: (notifs: NotificationItem[]) => void) {
    const col = collection(db, 'notifications');
    const q = query(col, where('userId', '==', userId));

    return onSnapshot(q, (snap) => {
      const list: NotificationItem[] = [];
      snap.forEach((d) => list.push(d.data() as NotificationItem));
      // Sort unread first, then by time/id
      list.sort((a, b) => (b.isUnread === a.isUnread ? 0 : b.isUnread ? 1 : -1));
      callback(list);
    }, (err) => console.error('Error listening to notifications:', err));
  },

  // Mark single notification read
  async markAsRead(notifId: string): Promise<void> {
    const ref = doc(db, 'notifications', notifId);
    await updateDoc(ref, { isUnread: false });
  },

  // Mark all notifications read
  async markAllAsRead(userId: string): Promise<void> {
    const col = collection(db, 'notifications');
    const q = query(col, where('userId', '==', userId), where('isUnread', '==', true));
    const snap = await getDocs(q);
    const promises = snap.docs.map((d) => updateDoc(d.ref, { isUnread: false }));
    await Promise.all(promises);
  },

  // Create notification
  async createNotification(data: Omit<NotificationItem, 'id' | 'createdAt'>): Promise<NotificationItem> {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: NotificationItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'notifications', id), newNotif);
    return newNotif;
  },
};
