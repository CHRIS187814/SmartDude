import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import type { Project } from '@/types';

export function useProjects() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user || !activeWorkspace) { setProjects([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('workspace_id', activeWorkspace.id)
      .order('created_at', { ascending: false });
    if (error) { console.error('projects:', error.message); setLoading(false); return; }
    setProjects((data ?? []) as Project[]);
    setLoading(false);
  }, [user, activeWorkspace]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (!user || !activeWorkspace) return;
    const channel = supabase
      .channel(`projects-${activeWorkspace.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `workspace_id=eq.${activeWorkspace.id}` }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeWorkspace, fetch]);

  const createProject = async (name: string, description?: string, color?: string): Promise<Project | null> => {
    if (!user || !activeWorkspace) return null;
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, workspace_id: activeWorkspace.id, name, description, color: color ?? '#6366f1' })
      .select('*')
      .single();
    if (error) { console.error('createProject:', error.message); return null; }
    return data as Project;
  };

  const updateProject = async (id: string, patch: Partial<Project>): Promise<void> => {
    const { error } = await supabase.from('projects').update(patch).eq('id', id);
    if (error) console.error('updateProject:', error.message);
  };

  const deleteProject = async (id: string): Promise<void> => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) console.error('deleteProject:', error.message);
  };

  return { projects, loading, createProject, updateProject, deleteProject, refresh: fetch };
}
