export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type WorkspaceContextType = 'personal' | 'work' | 'study' | 'custom';

export interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  timezone: string;
  personal_context: Record<string, unknown>;
  preferences: { theme?: 'light' | 'dark'; notifications?: boolean };
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  context_type: WorkspaceContextType;
  workspace_context: Record<string, unknown>;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  status: 'active' | 'archived' | 'completed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  due_time: string | null;
  reminder_at: string | null;
  recurrence_rule: string | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  scheduled_for: string;
  related_task_id: string | null;
  related_automation_id: string | null;
  created_at: string;
}

export interface Automation {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  description: string | null;
  trigger_type: string;
  schedule_cron: string;
  action_type: string;
  action_params: Record<string, unknown>;
  enabled: boolean;
  last_run: string | null;
  last_success: string | null;
  last_failure: string | null;
  last_error: string | null;
  next_run: string | null;
  run_count: number;
  created_at: string;
  updated_at: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AiMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  action: AiAction | null;
  action_status: 'pending' | 'confirmed' | 'cancelled' | 'executed' | 'failed' | null;
  created_at: string;
}

export type AiActionType =
  | 'CREATE_TASK'
  | 'UPDATE_TASK'
  | 'COMPLETE_TASK'
  | 'CREATE_PROJECT'
  | 'CREATE_REMINDER'
  | 'CREATE_RECURRING_TASK'
  | 'CREATE_AUTOMATION'
  | 'UPDATE_AUTOMATION'
  | 'DISABLE_AUTOMATION'
  | 'ENABLE_AUTOMATION'
  | 'CREATE_FOCUS_PLAN'
  | 'RECOMMEND_PRIORITIES';

export interface AiAction {
  type: AiActionType;
  [key: string]: unknown;
}

export interface FocusPlanBlock {
  start: string;
  end: string;
  title: string;
  type: 'focus' | 'break';
}

export interface FocusPlan {
  id: string;
  user_id: string;
  title: string;
  blocks: FocusPlanBlock[];
  created_at: string;
}
