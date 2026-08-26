import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Automation } from '@/types';

export function useAutomations() {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setAutomations([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { console.error('automations:', error.message); setLoading(false); return; }
    setAutomations((data ?? []) as Automation[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const createAutomation = async (input: Partial<Automation>): Promise<Automation | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('automations')
      .insert({
        user_id: user.id,
        workspace_id: input.workspace_id ?? null,
        name: input.name ?? 'Automation',
        description: input.description ?? null,
        trigger_type: input.trigger_type ?? 'schedule',
        schedule_cron: input.schedule_cron ?? '0 8 * * *',
        action_type: input.action_type ?? 'CREATE_TASK',
        action_params: input.action_params ?? {},
        enabled: input.enabled ?? true,
        next_run: input.next_run ?? null,
      })
      .select('*')
      .single();
    if (error) { console.error('createAutomation:', error.message); return null; }
    return data as Automation;
  };

  const updateAutomation = async (id: string, patch: Partial<Automation>): Promise<void> => {
    const { error } = await supabase.from('automations').update(patch).eq('id', id);
    if (error) console.error('updateAutomation:', error.message);
  };

  const deleteAutomation = async (id: string): Promise<void> => {
    const { error } = await supabase.from('automations').delete().eq('id', id);
    if (error) console.error('deleteAutomation:', error.message);
  };

  return { automations, loading, createAutomation, updateAutomation, deleteAutomation, refresh: fetch };
}
