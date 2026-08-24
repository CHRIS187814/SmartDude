import React, { useState } from 'react';
import { ViewMode, Task, PersonalContext, WorkspaceContext } from '../types';
import { TEAM_MEMBERS, PERSONAL_CONTEXTS, WORKSPACE_CONTEXTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  currentView: ViewMode;
  selectedTask: Task | null;
  onNavigate: (view: ViewMode) => void;
  onOpenCommandPalette: () => void;
  onOpenNewTask: () => void;
  unreadCount: number;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  personalContext?: PersonalContext;
  workspaceContext?: WorkspaceContext;
  onSetPersonalContext?: (ctx: PersonalContext) => void;
  onSetWorkspaceContext?: (ws: WorkspaceContext) => void;
  onOpenContextModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  selectedTask,
  onNavigate,
  onOpenCommandPalette,
  onOpenNewTask,
  unreadCount,
  onToggleTheme,
  isDarkMode = true,
  personalContext = 'professional',
  workspaceContext = 'team',
  onSetPersonalContext,
  onSetWorkspaceContext,
  onOpenContextModal,
  onOpenAuthModal,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const { currentUser, userProfile, logout, switchPersonalContext, switchWorkspace, workspaces, activeWorkspace: authActiveWs } = useAuth();

  const activePersonal = PERSONAL_CONTEXTS.find((p) => p.id === (userProfile?.profileType || personalContext)) || PERSONAL_CONTEXTS[0];
  const activeWorkspace = WORKSPACE_CONTEXTS.find((w) => w.id === workspaceContext) || WORKSPACE_CONTEXTS[1];

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Chris M.';
  const userEmail = userProfile?.email || currentUser?.email || 'chris.abraham@bscdsaih.christuniversity.in';
  const userPhoto = userProfile?.photoURL || currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  const getTitle = () => {
    switch (currentView) {
      case 'overview':
        return 'Overview';
      case 'tasks':
        return 'My Tasks';
      case 'task_detail':
        return selectedTask ? selectedTask.title : 'Task Details';
      case 'projects':
        return 'Active Projects';
      case 'calendar':
        return 'Calendar';
      case 'analytics':
        return 'Analytics';
      case 'notifications':
        return 'Notifications';
      case 'settings':
        return 'Settings & About';
      case 'favorites':
        return 'Favorites';
      case 'recent':
        return 'Recent Activity';
      default:
        return 'SmartDude';
    }
  };

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center h-20 px-4 md:px-8 w-full bg-white/5 backdrop-blur-xl border-b border-white/10 text-slate-200 select-none">
      {/* Left zone: Brand for mobile / Breadcrumbs for desktop */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 md:hidden">
          <div 
            onClick={() => onNavigate('overview')}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.4)]"
          >
            <span className="material-symbols-outlined text-slate-950 text-[18px] font-bold fill-1">smart_toy</span>
          </div>
          <span className="font-bold text-[16px] text-white truncate">SmartDude</span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm text-slate-400 min-w-0">
          {currentView === 'task_detail' && selectedTask ? (
            <>
              <button 
                onClick={() => onNavigate('tasks')}
                className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                My Tasks
              </button>
              <span className="material-symbols-outlined text-[16px] shrink-0 text-slate-500">chevron_right</span>
              <span className="text-white font-medium truncate max-w-[280px]">
                {selectedTask.title}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] font-bold text-white tracking-tight">{getTitle()}</h2>
              {/* Context Indicator Pill */}
              <div className="relative">
                <button
                  onClick={() => setContextMenuOpen(!contextMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md cursor-pointer transition-all shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                  title="Switch Personal or Workspace Context"
                >
                  <span className="material-symbols-outlined text-[14px] text-cyan-400">{activePersonal.icon}</span>
                  <span className="truncate max-w-[130px]">{activePersonal.label}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-300 truncate max-w-[110px]">{authActiveWs?.name || activeWorkspace.label}</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
                </button>

                {/* Context Selector Dropdown */}
                {contextMenuOpen && (
                  <div
                    className="absolute left-0 top-10 w-72 glass-panel rounded-2xl p-3 border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl"
                    onMouseLeave={() => setContextMenuOpen(false)}
                  >
                    <div className="px-2 py-1 mb-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white flex items-center justify-between">
                        <span>Adaptive Contexts</span>
                        <span className="font-mono text-[9px] text-cyan-400">SMARTDUDE AI</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        SmartDude adapts its assistance to your active role and workspace.
                      </p>
                    </div>

                    <div className="mb-2">
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 mb-1">
                        Personal Context
                      </p>
                      <div className="space-y-1">
                        {PERSONAL_CONTEXTS.map((ctx) => (
                          <button
                            key={ctx.id}
                            onClick={() => {
                              switchPersonalContext(ctx.id as PersonalContext);
                              if (onSetPersonalContext) onSetPersonalContext(ctx.id as PersonalContext);
                              setContextMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                              (userProfile?.profileType || personalContext) === ctx.id
                                ? 'bg-cyan-500/20 text-white font-bold border border-cyan-400/40'
                                : 'text-slate-300 hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-cyan-400">{ctx.icon}</span>
                              <span>{ctx.label}</span>
                            </div>
                            {(userProfile?.profileType || personalContext) === ctx.id && (
                              <span className="material-symbols-outlined text-[14px] text-cyan-400">check</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 mb-1">
                        Workspaces ({workspaces.length})
                      </p>
                      <div className="space-y-1 max-h-44 overflow-y-auto">
                        {workspaces.map((ws) => (
                          <button
                            key={ws.id}
                            onClick={() => {
                              switchWorkspace(ws.id);
                              setContextMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                              authActiveWs?.id === ws.id
                                ? 'bg-cyan-500/20 text-white font-bold border border-cyan-400/40'
                                : 'text-slate-300 hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="material-symbols-outlined text-[16px] text-indigo-400">workspaces</span>
                              <span className="truncate">{ws.name}</span>
                            </div>
                            {authActiveWs?.id === ws.id && (
                              <span className="material-symbols-outlined text-[14px] text-cyan-400">check</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center zone: Search pill with shortcut hint */}
      <div className="hidden lg:flex items-center justify-center flex-1 max-w-md px-2">
        <button
          onClick={onOpenCommandPalette}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 rounded-full py-2 pl-4 pr-3 text-sm text-slate-400 flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-sm backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-cyan-400 transition-colors">smart_toy</span>
            <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Ask SmartDude or search tasks, routines, projects...</span>
          </div>
          <kbd className="font-mono text-[10px] bg-white/10 group-hover:bg-white/15 text-slate-300 px-2 py-0.5 rounded border border-white/10">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right zone: Presence, Notifications, Actions & User */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Presence Avatars (Desktop) */}
        <div className="hidden xl:flex items-center -space-x-2 mr-1">
          {TEAM_MEMBERS.slice(0, 3).map((member) => (
            <div key={member.id} className="relative group/avatar" title={`${member.name} (${member.role})`}>
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#05050a] hover:scale-110 transition-transform">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-[#05050a] shadow-[0_0_6px_#34d399]"></div>
            </div>
          ))}
          <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#05050a] flex items-center justify-center font-mono text-[10px] font-bold text-slate-300 backdrop-blur-md">
            +5
          </div>
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title="Search"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => onNavigate('notifications')}
          className={`p-2 rounded-full transition-all duration-150 cursor-pointer relative ${
            currentView === 'notifications'
              ? 'text-cyan-400 bg-cyan-500/15 border border-cyan-400/30'
              : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
          }`}
          title="Notifications"
        >
          <span className={`material-symbols-outlined text-[20px] ${currentView === 'notifications' ? 'fill-1' : ''}`}>
            notifications
          </span>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e] border border-[#05050a]"></span>
          )}
        </button>

        {/* Quick Add / Add Task Button with Cyan Glow */}
        <button
          onClick={onOpenNewTask}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>New Task</span>
        </button>

        <div className="h-6 w-px bg-white/10 hidden sm:block mx-1"></div>

        {/* Profile Avatar with Neon Gradient Ring & Menu */}
        <div className="relative">
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-white/10 p-1.5 rounded-xl transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 border-2 border-white/20 p-0.5 relative">
              <div className="w-full h-full bg-slate-900 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs">
                <img
                  src={userPhoto}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#05050a] shadow-[0_0_6px_#34d399]"></div>
            </div>
            <span className="text-xs font-semibold text-white hidden md:block">{displayName}</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400 hidden md:block">
              {profileOpen ? 'expand_less' : 'expand_more'}
            </span>
          </div>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div 
              className="absolute right-0 top-14 w-64 glass-panel rounded-2xl py-2 border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-bold text-white">{displayName}</p>
                <p className="font-mono text-[11px] text-slate-400 truncate">{userEmail}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-400/30 uppercase">
                    {userProfile?.role || 'User'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                    {activePersonal.label}
                  </span>
                </div>
              </div>

              <div className="py-1">
                {currentUser ? (
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (onOpenAuthModal) onOpenAuthModal();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>Sign In / Create Account</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onNavigate('settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  <span>Settings & Privacy Controls</span>
                </button>

                <button
                  onClick={() => {
                    if (onToggleTheme) onToggleTheme();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">
                      {isDarkMode ? 'dark_mode' : 'light_mode'}
                    </span>
                    <span>Theme</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {isDarkMode ? 'Dark' : 'Light'}
                  </span>
                </button>
              </div>

              <div className="pt-1 border-t border-white/10">
                <div className="px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Persistent Firestore</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


