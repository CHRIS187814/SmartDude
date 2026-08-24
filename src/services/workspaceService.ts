import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Workspace, WorkspaceMember, WorkspaceContext } from '../types';
import { activityService } from './activityService';

export const workspaceService = {
  // Get all workspaces a user belongs to
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    try {
      const wsCol = collection(db, 'workspaces');
      const q = query(wsCol, where('memberIds', 'array-contains', userId));
      const snap = await getDocs(q);
      const list: Workspace[] = [];
      snap.forEach((d) => list.push(d.data() as Workspace));
      return list;
    } catch (err) {
      console.error('Error getting user workspaces:', err);
      return [];
    }
  },

  // Listen to user workspaces in real time
  subscribeUserWorkspaces(userId: string, callback: (workspaces: Workspace[]) => void) {
    const wsCol = collection(db, 'workspaces');
    const q = query(wsCol, where('memberIds', 'array-contains', userId));
    return onSnapshot(q, (snap) => {
      const list: Workspace[] = [];
      snap.forEach((d) => list.push(d.data() as Workspace));
      callback(list);
    });
  },

  // Get specific workspace by ID
  async getWorkspace(workspaceId: string): Promise<Workspace | null> {
    try {
      const ref = doc(db, 'workspaces', workspaceId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as Workspace;
      }
      return null;
    } catch (err) {
      console.error('Error fetching workspace:', err);
      return null;
    }
  },

  // Create a new workspace
  async createWorkspace(
    userId: string,
    userDisplayName: string,
    userEmail: string,
    userPhoto: string,
    name: string,
    description: string,
    type: WorkspaceContext
  ): Promise<Workspace> {
    const id = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newWs: Workspace = {
      id,
      name,
      description,
      type,
      ownerId: userId,
      memberIds: [userId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'workspaces', id), newWs);

    // Add owner membership document
    await setDoc(doc(db, 'workspaces', id, 'members', userId), {
      userId,
      workspaceId: id,
      role: 'owner',
      displayName: userDisplayName,
      email: userEmail,
      photoURL: userPhoto,
      joinedAt: new Date().toISOString(),
      status: 'active',
    });

    await activityService.logEvent({
      userId,
      workspaceId: id,
      eventType: 'WORKSPACE_JOINED',
      entityType: 'workspace',
      entityId: id,
      metadata: { name, type },
    });

    return newWs;
  },

  // Add member to workspace
  async addMember(
    workspaceId: string,
    member: { userId: string; displayName: string; email: string; photoURL: string; role?: 'member' | 'admin' }
  ) {
    const wsRef = doc(db, 'workspaces', workspaceId);
    const snap = await getDoc(wsRef);
    if (!snap.exists()) return;

    const data = snap.data() as Workspace;
    const currentMemberIds = data.memberIds || [];
    if (!currentMemberIds.includes(member.userId)) {
      currentMemberIds.push(member.userId);
      await updateDoc(wsRef, {
        memberIds: currentMemberIds,
        updatedAt: new Date().toISOString(),
      });
    }

    await setDoc(doc(db, 'workspaces', workspaceId, 'members', member.userId), {
      userId: member.userId,
      workspaceId,
      role: member.role || 'member',
      displayName: member.displayName,
      email: member.email,
      photoURL: member.photoURL,
      joinedAt: new Date().toISOString(),
      status: 'active',
    });
  },
};
