import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn, relativeTime, formatDateTime } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';

export default function Notifications() {
  const { notifications, loading, markRead, markAllRead } = useNotifications();

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" description="You'll see reminders and activity here as they come in." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={cn('card p-4 cursor-pointer transition', !n.read && 'border-primary-300 dark:border-primary-700 bg-primary-50/30 dark:bg-primary-900/10')}
            >
              <div className="flex items-start gap-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', n.type === 'reminder' ? 'bg-warning-50 dark:bg-warning-900/30 text-warning-600' : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600')}>
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                  </div>
                  {n.body && <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{n.body}</p>}
                  <div className="text-xs text-ink-400 mt-1.5">{relativeTime(n.scheduled_for)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
