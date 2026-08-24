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
import { Project } from '../types';
import { activityService } from './activityService';

export const projectService = {
  // Subscribe to projects for a workspace
  subscribeProjects(workspaceId: string, callback: (projects: Project[]) => void) {
    const col = collection(db, 'projects');
    const q = query(col, where('workspaceId', '==', workspaceId));

    return onSnapshot(q, (snap) => {
      const projects: Project[] = [];
      snap.forEach((d) => projects.push(d.data() as Project));
      projects.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(projects);
    }, (error) => {
      console.error('Error listening to projects:', error);
    });
  },

  // Get projects
  async getProjects(workspaceId: string): Promise<Project[]> {
    try {
      const col = collection(db, 'projects');
      const q = query(col, where('workspaceId', '==', workspaceId));
      const snap = await getDocs(q);
      const projects: Project[] = [];
      snap.forEach((d) => projects.push(d.data() as Project));
      return projects;
    } catch (err) {
      console.error('Error getting projects:', err);
      return [];
    }
  },

  // Create project
  async createProject(projectData: Omit<Project, 'id' | 'createdAt'> & { id?: string; createdAt?: string }, userId: string): Promise<Project> {
    const id = projectData.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newProject: Project = {
      ...projectData,
      id,
      ownerId: userId,
      memberIds: [userId],
      createdAt: projectData.createdAt || now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'projects', id), newProject);

    if (newProject.workspaceId) {
      await activityService.logEvent({
        userId,
        workspaceId: newProject.workspaceId,
        eventType: 'PROJECT_CREATED',
        entityType: 'project',
        entityId: id,
        metadata: { name: newProject.name, category: newProject.category },
      });
    }

    return newProject;
  },

  // Update project
  async updateProject(projectId: string, updates: Partial<Project>, userId?: string): Promise<void> {
    const ref = doc(db, 'projects', projectId);
    const now = new Date().toISOString();

    await updateDoc(ref, {
      ...updates,
      updatedAt: now,
    });

    if (userId && updates.workspaceId) {
      await activityService.logEvent({
        userId,
        workspaceId: updates.workspaceId,
        eventType: 'PROJECT_UPDATED',
        entityType: 'project',
        entityId: projectId,
        metadata: { updates: Object.keys(updates) },
      });
    }
  },
};
