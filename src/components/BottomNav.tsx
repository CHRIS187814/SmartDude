import React from 'react';
import { ViewMode } from '../types';

interface BottomNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenNewTask: () => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenNewTask,
  unreadCount = 0,
}) => {
  const navItems = [
    { id: 'overview' as ViewMode, label: 'Home', icon: 'dashboard' },
    { id: 'tasks' as ViewMode, label: 'Tasks', icon: 'assignment' },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: 'calendar_today' },
    { id: 'notifications' as ViewMode, label: 'Inbox', icon: 'notifications', badge: unreadCount },
    { id: 'settings' as ViewMode, label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/5 backdrop-blur-2xl border-t border-white/10 z-50 flex items-center justify-around px-2 pb-safe select-none text-slate-200">
      {navItems.slice(0, 2).map((item) => {
        const isActive = currentView === item.id || (item.id === 'tasks' && currentView === 'task_detail');
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors cursor-pointer ${
              isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${isActive ? 'fill-1' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Center Floating Action Button with Cyan Glow */}
      <div className="flex items-center justify-center px-1">
        <button
          onClick={onOpenNewTask}
          className="w-11 h-11 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-transform cursor-pointer font-bold"
          title="New Task"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
        </button>
      </div>

      {navItems.slice(2).map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors relative cursor-pointer ${
              isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_6px_#f43f5e]"></span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
