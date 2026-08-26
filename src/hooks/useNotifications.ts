import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Notification } from '@/types';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setNotifications([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: false })
      .limit(100);
    if (error) { console.error('notifications:', error.message); setLoading(false); return; }
    setNotifications((data ?? []) as Notification[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetch]);

  const markRead = async (id: string): Promise<void> => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  const markAllRead = async (): Promise<void> => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
  };

  const createNotification = async (input: Partial<Notification>): Promise<void> => {
    if (!user) return;
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: input.type ?? 'info',
      title: input.title ?? 'Notification',
      body: input.body ?? null,
      scheduled_for: input.scheduled_for ?? new Date().toISOString(),
      related_task_id: input.related_task_id ?? null,
    });
  };

  return { notifications, loading, markRead, markAllRead, createNotification, refresh: fetch };
}
