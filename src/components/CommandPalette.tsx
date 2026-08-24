import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, Task, Project, PersonalContext, WorkspaceContext } from '../types';
import { PERSONAL_CONTEXTS, WORKSPACE_CONTEXTS } from '../data/mockData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  tasks: Task[];
  projects: Project[];
  onToggleTheme: () => void;
  personalContext?: PersonalContext;
  onSetPersonalContext?: (ctx: PersonalContext) => void;
  workspaceContext?: WorkspaceContext;
  onSetWorkspaceContext?: (ws: WorkspaceContext) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectTask,
  onOpenNewTask,
  tasks,
  projects,
  onToggleTheme,
  personalContext = 'professional',
  onSetPersonalContext,
  workspaceContext = 'team',
  onSetWorkspaceContext,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const baseCommands = [
    {
      id: 'cmd-new-task',
      title: 'SmartDude: Create New Task',
      shortcut: '⌘N',
      icon: 'add_circle',
      category: 'Companion Actions',
      action: () => {
        onClose();
        onOpenNewTask();
      },
    },
    {
      id: 'cmd-overview',
      title: 'Go to Overview Dashboard',
      shortcut: '⌘O',
      icon: 'dashboard',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigate('overview');
      },
    },
    {
      id: 'cmd-tasks',
      title: 'Go to My Tasks',
      shortcut: '⌘T',
      icon: 'assignment',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigate('tasks');
      },
    },
    {
      id: 'cmd-projects',
      title: 'Go to Active Projects',
      shortcut: '⌘P',
      icon: 'folder',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigate('projects');
      },
    },
    {
      id: 'cmd-calendar',
      title: 'Go to Calendar & Planning',
      shortcut: '⌘C',
      icon: 'calendar_today',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigate('calendar');
      },
    },
    {
      id: 'cmd-analytics',
      title: 'SmartDude Productivity Insights',
      shortcut: '⌘A',
      icon: 'analytics',
      category: 'Companion Actions',
      action: () => {
        onClose();
        onNavigate('analytics');
      },
    },
    {
      id: 'cmd-theme',
      title: 'Toggle Dark / Light Mode',
      shortcut: '⌘D',
      icon: 'dark_mode',
      category: 'Preferences',
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'cmd-settings',
      title: 'Open Settings & About SmartDude',
      shortcut: '⌘,',
      icon: 'settings',
      category: 'Preferences',
      action: () => {
        onClose();
        onNavigate('settings');
      },
    },
  ];

  // Dynamic context switching commands
  const contextCommands = PERSONAL_CONTEXTS.map((ctx) => ({
    id: `cmd-ctx-${ctx.id}`,
    title: `Switch Context: ${ctx.label} (${ctx.badge})`,
    shortcut: '',
    icon: ctx.icon,
    category: 'Personal Contexts',
    action: () => {
      if (onSetPersonalContext) onSetPersonalContext(ctx.id as PersonalContext);
      onClose();
    },
  }));

  const workspaceCommands = WORKSPACE_CONTEXTS.map((ws) => ({
    id: `cmd-ws-${ws.id}`,
    title: `Switch Workspace: ${ws.label}`,
    shortcut: '',
    icon: ws.icon,
    category: 'Workspace Contexts',
    action: () => {
      if (onSetWorkspaceContext) onSetWorkspaceContext(ws.id as WorkspaceContext);
      onClose();
    },
  }));

  const commands = [...baseCommands, ...contextCommands, ...workspaceCommands];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.project.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [
    ...filteredCommands.map((c) => ({ type: 'command' as const, item: c })),
    ...filteredTasks.map((t) => ({ type: 'task' as const, item: t })),
    ...filteredProjects.map((p) => ({ type: 'project' as const, item: p })),
  ];

  const handleSelect = (result: typeof allResults[0]) => {
    if (!result) return;
    if (result.type === 'command') {
      result.item.action();
    } else if (result.type === 'task') {
      onSelectTask(result.item);
      onClose();
    } else if (result.type === 'project') {
      onNavigate('projects');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(1, allResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#0a0a14]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search header */}
        <div className="flex items-center px-5 py-4 border-b border-white/10 bg-white/5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center mr-3 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            <span className="material-symbols-outlined text-slate-950 text-[18px] font-bold">smart_toy</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask SmartDude or search tasks, routines, projects, contexts..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm md:text-base outline-none font-medium"
          />
          <kbd 
            onClick={onClose}
            className="font-mono text-xs bg-white/10 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
          >
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-3">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-600">search_off</span>
              <p className="text-sm">SmartDude found no matching items for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for &quot;Student&quot;, &quot;Task&quot;, &quot;Project&quot;, or &quot;Routine&quot;.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredCommands.length > 0 && (
                <div className="px-3 py-1 font-mono text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
                  SmartDude Companion Commands
                </div>
              )}
              {filteredCommands.map((cmd) => {
                const globalIdx = allResults.findIndex((r) => r.type === 'command' && r.item.id === cmd.id);
                const isSelected = selectedIndex === globalIdx;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => cmd.action()}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-white border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {cmd.icon}
                      </span>
                      <span className="text-sm font-medium">{cmd.title}</span>
                    </div>
                    {cmd.shortcut && (
                      <kbd className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                        isSelected ? 'bg-cyan-500 text-slate-950 font-bold border-transparent' : 'bg-white/10 text-slate-400 border-white/10'
                      }`}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}

              {filteredTasks.length > 0 && (
                <div className="px-3 pt-3 pb-1 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  Tasks
                </div>
              )}
              {filteredTasks.map((task) => {
                const globalIdx = allResults.findIndex((r) => r.type === 'task' && r.item.id === task.id);
                const isSelected = selectedIndex === globalIdx;
                return (
                  <button
                    key={task.id}
                    onClick={() => {
                      onSelectTask(task);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-white border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`material-symbols-outlined text-[18px] ${
                        task.status === 'done' ? 'text-emerald-400' : task.priority === 'High' ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {task.status === 'done' ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-sm font-medium truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                        {task.project}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        task.priority === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-400/30' : 'bg-white/10 text-slate-300'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredProjects.length > 0 && (
                <div className="px-3 pt-3 pb-1 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  Projects
                </div>
              )}
              {filteredProjects.map((project) => {
                const globalIdx = allResults.findIndex((r) => r.type === 'project' && r.item.id === project.id);
                const isSelected = selectedIndex === globalIdx;
                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      onNavigate('projects');
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-white border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-cyan-400">
                        {project.icon}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-white">{project.name}</span>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-emerald-400">
                      {project.progress}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>ESC dismiss</span>
          </div>
          <span className="text-cyan-400 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">smart_toy</span>
            SmartDude AI Hub
          </span>
        </div>
      </div>
    </div>
  );
};

