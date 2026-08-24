import React, { useState } from 'react';
import { Task, Priority, TaskStatus } from '../types';

interface MyTasksViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onOpenNewTask: () => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  onSelectTask,
  onToggleTaskComplete,
  onOpenNewTask,
}) => {
  const [layoutMode, setLayoutMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProject = projectFilter === 'all' || task.project.toLowerCase() === projectFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesProject && matchesPriority && matchesStatus;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  const uniqueProjects = Array.from(new Set(tasks.map((t) => t.project)));

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header & Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">My Tasks</h1>
          <p className="font-mono text-xs md:text-sm text-slate-400 mt-1">
            <span className="text-cyan-400 font-semibold">{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found</span> &bull; {doneTasks.length} completed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* List / Kanban View Switcher */}
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setLayoutMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                layoutMode === 'list'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              <span>List</span>
            </button>
            <button
              onClick={() => setLayoutMode('kanban')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                layoutMode === 'kanban'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_kanban</span>
              <span>Kanban</span>
            </button>
          </div>

          {/* New Task CTA */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl glass-panel">
        {/* Search within tasks */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-cyan-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Filter tasks by name, tag or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-[#0d0d18] border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-cyan-400"
          >
            <option value="all">All Projects</option>
            {uniqueProjects.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#0d0d18] border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-cyan-400"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Med">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d0d18] border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-cyan-400"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {(searchQuery || projectFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setProjectFilter('all');
                setPriorityFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 cursor-pointer whitespace-nowrap font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Content: List or Kanban */}
      {layoutMode === 'list' ? (
        /* List View */
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-white/5 border-b border-white/10 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
            <div className="col-span-5 flex items-center gap-2">Task Title</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2 text-right">Assignee</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5">
            {filteredTasks.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-600">search_off</span>
                <p className="text-sm">No tasks matched your current filters.</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === 'done';
                return (
                  <div
                    key={task.id}
                    className={`task-row flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-3.5 items-center transition-all cursor-pointer backdrop-blur-md ${
                      isDone
                        ? 'bg-white/[0.01] text-slate-500 opacity-60'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] hover:border-cyan-400/30 text-white'
                    }`}
                    onClick={() => onSelectTask(task)}
                  >
                    {/* Title & Checkbox */}
                    <div className="w-full md:col-span-5 flex items-center gap-3.5 min-w-0">
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

                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-semibold truncate block ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.title}
                        </span>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">checklist</span>
                            <span>
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project */}
                    <div className="w-full md:col-span-2 flex items-center">
                      <span className="text-xs px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10 truncate">
                        {task.project}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="w-full md:col-span-2 flex items-center gap-1.5 font-mono text-xs">
                      <span className={`material-symbols-outlined text-[16px] ${
                        task.isToday ? 'text-amber-300' : 'text-slate-400'
                      }`}>
                        calendar_today
                      </span>
                      <span className={task.isToday ? 'text-amber-300 font-semibold' : 'text-slate-400'}>
                        {task.dueLabel || task.dueDate}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="w-full md:col-span-1 flex items-center">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md backdrop-blur-md ${
                        task.priority === 'High'
                          ? 'bg-black/40 border border-rose-400/30 text-rose-400'
                          : task.priority === 'Med'
                          ? 'bg-black/40 border border-amber-400/30 text-amber-300'
                          : 'bg-black/40 border border-cyan-400/30 text-cyan-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Assignee */}
                    <div className="w-full md:col-span-2 flex items-center md:justify-end gap-2">
                      {task.assignees.map((assignee, idx) => (
                        <img
                          key={idx}
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="w-7 h-7 rounded-full object-cover border border-white/20"
                          title={assignee.name}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: To Do */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl glass-panel">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
                <h3 className="text-sm font-bold text-white">To Do</h3>
                <span className="font-mono text-xs text-slate-400">({todoTasks.length})</span>
              </div>
              <button
                onClick={onOpenNewTask}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>

            <div className="space-y-3">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="glass-card p-4 rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                      {task.project}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md backdrop-blur-md ${
                      task.priority === 'High' ? 'bg-black/40 border border-rose-400/30 text-rose-400' : 'bg-black/40 border border-cyan-400/30 text-cyan-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-cyan-300 transition-colors">{task.title}</h4>

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                    <span className="font-mono text-[11px] text-slate-400">{task.dueLabel || task.dueDate}</span>
                    {task.assignees[0] && (
                      <img
                        src={task.assignees[0].avatar}
                        alt={task.assignees[0].name}
                        className="w-6 h-6 rounded-full object-cover border border-white/20"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl glass-panel">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
                <h3 className="text-sm font-bold text-white">In Progress</h3>
                <span className="font-mono text-xs text-slate-400">({inProgressTasks.length})</span>
              </div>
              <button
                onClick={onOpenNewTask}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>

            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="glass-card p-4 rounded-2xl border border-amber-400/30 hover:border-amber-400 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                      {task.project}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-black/40 border border-amber-400/30 text-amber-300">
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-amber-300 transition-colors">{task.title}</h4>

                  {task.subtasks.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Subtasks</span>
                        <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-cyan-400"
                          style={{
                            width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                    <span className="font-mono text-[11px] text-slate-400">{task.dueLabel || task.dueDate}</span>
                    {task.assignees[0] && (
                      <img
                        src={task.assignees[0].avatar}
                        alt={task.assignees[0].name}
                        className="w-6 h-6 rounded-full object-cover border border-white/20"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Done */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl glass-panel">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                <h3 className="text-sm font-bold text-white">Done</h3>
                <span className="font-mono text-xs text-slate-400">({doneTasks.length})</span>
              </div>
            </div>

            <div className="space-y-3">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="glass-card p-4 rounded-2xl border border-white/5 opacity-60 hover:opacity-100 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-400">
                      {task.project}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">
                      check_circle
                    </span>
                  </div>

                  <h4 className="text-sm font-medium text-slate-400 line-through leading-snug">{task.title}</h4>

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs">
                    <span className="font-mono text-[11px] text-slate-500">Completed</span>
                    {task.assignees[0] && (
                      <img
                        src={task.assignees[0].avatar}
                        alt={task.assignees[0].name}
                        className="w-6 h-6 rounded-full object-cover border border-white/20"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
