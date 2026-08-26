import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { Workspace } from '@/types';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspaceId: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Failed to load workspaces:', error.message);
      setLoading(false);
      return;
    }
    const list = (data ?? []) as Workspace[];
    setWorkspaces(list);
    if (list.length > 0) {
      const stored = localStorage.getItem('smartdude-active-workspace');
      const exists = stored && list.some((w) => w.id === stored);
      const id = exists ? stored : list[0].id;
      setActiveWorkspaceId(id);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;

  const setActiveWorkspaceIdPersist = (id: string) => {
    setActiveWorkspaceId(id);
    localStorage.setItem('smartdude-active-workspace', id);
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspaceId: setActiveWorkspaceIdPersist, loading, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
