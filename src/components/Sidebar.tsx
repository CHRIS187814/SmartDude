import React from 'react';
import { ViewMode, PersonalContext, WorkspaceContext } from '../types';
import { PERSONAL_CONTEXTS, WORKSPACE_CONTEXTS } from '../data/mockData';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenNewTask: () => void;
  favoritesCount?: number;
  personalContext?: PersonalContext;
  workspaceContext?: WorkspaceContext;
  onOpenContextSwitcher?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenNewTask,
  favoritesCount = 2,
  personalContext = 'professional',
  workspaceContext = 'team',
  onOpenContextSwitcher,
}) => {
  const currentPersonal = PERSONAL_CONTEXTS.find((c) => c.id === personalContext) || PERSONAL_CONTEXTS[0];
  const currentWorkspace = WORKSPACE_CONTEXTS.find((w) => w.id === workspaceContext) || WORKSPACE_CONTEXTS[1];

  const navItems = [
    { id: 'overview' as ViewMode, label: 'Overview', icon: 'dashboard' },
    { id: 'tasks' as ViewMode, label: 'My Tasks', icon: 'assignment' },
    { id: 'projects' as ViewMode, label: 'Projects', icon: 'folder' },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: 'calendar_today' },
    { id: 'analytics' as ViewMode, label: 'Analytics', icon: 'analytics' },
  ];

  const systemItems = [
    { id: 'favorites' as ViewMode, label: 'Favorites', icon: 'star', count: favoritesCount },
    { id: 'recent' as ViewMode, label: 'Recent', icon: 'history' },
    { id: 'settings' as ViewMode, label: 'Settings & About', icon: 'settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen py-6 px-4 bg-white/5 backdrop-blur-2xl border-r border-white/10 text-slate-200 fixed left-0 top-0 w-[240px] z-50 select-none">
      {/* Brand Header */}
      <div 
        onClick={() => onNavigate('overview')}
        className="flex items-center gap-3 mb-6 px-2 cursor-pointer group"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 rounded-xl shadow-[0_0_18px_rgba(34,211,238,0.4)] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
          <span className="material-symbols-outlined text-slate-950 text-[22px] font-bold fill-1">smart_toy</span>
        </div>
        <div>
          <h1 className="text-[17px] font-extrabold tracking-tight text-white leading-none">SMARTDUDE</h1>
          <p className="font-mono text-[9px] text-cyan-400 font-bold mt-1 tracking-wider uppercase">AI COMPANION</p>
        </div>
      </div>

      {/* Adaptive Context Badge & Switcher */}
      <div 
        onClick={onOpenContextSwitcher}
        className="mb-5 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 transition-all cursor-pointer backdrop-blur-md group"
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span className="font-mono uppercase tracking-wider">Active Mode</span>
          <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5 font-semibold">
            Change
            <span className="material-symbols-outlined text-[12px]">tune</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-cyan-400">{currentPersonal.icon}</span>
          <span className="text-xs font-bold text-white truncate">{currentPersonal.label}</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">Workspace: {currentWorkspace.label}</p>
      </div>

      {/* Primary Action: New Task with Neon Cyan Glow */}
      <button
        onClick={onOpenNewTask}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 px-4 rounded-xl text-sm font-bold mb-5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 group cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform duration-300">add</span>
        <span>New Task</span>
      </button>

      {/* Main Navigation */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === 'tasks' && currentView === 'task_detail');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 text-left cursor-pointer group ${
                isActive
                  ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-cyan-400 fill-1' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* System / Quick Links */}
      <div className="pt-3 border-t border-white/10 flex flex-col gap-1">
        <p className="font-mono text-[10px] text-slate-500 px-3 mb-1 tracking-wider uppercase">System</p>
        {systemItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-all duration-150 text-left cursor-pointer group ${
                isActive
                  ? 'bg-white/10 text-white font-semibold border border-white/15'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-cyan-400 fill-1' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Companion Status Pulse Widget */}
      <div className="mt-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Companion Intelligence</p>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Adaptive Assistance</span>
          <span className="font-mono text-[10px] text-cyan-400">Active</span>
        </div>
      </div>
    </aside>
  );
};

