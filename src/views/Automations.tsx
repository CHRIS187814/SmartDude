import { useState } from 'react';
import { Plus, Repeat, Trash2, Power, PowerOff, Clock, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { useAutomations } from '@/hooks/useAutomations';
import { useWorkspace } from '@/context/WorkspaceContext';
import { computeNextRun } from '@/lib/actionEngine';
import { cn, relativeTime, formatDateTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import type { Automation } from '@/types';

function cronToHuman(cron: string): string {
  const [m, h, dom, mon, dow] = cron.split(/\s+/);
  const time = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  if (dow === '1-5') return `Weekdays · ${time}`;
  if (dow === '*') return `Daily · ${time}`;
  if (dow === '0') return `Sundays · ${time}`;
  if (dow === '6') return `Saturdays · ${time}`;
  const dayMap: Record<string, string> = { '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat' };
  if (dow && dayMap[dow]) return `${dayMap[dow]}s · ${time}`;
  if (dom !== '*' && mon === '*') return `Monthly on ${dom} · ${time}`;
  return cron;
}

export default function Automations() {
  const { automations, loading, createAutomation, updateAutomation, deleteAutomation } = useAutomations();
  const { activeWorkspace } = useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('0 8 * * 1-5');
  const [actionType, setActionType] = useState('CREATE_TASK');
  const [taskTitle, setTaskTitle] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    const nextRun = computeNextRun(schedule);
    await createAutomation({
      name,
      schedule_cron: schedule,
      action_type: actionType,
      action_params: actionType === 'CREATE_TASK' ? { title: taskTitle || name } : {},
      workspace_id: activeWorkspace?.id,
      next_run: nextRun?.toISOString() ?? null,
    });
    setName(''); setTaskTitle(''); setSchedule('0 8 * * 1-5'); setActionType('CREATE_TASK');
    setCreateOpen(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{automations.filter((a) => a.enabled).length} active · {automations.length} total</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New automation</button>
      </div>

      {automations.length === 0 ? (
        <EmptyState icon={Repeat} title="No automations yet" description="Automate recurring tasks and reminders. SmartDude runs them on schedule — even when you're away." action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New automation</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {automations.map((a) => (
            <AutomationCard key={a.id} automation={a} onToggle={() => updateAutomation(a.id, { enabled: !a.enabled, next_run: !a.enabled ? computeNextRun(a.schedule_cron)?.toISOString() ?? null : null })} onDelete={() => deleteAutomation(a.id)} />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New automation">
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Morning review" />
          </div>
          <div>
            <label className="label">Schedule</label>
            <select className="input" value={schedule} onChange={(e) => setSchedule(e.target.value)}>
              <option value="0 8 * * 1-5">Every weekday at 8:00 AM</option>
              <option value="0 9 * * 1">Every Monday at 9:00 AM</option>
              <option value="0 17 * * 5">Every Friday at 5:00 PM</option>
              <option value="0 20 * * *">Every day at 8:00 PM</option>
              <option value="0 7 * * 1-5">Every weekday at 7:00 AM</option>
              <option value="30 12 * * *">Every day at 12:30 PM</option>
            </select>
          </div>
          <div>
            <label className="label">Action</label>
            <select className="input" value={actionType} onChange={(e) => setActionType(e.target.value)}>
              <option value="CREATE_TASK">Create a task</option>
              <option value="CREATE_REMINDER">Create a reminder</option>
            </select>
          </div>
          {actionType === 'CREATE_TASK' && (
            <div>
              <label className="label">Task title</label>
              <input className="input" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Review my priorities" />
            </div>
          )}
          <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-3 text-xs text-primary-700 dark:text-primary-300 flex gap-2">
            <Zap className="w-4 h-4 shrink-0 mt-0.5" />
            <span>SmartDude will run this automation on schedule. The next run is calculated automatically and shown in the automation card.</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary"><Plus className="w-4 h-4" /> Create</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AutomationCard({ automation, onToggle, onDelete }: { automation: Automation; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className={cn('card p-5 group', !automation.enabled && 'opacity-60')}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', automation.enabled ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-600' : 'bg-ink-100 dark:bg-ink-800 text-ink-400')}>
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{automation.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-ink-400 mt-0.5">
              <Clock className="w-3 h-3" /> {cronToHuman(automation.schedule_cron)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggle} className={cn('btn-ghost p-2', automation.enabled && 'text-accent-600 dark:text-accent-400')}>
            {automation.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
          </button>
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-error-500 p-2 transition"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-ink-100 dark:border-ink-800">
        <div>
          <div className="text-xs text-ink-400">Next run</div>
          <div className="text-sm font-medium mt-0.5">{automation.next_run ? relativeTime(automation.next_run) : '—'}</div>
        </div>
        <div>
          <div className="text-xs text-ink-400">Last run</div>
          <div className="text-sm font-medium mt-0.5">{automation.last_run ? relativeTime(automation.last_run) : 'Never'}</div>
        </div>
        <div>
          <div className="text-xs text-ink-400">Status</div>
          <div className="flex items-center gap-1.5 text-sm font-medium mt-0.5">
            {automation.last_error ? (
              <><AlertCircle className="w-3.5 h-3.5 text-error-500" /> <span className="text-error-500">Failed</span></>
            ) : automation.last_success ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-accent-500" /> <span className="text-accent-600 dark:text-accent-400">Healthy</span></>
            ) : (
              <span className="text-ink-400">Pending</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-ink-400">Runs</div>
          <div className="text-sm font-medium mt-0.5">{automation.run_count}</div>
        </div>
      </div>

      {automation.last_error && (
        <div className="mt-3 rounded-lg bg-error-50 dark:bg-error-900/20 p-2.5 text-xs text-error-700 dark:text-error-300">
          {automation.last_error}
        </div>
      )}
    </div>
  );
}
