import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import type { Task, Subtask } from '@/types';

export function useTasks() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user || !activeWorkspace) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('workspace_id', activeWorkspace.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load tasks:', error.message);
      setLoading(false);
      return;
    }
    setTasks((data ?? []) as Task[]);
    setLoading(false);
  }, [user, activeWorkspace]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!user || !activeWorkspace) return;
    const channel = supabase
      .channel(`tasks-${activeWorkspace.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${activeWorkspace.id}` }, () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeWorkspace, fetchTasks]);

  const createTask = async (input: Partial<Task>): Promise<Task | null> => {
    if (!user || !activeWorkspace) return null;
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        workspace_id: activeWorkspace.id,
        title: input.title ?? 'Untitled task',
        description: input.description ?? null,
        priority: input.priority ?? 'medium',
        status: input.status ?? 'todo',
        due_date: input.due_date ?? null,
        due_time: input.due_time ?? null,
        reminder_at: input.reminder_at ?? null,
        recurrence_rule: input.recurrence_rule ?? null,
        project_id: input.project_id ?? null,
      })
      .select('*')
      .single();
    if (error) { console.error('createTask:', error.message); return null; }
    return data as Task;
  };

  const updateTask = async (id: string, patch: Partial<Task>): Promise<void> => {
    const update: Record<string, unknown> = { ...patch };
    if (patch.completed !== undefined) {
      update.completed_at = patch.completed ? new Date().toISOString() : null;
      update.status = patch.completed ? 'done' : 'todo';
    }
    const { error } = await supabase.from('tasks').update(update).eq('id', id);
    if (error) console.error('updateTask:', error.message);
  };

  const deleteTask = async (id: string): Promise<void> => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error('deleteTask:', error.message);
  };

  const toggleComplete = async (task: Task): Promise<void> => {
    await updateTask(task.id, { completed: !task.completed });
  };

  return { tasks, loading, createTask, updateTask, deleteTask, toggleComplete, refresh: fetchTasks };
}

export function useSubtasks(taskId: string | null) {
  const { user } = useAuth();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user || !taskId) { setSubtasks([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('sort_order', { ascending: true });
    if (error) { console.error('subtasks:', error.message); setLoading(false); return; }
    setSubtasks((data ?? []) as Subtask[]);
    setLoading(false);
  }, [user, taskId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createSubtask = async (title: string): Promise<void> => {
    if (!user || !taskId) return;
    await supabase.from('subtasks').insert({ task_id: taskId, user_id: user.id, title });
    fetch();
  };

  const toggleSubtask = async (id: string, completed: boolean): Promise<void> => {
    await supabase.from('subtasks').update({ completed }).eq('id', id);
    fetch();
  };

  const deleteSubtask = async (id: string): Promise<void> => {
    await supabase.from('subtasks').delete().eq('id', id);
    fetch();
  };

  return { subtasks, loading, createSubtask, toggleSubtask, deleteSubtask, refresh: fetch };
}
