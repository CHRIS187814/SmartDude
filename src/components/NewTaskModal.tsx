import React, { useState } from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { TEAM_MEMBERS, INITIAL_PROJECTS } from '../data/mockData';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (newTask: Partial<Task>) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('Marketing');
  const [priority, setPriority] = useState<Priority>('Med');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAssignee, setSelectedAssignee] = useState(TEAM_MEMBERS[0].name);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['frontend', 'priority']);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: `sub-${Date.now()}`,
          title: subtaskInput.trim(),
          completed: false,
        },
      ]);
      setSubtaskInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assigneeObj = TEAM_MEMBERS.find((m) => m.name === selectedAssignee) || TEAM_MEMBERS[0];

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      project,
      priority,
      status,
      dueDate,
      dueLabel: dueDate === new Date().toISOString().split('T')[0] ? 'Today' : dueDate,
      timeString: '5:00 PM',
      assignees: [
        {
          name: assigneeObj.name,
          avatar: assigneeObj.avatar,
        },
      ],
      tags,
      subtasks,
      comments: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          text: 'created this task',
          user: 'You',
          time: 'Just now',
          type: 'create',
        },
      ],
      viewers: [],
      createdAt: new Date().toISOString().split('T')[0],
    });

    // Reset form
    setTitle('');
    setDescription('');
    setTags(['frontend']);
    setSubtasks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#0a0a14]/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-cyan-400 text-[22px]">add_task</span>
            <h3 className="text-base font-bold text-white">Create New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement OAuth Flow for Google Sign-in"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Provide context, acceptance criteria or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors resize-none"
            />
          </div>

          {/* Project & Assignee row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Project</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full bg-[#0d0d18] border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
              >
                {INITIAL_PROJECTS.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value="Design System">Design System</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Assignee</label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full bg-[#0d0d18] border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Due Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
              <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                {(['Low', 'Med', 'High'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      priority === p
                        ? p === 'High'
                          ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-400/30'
                          : p === 'Med'
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30'
                          : 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#0d0d18] border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Subtasks</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a subtask item..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-xs text-white rounded-xl transition-colors font-medium cursor-pointer border border-white/10"
              >
                Add
              </button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-1.5">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                    <span className="truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => setSubtasks(subtasks.filter((s) => s.id !== st.id))}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Tags</label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-white/10 text-slate-300 border border-white/10"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 transition-colors cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-xs text-white rounded-xl transition-colors font-medium cursor-pointer border border-white/10"
              >
                + Tag
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-transform active:scale-95 cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
