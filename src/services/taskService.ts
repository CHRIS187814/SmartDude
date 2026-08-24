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
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, Subtask, CommentItem, ActivityItem } from '../types';
import { activityService } from './activityService';

export const taskService = {
  // Subscribe to tasks for an active workspace in real-time
  subscribeTasks(workspaceId: string, callback: (tasks: Task[]) => void) {
    const col = collection(db, 'tasks');
    const q = query(col, where('workspaceId', '==', workspaceId));
    
    return onSnapshot(q, (snap) => {
      const tasks: Task[] = [];
      snap.forEach((d) => tasks.push(d.data() as Task));
      // Sort tasks by createdAt desc
      tasks.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(tasks);
    }, (error) => {
      console.error('Error listening to tasks:', error);
    });
  },

  // Get tasks once
  async getTasks(workspaceId: string): Promise<Task[]> {
    try {
      const col = collection(db, 'tasks');
      const q = query(col, where('workspaceId', '==', workspaceId));
      const snap = await getDocs(q);
      const tasks: Task[] = [];
      snap.forEach((d) => tasks.push(d.data() as Task));
      return tasks;
    } catch (err) {
      console.error('Error getting tasks:', err);
      return [];
    }
  },

  // Create new task
  async createTask(taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string; createdAt?: string }, userId: string): Promise<Task> {
    const id = taskData.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newTask: Task = {
      ...taskData,
      id,
      createdBy: userId,
      createdAt: taskData.createdAt || now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'tasks', id), newTask);

    // Record activity event
    if (newTask.workspaceId) {
      await activityService.logEvent({
        userId,
        workspaceId: newTask.workspaceId,
        eventType: 'TASK_CREATED',
        entityType: 'task',
        entityId: id,
        metadata: {
          title: newTask.title,
          priority: newTask.priority,
          project: newTask.project,
        },
      });
    }

    return newTask;
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>, userId?: string): Promise<void> {
    const ref = doc(db, 'tasks', taskId);
    const now = new Date().toISOString();
    
    await updateDoc(ref, {
      ...updates,
      updatedAt: now,
    });

    if (userId && updates.workspaceId) {
      await activityService.logEvent({
        userId,
        workspaceId: updates.workspaceId,
        eventType: 'TASK_UPDATED',
        entityType: 'task',
        entityId: taskId,
        metadata: { updates: Object.keys(updates) },
      });
    }
  },

  // Toggle complete
  async toggleComplete(task: Task, userId?: string): Promise<void> {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    const isNowDone = nextStatus === 'done';
    const now = new Date().toISOString();

    const ref = doc(db, 'tasks', task.id);
    await updateDoc(ref, {
      status: nextStatus,
      completedAt: isNowDone ? now : null,
      updatedAt: now,
    });

    if (userId && task.workspaceId) {
      await activityService.logEvent({
        userId,
        workspaceId: task.workspaceId,
        eventType: isNowDone ? 'TASK_COMPLETED' : 'TASK_UPDATED',
        entityType: 'task',
        entityId: task.id,
        metadata: {
          title: task.title,
          priority: task.priority,
          project: task.project,
        },
      });
    }
  },

  // Delete task
  async deleteTask(taskId: string, workspaceId?: string, userId?: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', taskId));

    if (userId && workspaceId) {
      await activityService.logEvent({
        userId,
        workspaceId,
        eventType: 'TASK_DELETED',
        entityType: 'task',
        entityId: taskId,
      });
    }
  },
};
