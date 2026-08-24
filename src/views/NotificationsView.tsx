import React, { useState } from 'react';
import { NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onToggleNotificationRead: (id: string) => void;
  onSelectTaskById: (taskId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
  onToggleNotificationRead,
  onSelectTaskById,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return n.isUnread;
    if (activeTab === 'archived') return !n.isUnread;
    return true;
  });

  const todayItems = filtered.filter((n) => n.group === 'Today');
  const yesterdayItems = filtered.filter((n) => n.group === 'Yesterday');
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'assignment':
        return { icon: 'person_add', color: 'text-cyan-400 bg-cyan-500/15 border border-cyan-400/30' };
      case 'deadline':
        return { icon: 'schedule', color: 'text-amber-300 bg-amber-500/15 border border-amber-400/30' };
      case 'comment':
        return { icon: 'chat', color: 'text-emerald-400 bg-emerald-500/15 border border-emerald-400/30' };
      case 'system':
        return { icon: 'info', color: 'text-indigo-300 bg-indigo-500/15 border border-indigo-400/30' };
      default:
        return { icon: 'notifications', color: 'text-slate-400 bg-white/10 border border-white/10' };
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Notifications
          </h1>
          <p className="font-mono text-xs md:text-sm text-slate-400 mt-1">
            <span className="text-cyan-400 font-semibold">{unreadCount} unread updates</span> requiring your attention
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            <span>Mark all as read</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'unread'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'archived'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Grouped Notifications List */}
      <div className="space-y-6">
        {/* Today Group */}
        {todayItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400">Today</h3>
            <div className="space-y-2.5">
              {todayItems.map((item) => {
                const { icon, color } = getIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className={`glass-card p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 backdrop-blur-md ${
                      item.isUnread
                        ? 'border-cyan-400/40 bg-white/5'
                        : 'border-white/5 bg-white/[0.02] opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                          {item.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                          {item.message}{' '}
                          {item.highlightText && (
                            <span className="font-semibold text-cyan-300 underline cursor-pointer">
                              {item.highlightText}
                            </span>
                          )}
                        </p>

                        <div className="flex items-center gap-4 mt-2 font-mono text-[11px] text-slate-400">
                          <span>{item.time}</span>
                          {item.taskId && (
                            <button
                              onClick={() => onSelectTaskById(item.taskId!)}
                              className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1 font-sans font-semibold"
                            >
                              Go to task <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleNotificationRead(item.id)}
                      className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={item.isUnread ? 'Mark as read' : 'Mark as unread'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {item.isUnread ? 'check' : 'mark_chat_unread'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Yesterday Group */}
        {yesterdayItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400">Yesterday</h3>
            <div className="space-y-2.5">
              {yesterdayItems.map((item) => {
                const { icon, color } = getIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className={`glass-card p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 backdrop-blur-md ${
                      item.isUnread
                        ? 'border-cyan-400/40 bg-white/5'
                        : 'border-white/5 bg-white/[0.02] opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                          {item.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                          {item.message}{' '}
                          {item.highlightText && (
                            <span className="font-semibold text-cyan-300">
                              {item.highlightText}
                            </span>
                          )}
                        </p>

                        <div className="flex items-center gap-4 mt-2 font-mono text-[11px] text-slate-400">
                          <span>{item.time}</span>
                          {item.taskId && (
                            <button
                              onClick={() => onSelectTaskById(item.taskId!)}
                              className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1 font-sans font-semibold"
                            >
                              Go to task <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleNotificationRead(item.id)}
                      className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={item.isUnread ? 'Mark as read' : 'Mark as unread'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {item.isUnread ? 'check' : 'mark_chat_unread'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 glass-card rounded-3xl border border-white/10">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-600">notifications_off</span>
            <p className="text-sm">No notifications to display in this tab.</p>
          </div>
        )}
      </div>
    </div>
  );
};
