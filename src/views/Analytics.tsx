import { useMemo } from 'react';
import { TrendingUp, CheckCircle2, Clock, Target, BarChart3 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { cn, isToday, priorityColors, priorityDot } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import type { Priority } from '@/types';

export default function Analytics() {
  const { tasks, loading } = useTasks();
  const { projects } = useProjects();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const byPriority = (['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => ({
      priority: p,
      total: tasks.filter((t) => t.priority === p).length,
      completed: tasks.filter((t) => t.priority === p && t.completed).length,
    }));
    const byProject = projects.map((p) => ({
      project: p,
      total: tasks.filter((t) => t.project_id === p.id).length,
      completed: tasks.filter((t) => t.project_id === p.id && t.completed).length,
    }));
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const dayStart = d;
      const dayEnd = new Date(d);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const completedToday = tasks.filter((t) => t.completed && t.completed_at && new Date(t.completed_at) >= dayStart && new Date(t.completed_at) < dayEnd).length;
      return { date: d, completed: completedToday };
    });
    return { total, completed, completionRate, byPriority, byProject, last7Days };
  }, [tasks, projects]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (stats.total === 0) return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Analytics</h1>
      <EmptyState icon={BarChart3} title="No data yet" description="Create and complete tasks to see your productivity insights." />
    </div>
  );

  const maxDay = Math.max(...stats.last7Days.map((d) => d.completed), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Your productivity at a glance</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total tasks', value: stats.total, icon: Target, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/30' },
          { label: 'Completion rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'text-warning-600 bg-warning-50 dark:bg-warning-900/30' },
          { label: 'Active', value: stats.total - stats.completed, icon: Clock, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', s.color)}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 7-day chart */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Completed (last 7 days)</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {stats.last7Days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 transition-all min-h-[2px]"
                    style={{ height: `${(d.completed / maxDay) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-ink-400">{d.date.toLocaleDateString(undefined, { weekday: 'short' })[0]}</span>
                <span className="text-xs font-medium">{d.completed}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By priority */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">By priority</h3>
          <div className="space-y-3">
            {stats.byPriority.map((p) => (
              <div key={p.priority}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', priorityDot[p.priority])} />
                    <span className="capitalize">{p.priority}</span>
                  </span>
                  <span className="text-ink-400">{p.completed}/{p.total}</span>
                </div>
                <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${p.total > 0 ? (p.completed / p.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By project */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">By project</h3>
          {stats.byProject.length === 0 ? (
            <p className="text-sm text-ink-400 py-4 text-center">No projects with tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.byProject.map((p) => (
                <div key={p.project.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.project.color }} />
                      {p.project.name}
                    </span>
                    <span className="text-ink-400">{p.completed}/{p.total}</span>
                  </div>
                  <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.total > 0 ? (p.completed / p.total) * 100 : 0}%`, backgroundColor: p.project.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
