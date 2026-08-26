import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { cn, isSameDay, formatDate, priorityDot } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';

export default function Calendar() {
  const { tasks, loading } = useTasks();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthDays = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [cursor]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    tasks.forEach((t) => {
      if (t.due_date) {
        const key = t.due_date;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(t);
      }
    });
    return map;
  }, [tasks]);

  const selectedTasks = selectedDate
    ? tasks.filter((t) => t.due_date && isSameDay(t.due_date, selectedDate))
    : [];

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Your scheduled tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="btn-ghost p-2"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-sm font-semibold min-w-[140px] text-center">{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="btn-ghost p-2"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 card p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-ink-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((d, i) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = isSameDay(d, new Date());
              const isSelected = selectedDate && isSameDay(d, selectedDate);
              const dayTasks = tasksByDate.get(d.toISOString().split('T')[0]) ?? [];
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  className={cn(
                    'aspect-square rounded-lg p-1.5 flex flex-col items-center justify-start text-sm transition relative',
                    inMonth ? 'hover:bg-ink-100 dark:hover:bg-ink-800' : 'text-ink-300 dark:text-ink-600',
                    isSelected && 'bg-primary-100 dark:bg-primary-900/40 ring-2 ring-primary-400',
                    isToday && !isSelected && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <span className={cn(isToday && 'font-bold text-primary-600 dark:text-primary-400')}>{d.getDate()}</span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayTasks.slice(0, 3).map((t) => (
                        <span key={t.id} className={cn('w-1.5 h-1.5 rounded-full', priorityDot[t.priority])} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">
            {selectedDate ? formatDate(selectedDate) : 'Select a date'}
          </h3>
          {selectedTasks.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No tasks" description="Nothing scheduled for this day." />
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-ink-50 dark:bg-ink-800/50">
                  <div className={cn('w-2 h-2 rounded-full', priorityDot[t.priority])} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.title}</div>
                    {t.due_time && <div className="text-xs text-ink-400">{t.due_time}</div>}
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
