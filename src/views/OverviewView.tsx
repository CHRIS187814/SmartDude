import React, { useState } from 'react';
import { Task, Project, ViewMode, PersonalContext, WorkspaceContext } from '../types';
import { LIVE_ACTIVITY_FEED, PERSONAL_CONTEXTS, WORKSPACE_CONTEXTS } from '../data/mockData';

interface OverviewViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onNavigate: (view: ViewMode) => void;
  onOpenNewTask: () => void;
  personalContext?: PersonalContext;
  workspaceContext?: WorkspaceContext;
  onSetPersonalContext?: (ctx: PersonalContext) => void;
  onSetWorkspaceContext?: (ws: WorkspaceContext) => void;
  onAddRoutineTask?: (routineName: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onToggleTaskComplete,
  onNavigate,
  onOpenNewTask,
  personalContext = 'professional',
  workspaceContext = 'team',
  onSetPersonalContext,
  onSetWorkspaceContext,
  onAddRoutineTask,
}) => {
  const [activeRange, setActiveRange] = useState<'7D' | '30D'>('7D');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [showLiveCursor, setShowLiveCursor] = useState(true);
  const [routineAddedToast, setRoutineAddedToast] = useState<string | null>(null);

  const activePersonal = PERSONAL_CONTEXTS.find((p) => p.id === personalContext) || PERSONAL_CONTEXTS[0];
  const activeWorkspace = WORKSPACE_CONTEXTS.find((w) => w.id === workspaceContext) || WORKSPACE_CONTEXTS[1];

  // Computed metrics
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const totalCount = tasks.length;
  const dueTodayTasks = tasks.filter((t) => t.isToday || t.dueLabel?.includes('Today'));
  const overdueTasks = tasks.filter((t) => t.isOverdue);

  // Quick add in focus list
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    onOpenNewTask();
    setQuickTaskTitle('');
  };

  const handleAddRoutine = (routine: string) => {
    if (onAddRoutineTask) {
      onAddRoutineTask(routine);
    }
    setRoutineAddedToast(routine);
    setTimeout(() => setRoutineAddedToast(null), 2500);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto relative select-none">
      {/* Toast */}
      {routineAddedToast && (
        <div className="fixed top-20 right-8 z-50 bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Added &ldquo;{routineAddedToast}&rdquo; to your tasks!</span>
        </div>
      )}

      {/* Live Multiplayer Floating Cursor simulation */}
      {showLiveCursor && (
        <div className="pointer-events-none fixed z-30 top-1/3 left-1/2 live-cursor-1 hidden xl:block">
          <div className="flex items-center gap-1.5 bg-cyan-400 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
            <span>Sarah Jenkins</span>
          </div>
          <svg className="w-4 h-4 text-cyan-400 -mt-1 -ml-1 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3l7 18 3-7 7-3L3 3z" />
          </svg>
        </div>
      )}

      {/* Header Section: Welcome & AI Companion Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-mono font-bold tracking-wider uppercase border border-cyan-400/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              SmartDude — AI Companion
            </span>
            <span className="text-slate-500 text-xs">&bull;</span>
            <span className="text-xs text-slate-400 font-mono">Workspace: <span className="text-white font-semibold">{activeWorkspace.label}</span></span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Good morning, Chris.
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            &ldquo;Your AI companion for everything you need to get done.&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLiveCursor(!showLiveCursor)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Toggle Live Collaboration Simulator"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]"></span>
            <span>Live Presence</span>
          </button>
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Adaptive Context Banner (Student, Professional, Homemaker, Freelancer, Entrepreneur, Personal) */}
      <div className="glass-card rounded-3xl p-5 md:p-6 border border-cyan-400/20 bg-gradient-to-r from-cyan-950/30 via-slate-950/60 to-indigo-950/30 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)] shrink-0">
              <span className="material-symbols-outlined text-[24px] font-bold">{activePersonal.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Adaptive Mode: {activePersonal.label}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  {activePersonal.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {activePersonal.companionGreeting}
              </p>
            </div>
          </div>

          {/* Context Switcher Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {PERSONAL_CONTEXTS.map((ctx) => {
              const isCurrent = personalContext === ctx.id;
              return (
                <button
                  key={ctx.id}
                  onClick={() => onSetPersonalContext && onSetPersonalContext(ctx.id as PersonalContext)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{ctx.icon}</span>
                  <span>{ctx.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Context Routines & Smart Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              Recommended Adaptive Routines (1-Click Add)
            </p>
            <div className="flex flex-wrap gap-2">
              {activePersonal.recommendedRoutines.map((routine) => (
                <button
                  key={routine}
                  onClick={() => handleAddRoutine(routine)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-xs text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 group"
                  title="Add routine as a task"
                >
                  <span className="material-symbols-outlined text-[14px] text-cyan-400 group-hover:rotate-90 transition-transform">add</span>
                  <span>{routine}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              SmartDude Companion Guidance
            </p>
            <ul className="space-y-1 text-xs text-slate-300">
              {activePersonal.smartTips.slice(0, 2).map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5 font-bold">&bull;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tasks */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</span>
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 material-symbols-outlined text-[18px] border border-cyan-400/30">
              task_alt
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{totalCount}</span>
            <span className="ml-2 font-mono text-[11px] text-cyan-400 font-semibold">+4 this week</span>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</span>
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 material-symbols-outlined text-[18px] border border-emerald-400/30">
              check_circle
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{completedCount}</span>
            <span className="ml-2 font-mono text-[11px] text-emerald-400 font-semibold">
              {Math.round((completedCount / Math.max(1, totalCount)) * 100)}% done
            </span>
          </div>
        </div>

        {/* Card 3: Due Today */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Due Today</span>
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-300 material-symbols-outlined text-[18px] border border-amber-400/30">
              schedule
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{dueTodayTasks.length}</span>
            <span className="ml-2 font-mono text-[11px] text-amber-300 font-semibold">action required</span>
          </div>
        </div>

        {/* Card 4: Overdue / Urgent */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue</span>
            <span className="p-2 rounded-xl bg-rose-500/15 text-rose-400 material-symbols-outlined text-[18px] border border-rose-400/30">
              warning
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl md:text-4xl font-bold text-rose-400 tracking-tight">{overdueTasks.length}</span>
            <span className="ml-2 font-mono text-[11px] text-rose-400 font-semibold">urgent attention</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Focus Checklist */}
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                  <span className="material-symbols-outlined text-[20px]">center_focus_strong</span>
                </div>
                <h2 className="text-lg font-bold text-white">Today&apos;s Focus</h2>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold transition-colors"
              >
                View all ({tasks.length})
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => {
                const isDone = task.status === 'done';
                return (
                  <div
                    key={task.id}
                    className={`task-row flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                      isDone
                        ? 'bg-white/[0.02] border-white/5 opacity-50'
                        : 'bg-white/5 border-white/10 hover:border-cyan-400/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTaskComplete(task.id);
                        }}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isDone
                            ? 'bg-emerald-400 text-slate-950 shadow-[0_0_8px_#34d399]'
                            : 'border border-white/20 hover:border-cyan-400 text-transparent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                      </button>

                      <div 
                        onClick={() => onSelectTask(task)}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <p className={`text-sm font-semibold truncate ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400">{task.project}</span>
                          {task.timeString && (
                            <span className="font-mono text-[10px] text-slate-300 bg-white/10 px-1.5 py-0.2 rounded border border-white/10">
                              {task.timeString}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md backdrop-blur-md ${
                        task.priority === 'High'
                          ? 'bg-black/40 border border-rose-400/30 text-rose-400'
                          : task.priority === 'Med'
                          ? 'bg-black/40 border border-amber-400/30 text-amber-300'
                          : 'bg-black/40 border border-cyan-400/30 text-cyan-400'
                      }`}>
                        {task.priority}
                      </span>

                      {task.assignees[0] && (
                        <img
                          src={task.assignees[0].avatar}
                          alt={task.assignees[0].name}
                          className="w-6 h-6 rounded-full object-cover border border-white/20"
                          title={task.assignees[0].name}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick add prompt */}
            <form onSubmit={handleQuickAdd} className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">add_circle_outline</span>
              <input
                type="text"
                placeholder="Click + New Task to create full tasks with subtasks & tags..."
                value={quickTaskTitle}
                onClick={onOpenNewTask}
                readOnly
                className="flex-1 bg-transparent text-xs text-slate-400 cursor-pointer outline-none placeholder-slate-500"
              />
              <button
                type="button"
                onClick={onOpenNewTask}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-xs text-cyan-400 rounded-xl transition-colors font-semibold cursor-pointer border border-white/10"
              >
                + Add
              </button>
            </form>
          </div>

          {/* Productivity Flow SVG Trend Line & Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Productivity Flow Line */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-white">Productivity Flow</h3>
                  <p className="font-mono text-[11px] text-slate-400">Completed vs Target</p>
                </div>
                <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                  <button
                    onClick={() => setActiveRange('7D')}
                    className={`px-2.5 py-0.5 text-[11px] font-mono rounded-lg cursor-pointer ${
                      activeRange === '7D' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setActiveRange('30D')}
                    className={`px-2.5 py-0.5 text-[11px] font-mono rounded-lg cursor-pointer ${
                      activeRange === '30D' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    30D
                  </button>
                </div>
              </div>

              {/* Interactive SVG Trend Chart */}
              <div className="h-36 w-full my-3 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradFlow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

                  {/* Area fill */}
                  <path
                    d="M 0,90 Q 50,40 100,70 T 200,30 T 300,15 L 300,120 L 0,120 Z"
                    fill="url(#gradFlow)"
                  />
                  {/* Primary Line */}
                  <path
                    d="M 0,90 Q 50,40 100,70 T 200,30 T 300,15"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Glowing data points */}
                  <circle cx="100" cy="70" r="4" fill="#34d399" stroke="#05050a" strokeWidth="2" />
                  <circle cx="200" cy="30" r="4" fill="#22d3ee" stroke="#05050a" strokeWidth="2" />
                  <circle cx="300" cy="15" r="5" fill="#22d3ee" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/10">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Chart 2: Status Breakdown Doughnut */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">Status Matrix</h3>
                <span className="font-mono text-[11px] text-cyan-400">Real-time</span>
              </div>

              <div className="flex items-center justify-around py-3">
                {/* Custom Doughnut Ring */}
                <div className="relative w-28 h-28 chart-doughnut flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <div className="relative z-10 text-center">
                    <span className="text-xl font-bold text-white leading-none block">{totalCount}</span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Tasks</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
                    <span className="text-slate-300">To Do ({todoCount})</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                    <span className="text-slate-300">In Progress ({inProgressCount})</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]"></span>
                    <span className="text-slate-300">Done ({completedCount})</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center pt-3 border-t border-white/10 font-mono">
                {Math.round((completedCount / Math.max(1, totalCount)) * 100)}% sprint velocity achieved
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Feed & Deadlines */}
        <div className="space-y-6">
          {/* Live Feed */}
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-white">Live Feed</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-mono flex items-center gap-1.5 border border-cyan-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              {LIVE_ACTIVITY_FEED.map((item, idx) => {
                const barColor = idx === 0 ? 'bg-cyan-400' : idx === 1 ? 'bg-rose-500' : idx === 2 ? 'bg-indigo-400' : 'bg-emerald-400';
                return (
                  <div key={item.id} className="flex gap-3.5 text-xs items-start">
                    <div className={`w-1 h-10 ${barColor} rounded-full shrink-0 shadow-sm mt-0.5`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                        {item.time} &mdash; <span className="text-white font-medium">{item.user}</span>
                      </p>
                      <p className="text-slate-200 text-xs font-medium leading-snug">
                        {item.action} <span className={`font-semibold ${item.targetColor}`}>{item.target}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-300 text-[20px]">event_upcoming</span>
                <h3 className="text-base font-bold text-white">Upcoming Deadlines</h3>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-3">
              {tasks.filter((t) => t.status !== 'done').slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 cursor-pointer transition-colors backdrop-blur-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                    <p className="font-mono text-[10px] text-amber-300 mt-0.5">{task.dueLabel || task.dueDate}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full shrink-0 ml-2 shadow-[0_0_6px] ${
                    task.priority === 'High' ? 'bg-rose-500 shadow-rose-500' : 'bg-emerald-400 shadow-emerald-400'
                  }`}></span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Initiatives Mini Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Active Initiatives</h3>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5">
              {projects.slice(0, 3).map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate">{p.name}</span>
                    <span className="font-mono text-[11px] text-cyan-400 font-bold">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
