import { supabase } from '@/lib/supabase';
import type { AiAction, Task, Automation, FocusPlanBlock } from '@/types';

interface ExecutionContext {
  userId: string;
  workspaceId: string;
}

interface ExecutionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function executeAction(action: AiAction, ctx: ExecutionContext): Promise<ExecutionResult> {
  try {
    switch (action.type) {
      case 'CREATE_TASK': {
        const { data, error } = await supabase.from('tasks').insert({
          user_id: ctx.userId,
          workspace_id: ctx.workspaceId,
          title: action.taskTitle as string,
          priority: (action.priority as string) ?? 'medium',
          due_date: (action.dueDate as string) ?? null,
          due_time: (action.dueTime as string) ?? null,
          reminder_at: (action.reminderAt as string) ?? null,
        }).select('*').single();
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Task "${action.taskTitle}" created.`, data: data as Task };
      }
      case 'CREATE_REMINDER': {
        const reminderAt = new Date(action.reminderAt as string);
        const { data: task } = await supabase.from('tasks').insert({
          user_id: ctx.userId,
          workspace_id: ctx.workspaceId,
          title: action.taskTitle as string,
          reminder_at: reminderAt.toISOString(),
          due_date: (action.date as string) ?? null,
          due_time: (action.time as string) ?? null,
        }).select('*').single();
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: ctx.userId,
          type: 'reminder',
          title: `Reminder: ${action.taskTitle}`,
          body: `Scheduled for ${reminderAt.toLocaleString()}`,
          scheduled_for: reminderAt.toISOString(),
          related_task_id: (task as Task)?.id ?? null,
        });
        if (notifError) return { success: false, message: notifError.message };
        return { success: true, message: `Reminder set for ${reminderAt.toLocaleString()}.`, data: task };
      }
      case 'CREATE_AUTOMATION': {
        const nextRun = computeNextRun(action.schedule_cron as string);
        const { data, error } = await supabase.from('automations').insert({
          user_id: ctx.userId,
          workspace_id: ctx.workspaceId,
          name: action.name as string,
          schedule_cron: action.schedule_cron as string,
          action_type: (action.action_type as string) ?? 'CREATE_TASK',
          action_params: (action.action_params as object) ?? {},
          next_run: nextRun?.toISOString() ?? null,
        }).select('*').single();
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Automation "${action.name}" created.`, data: data as Automation };
      }
      case 'DISABLE_AUTOMATION': {
        const { data: autos } = await supabase.from('automations')
          .select('*').eq('user_id', ctx.userId).eq('enabled', true);
        const match = (autos as Automation[] ?? []).find((a) =>
          (action.query as string)?.toLowerCase().includes(a.name.toLowerCase()) || a.name.toLowerCase().includes((action.query as string ?? '').toLowerCase().replace(/.*disable|stop|turn off/i, '').trim())
        );
        if (match) {
          await supabase.from('automations').update({ enabled: false, next_run: null }).eq('id', match.id);
          return { success: true, message: `Automation "${match.name}" disabled.` };
        }
        return { success: false, message: 'I couldn\'t find that automation. Could you specify the name?' };
      }
      case 'ENABLE_AUTOMATION': {
        const { data: autos } = await supabase.from('automations')
          .select('*').eq('user_id', ctx.userId).eq('enabled', false);
        const match = (autos as Automation[] ?? []).find((a) =>
          (action.query as string)?.toLowerCase().includes(a.name.toLowerCase()) || a.name.toLowerCase().includes((action.query as string ?? '').toLowerCase().replace(/.*enable|start|turn on/i, '').trim())
        );
        if (match) {
          const nextRun = computeNextRun(match.schedule_cron);
          await supabase.from('automations').update({ enabled: true, next_run: nextRun?.toISOString() ?? null }).eq('id', match.id);
          return { success: true, message: `Automation "${match.name}" enabled.` };
        }
        return { success: false, message: 'I couldn\'t find that automation. Could you specify the name?' };
      }
      case 'COMPLETE_TASK': {
        const { data: tasks } = await supabase.from('tasks')
          .select('*').eq('user_id', ctx.userId).eq('workspace_id', ctx.workspaceId).eq('completed', false);
        const match = (tasks as Task[] ?? []).find((t) =>
          t.title.toLowerCase().includes((action.query as string ?? '').toLowerCase()) ||
          (action.query as string ?? '').toLowerCase().includes(t.title.toLowerCase())
        );
        if (match) {
          await supabase.from('tasks').update({ completed: true, completed_at: new Date().toISOString(), status: 'done' }).eq('id', match.id);
          return { success: true, message: `Task "${match.title}" marked complete.` };
        }
        return { success: false, message: 'I couldn\'t find that task. Could you specify the title?' };
      }
      case 'RECOMMEND_PRIORITIES': {
        const { data: tasks } = await supabase.from('tasks')
          .select('*').eq('user_id', ctx.userId).eq('workspace_id', ctx.workspaceId).eq('completed', false)
          .order('priority', { ascending: true }).limit(10);
        return { success: true, message: 'Here are my recommended priorities.', data: tasks };
      }
      case 'CREATE_FOCUS_PLAN': {
        const { data: tasks } = await supabase.from('tasks')
          .select('*').eq('user_id', ctx.userId).eq('workspace_id', ctx.workspaceId).eq('completed', false)
          .order('priority', { ascending: true }).limit(5);
        const blocks: FocusPlanBlock[] = [];
        const start = new Date();
        start.setMinutes(0, 0, 0);
        (tasks as Task[] ?? []).forEach((t, i) => {
          const s = new Date(start.getTime() + i * 50 * 60000);
          const e = new Date(s.getTime() + 45 * 60000);
          blocks.push({ start: s.toISOString(), end: e.toISOString(), title: t.title, type: 'focus' });
          if (i < (tasks as Task[]).length - 1) {
            const bs = new Date(e.getTime());
            const be = new Date(bs.getTime() + 10 * 60000);
            blocks.push({ start: bs.toISOString(), end: be.toISOString(), title: 'Break', type: 'break' });
          }
        });
        await supabase.from('focus_plans').insert({
          user_id: ctx.userId,
          title: 'AI Focus Plan',
          blocks,
        });
        return { success: true, message: 'Focus plan created with your top tasks.', data: blocks };
      }
      case 'CREATE_PROJECT': {
        const { data, error } = await supabase.from('projects').insert({
          user_id: ctx.userId,
          workspace_id: ctx.workspaceId,
          name: action.name as string,
          description: (action.description as string) ?? null,
        }).select('*').single();
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Project "${action.name}" created.`, data };
      }
      default:
        return { success: false, message: 'Unsupported action type.' };
    }
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Execution failed' };
  }
}

export function computeNextRun(cron: string): Date | null {
  const parts = cron.split(/\s+/);
  if (parts.length !== 5) return null;
  const [minute, hour, dom, month, dow] = parts.map((p) => (p === '*' ? null : p.includes('-') || p.includes(',') ? p : parseInt(p, 10)));
  const now = new Date();
  const next = new Date(now);
  next.setSeconds(0, 0);
  for (let i = 0; i < 10080; i++) {
    next.setMinutes(next.getMinutes() + 1);
    if (minute !== null && typeof minute === 'number' && next.getMinutes() !== minute) continue;
    if (hour !== null && typeof hour === 'number' && next.getHours() !== hour) continue;
    if (dom !== null && typeof dom === 'number' && next.getDate() !== dom) continue;
    if (month !== null && typeof month === 'number' && next.getMonth() + 1 !== month) continue;
    if (dow !== null) {
      const days = String(dow).split(',').flatMap((d) => {
        if (d.includes('-')) {
          const [a, b] = d.split('-').map(Number);
          return Array.from({ length: b - a + 1 }, (_, j) => a + j);
        }
        return [parseInt(d, 10)];
      });
      if (!days.includes(next.getDay())) continue;
    }
    return next;
  }
  return null;
}
