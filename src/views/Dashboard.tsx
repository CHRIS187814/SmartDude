import { useMemo } from 'react';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Bot, Calendar, Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn, isToday, isOverdue, priorityColors, priorityDot, formatDate, relativeTime } from '@/lib/utils';
import type { View } from '@/components/AppShell';
import type { Task } from '@/types';

interface Props { setView: (v: View) => void }

export default function Dashboard({ setView }: Props) {
  const { profile } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const { tasks, toggleComplete } = useTasks();
  const { projects } = useProjects();
  const { notifications } = useNotifications();

  const stats = useMemo(() => {
    const today = tasks.filter((t) => !t.completed && (isToday(t.due_date) || isToday(t.reminder_at)));
    const overdue = tasks.filter((t) => !t.completed && t.due_date && isOverdue(t.due_date) && !isToday(t.due_date));
    const completed = tasks.filter((t) => t.completed);
    const highPriority = tasks.filter((t) => !t.completed && (t.priority === 'high' || t.priority === 'urgent'));
    return { today, overdue, completed, highPriority, total: tasks.length };
  }, [tasks]);

  const recentNotifications = notifications.slice(0, 4);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greeting}, {profile?.full_name?.split(' ')[0] ?? 'there'}</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
            {activeWorkspace ? `You're in ${activeWorkspace.name}` : 'No workspace selected'}
          </p>
        </div>
        <button onClick={() => setView('tasks')} className="btn-primary self-start">
          <Plus className="w-4 h-4" /> New task
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Due today', value: stats.today.length, icon: Clock, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
          { label: 'Overdue', value: stats.overdue.length, icon: AlertTriangle, color: 'text-error-600 bg-error-50 dark:bg-error-900/30' },
          { label: 'High priority', value: stats.highPriority.length, icon: TrendingUp, color: 'text-warning-600 bg-warning-50 dark:bg-warning-900/30' },
          { label: 'Completed', value: stats.completed.length, icon: CheckCircle2, color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/30' },
        ].map((s) => (
          <div key={s.label} className="card p-4 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{s.label}</div>
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's tasks */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Today's focus</h2>
            <button onClick={() => setView('tasks')} className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">View all</button>
          </div>
          {stats.today.length === 0 && stats.overdue.length === 0 ? (
            <div className="text-center py-10 text-sm text-ink-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-accent-500" />
              Nothing due today. You're all caught up.
            </div>
          ) : (
            <div className="space-y-2">
              {[...stats.overdue, ...stats.today].slice(0, 6).map((t) => (
                <TaskRow key={t.id} task={t} onToggle={() => toggleComplete(t)} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: AI + notifications */}
        <div className="space-y-6">
          {/* AI card */}
          <div className="card p-5 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <h3 className="font-semibold text-sm">SmartDude AI</h3>
            </div>
            <p className="text-sm text-ink-600 dark:text-ink-300 mb-3">
              {stats.today.length > 0
                ? `You have ${stats.today.length} task${stats.today.length > 1 ? 's' : ''} due today. Want me to prioritize them?`
                : 'Your day looks clear. Ask me to plan ahead or set up an automation.'}
            </p>
            <button onClick={() => setView('tasks')} className="btn-secondary text-xs w-full">
              <Bot className="w-3.5 h-3.5" /> Ask SmartDude
            </button>
          </div>

          {/* Notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Recent activity</h3>
              <button onClick={() => setView('notifications')} className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">All</button>
            </div>
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-ink-400 py-4 text-center">No notifications yet.</p>
            ) : (
              <div className="space-y-2">
                {recentNotifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-2.5 py-1.5">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', n.read ? 'bg-ink-300' : 'bg-primary-500')} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      <div className="text-xs text-ink-400">{relativeTime(n.scheduled_for)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Projects</h3>
              <button onClick={() => setView('projects')} className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">All</button>
            </div>
            {projects.length === 0 ? (
              <p className="text-sm text-ink-400 py-4 text-center">No projects yet.</p>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-sm truncate">{p.name}</span>
                    <span className="text-xs text-ink-400 ml-auto">{tasks.filter((t) => t.project_id === p.id && !t.completed).length}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const overdue = task.due_date && isOverdue(task.due_date) && !isToday(task.due_date);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/50 transition group">
      <button onClick={onToggle} className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition', task.completed ? 'bg-accent-500 border-accent-500' : 'border-ink-300 dark:border-ink-600 hover:border-primary-500')}>
        {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={cn('text-sm font-medium truncate', task.completed && 'line-through text-ink-400')}>{task.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {task.due_date && (
            <span className={cn('text-xs', overdue ? 'text-error-500' : 'text-ink-400')}>
              {overdue ? 'Overdue · ' : ''}{formatDate(task.due_date)}
            </span>
          )}
          {task.due_time && <span className="text-xs text-ink-400">{task.due_time}</span>}
        </div>
      </div>
      <div className={cn('w-2 h-2 rounded-full shrink-0', priorityDot[task.priority])} />
      <span className={cn('badge text-xs', priorityColors[task.priority])}>{task.priority}</span>
    </div>
  );
}
