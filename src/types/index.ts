export type Priority = 'Low' | 'Med' | 'High';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type ProjectCategory = 'Marketing' | 'Design' | 'Engineering' | 'Sales' | 'Product' | 'General';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeAvatar?: string;
}

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  role?: string;
  isCurrentUser?: boolean;
  userId?: string;
  createdAt?: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  user: string;
  time: string;
  type?: 'status' | 'complete' | 'attachment' | 'create' | 'comment';
  statusColor?: string;
}

export interface UserPresence {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isTyping?: boolean;
  role?: string;
  lastActive?: string;
}

// ----------------------------------------------------
// Core Multi-Persona and Multi-Workspace Types
// ----------------------------------------------------

export type PersonalContext = 
  | 'student' 
  | 'professional' 
  | 'homemaker' 
  | 'freelancer' 
  | 'entrepreneur' 
  | 'personal';

export type WorkspaceContext = 
  | 'personal' 
  | 'team' 
  | 'family' 
  | 'client_project' 
  | 'organization';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role?: string;
  profileType: PersonalContext;
  onboardingCompleted: boolean;
  activeWorkspaceId: string;
  timezone: string;
  locale?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  type: WorkspaceContext;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  displayName: string;
  email: string;
  photoURL: string;
  joinedAt: string;
  status: 'active' | 'invited' | 'disabled';
}

// ----------------------------------------------------
// Persistent Task, Project, Event, Goal, Routine Models
// ----------------------------------------------------

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  dueLabel?: string;
  timeString?: string;
  isOverdue?: boolean;
  isToday?: boolean;
  isFavorite?: boolean;
  workspaceId?: string;
  createdBy?: string;
  projectId?: string;
  profileContext?: PersonalContext;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  assignees: {
    name: string;
    avatar: string;
    initials?: string;
    userId?: string;
  }[];
  subtasks: Subtask[];
  tags: string[];
  comments: CommentItem[];
  activity: ActivityItem[];
  viewers: UserPresence[];
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  color: string;
  icon: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  workspaceId?: string;
  ownerId?: string;
  memberIds?: string[];
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  members: {
    name: string;
    avatar: string;
    userId?: string;
  }[];
}

export type CalendarEventType = 'meeting' | 'class' | 'exam' | 'appointment' | 'personal' | 'deadline' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  startTime: string; // ISO String or YYYY-MM-DDTHH:mm
  endTime: string;
  location?: string;
  createdBy?: string;
  workspaceId: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

export type GoalCategory = 'academic' | 'career' | 'personal' | 'health' | 'household' | 'business' | 'project';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  ownerId: string;
  workspaceId: string;
  status: 'in_progress' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface Routine {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  preferredTime?: string;
  ownerId: string;
  workspaceId: string;
  profileContext?: PersonalContext;
  active: boolean;
  streakCount?: number;
  lastCompletedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  group: 'Today' | 'Yesterday' | 'Earlier';
  type: 'assignment' | 'deadline' | 'comment' | 'system' | 'workspace_update' | 'task_completed';
  userId?: string;
  workspaceId?: string;
  taskId?: string;
  highlightText?: string;
  createdAt?: string;
}

// ----------------------------------------------------
// Activity Event Tracking & Context Engine
// ----------------------------------------------------

export type ActivityEventType = 
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_RESCHEDULED'
  | 'TASK_PRIORITY_CHANGED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_COMPLETED'
  | 'GOAL_CREATED'
  | 'GOAL_UPDATED'
  | 'GOAL_COMPLETED'
  | 'ROUTINE_COMPLETED'
  | 'CALENDAR_EVENT_CREATED'
  | 'CALENDAR_EVENT_UPDATED'
  | 'WORKSPACE_JOINED'
  | 'WORKSPACE_SWITCHED'
  | 'PROFILE_CHANGED'
  | 'AI_INTERACTION';

export interface ActivityEvent {
  id: string;
  userId: string;
  workspaceId: string;
  eventType: ActivityEventType;
  entityType: 'task' | 'project' | 'goal' | 'routine' | 'event' | 'workspace' | 'profile' | 'ai';
  entityId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface UserContextData {
  userId: string;
  preferredProductivityPeriods: string[];
  averageTaskCompletionTimeMinutes: number;
  frequentlyUsedCategories: string[];
  commonTaskPriorities: { high: number; med: number; low: number };
  completionRate: number; // percentage 0 - 100
  reschedulingRate: number; // percentage 0 - 100
  activeGoalsCount: number;
  activeProjectsCount: number;
  workloadLevel: 'optimal' | 'light' | 'heavy';
  lastCalculatedAt: string;
  privacyPreferences: {
    allowLearnFromTasks: boolean;
    allowCalendarContext: boolean;
    allowProductivityPatterns: boolean;
  };
}

// ----------------------------------------------------
// AI Companion Conversations
// ----------------------------------------------------

export interface AIConversation {
  id: string;
  userId: string;
  workspaceId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// ----------------------------------------------------
// Configuration & UI Helpers
// ----------------------------------------------------

export interface ContextConfig {
  id: PersonalContext;
  label: string;
  badge: string;
  icon: string;
  tagline: string;
  companionGreeting: string;
  recommendedRoutines: string[];
  smartTips: string[];
}

export interface WorkspaceConfig {
  id: WorkspaceContext;
  label: string;
  icon: string;
  description: string;
}

export type ViewMode = 
  | 'overview' 
  | 'tasks' 
  | 'task_detail'
  | 'projects' 
  | 'calendar' 
  | 'analytics' 
  | 'notifications' 
  | 'settings' 
  | 'favorites' 
  | 'recent';

export type ThemeMode = 'dark' | 'light' | 'system';
