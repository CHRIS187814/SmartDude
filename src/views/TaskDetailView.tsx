import React, { useState } from 'react';
import { Task, Priority, TaskStatus, CommentItem } from '../types';
import { CURRENT_USER, TEAM_MEMBERS } from '../data/mockData';

interface TaskDetailViewProps {
  task: Task;
  onBack: () => void;
  onUpdateTask: (updatedTask: Task) => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  task,
  onBack,
  onUpdateTask,
}) => {
  const [description, setDescription] = useState(task.description);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [isFavorite, setIsFavorite] = useState(task.isFavorite || false);

  // Toggle Subtask
  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  // Add Subtask
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const newSubItem = {
      id: `sub-${Date.now()}`,
      title: newSubtask.trim(),
      completed: false,
    };

    onUpdateTask({
      ...task,
      subtasks: [...task.subtasks, newSubItem],
    });
    setNewSubtask('');
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentItem: CommentItem = {
      id: `c-${Date.now()}`,
      author: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      text: newComment.trim(),
      time: 'Just now',
      role: CURRENT_USER.role,
      isCurrentUser: true,
    };

    onUpdateTask({
      ...task,
      comments: [...task.comments, commentItem],
    });
    setNewComment('');
  };

  // Add Tag
  const handleAddTag = () => {
    if (newTag.trim() && !task.tags.includes(newTag.trim().toLowerCase())) {
      onUpdateTask({
        ...task,
        tags: [...task.tags, newTag.trim().toLowerCase()],
      });
      setNewTag('');
      setShowAddTag(false);
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTask({
      ...task,
      tags: task.tags.filter((t) => t !== tagToRemove),
    });
  };

  // Update Status
  const handleStatusChange = (status: TaskStatus) => {
    onUpdateTask({ ...task, status });
  };

  // Update Priority
  const handlePriorityChange = (priority: Priority) => {
    onUpdateTask({ ...task, priority });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto select-none relative">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-20 right-8 z-50 bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-in fade-in slide-in-from-top-2">
          Link copied to clipboard!
        </div>
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button
            onClick={onBack}
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>My Tasks</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-white font-bold truncate max-w-[300px]">
            {task.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live presence "Currently viewing:" */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <span>Currently viewing:</span>
            <div className="flex items-center -space-x-1.5">
              {TEAM_MEMBERS.slice(0, 3).map((member) => (
                <div key={member.id} className="relative group/view" title={member.name}>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-5 h-5 rounded-full object-cover border border-[#05050a]"
                  />
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]"></span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
              isFavorite
                ? 'border-amber-400 text-amber-300 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'border-white/10 text-slate-400 hover:text-white bg-white/5'
            }`}
            title="Star Task"
          >
            <span className={`material-symbols-outlined text-[18px] ${isFavorite ? 'fill-1' : ''}`}>
              star
            </span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Task Body, Editor, Subtasks & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Title & Badge */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-400/30 font-semibold font-mono">
                {task.project}
              </span>
              <span className="font-mono text-xs text-slate-400">&bull; Created {task.createdAt}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {task.title}
            </h1>
          </div>

          {/* Description Editor with formatting toolbar */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
            {/* Formatting toolbar */}
            <div className="flex items-center gap-1 pb-3 border-b border-white/10 text-slate-400">
              <button className="p-1 rounded-lg hover:bg-white/10 hover:text-white" title="Bold">
                <span className="material-symbols-outlined text-[18px]">format_bold</span>
              </button>
              <button className="p-1 rounded-lg hover:bg-white/10 hover:text-white" title="Italic">
                <span className="material-symbols-outlined text-[18px]">format_italic</span>
              </button>
              <button className="p-1 rounded-lg hover:bg-white/10 hover:text-white" title="Bullet List">
                <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              </button>
              <button className="p-1 rounded-lg hover:bg-white/10 hover:text-white" title="Numbered List">
                <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
              </button>
              <button className="p-1 rounded-lg hover:bg-white/10 hover:text-white" title="Code Block">
                <span className="material-symbols-outlined text-[18px]">code</span>
              </button>
              <button className="p-1 rounded-lg hover:bg-white/10 hover:text-white" title="Attach Link">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>
            </div>

            {/* Editable Description area */}
            <textarea
              rows={5}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                onUpdateTask({ ...task, description: e.target.value });
              }}
              className="w-full bg-transparent text-sm text-slate-200 leading-relaxed outline-none resize-none placeholder-slate-500"
              placeholder="Add description..."
            />

            {/* Live Typing Status simulator */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10 text-[11px] text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-mono">Sarah Jenkins is collaborating in real-time...</span>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[20px]">checklist</span>
                <h3 className="text-base font-bold text-white">Subtasks</h3>
                <span className="font-mono text-xs text-slate-400">
                  ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                </span>
              </div>
            </div>

            {/* Subtask list */}
            <div className="space-y-2.5">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  onClick={() => handleToggleSubtask(subtask.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                    subtask.completed
                      ? 'bg-white/[0.02] border-white/5 opacity-50'
                      : 'bg-white/5 border-white/10 hover:border-cyan-400/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                        subtask.completed ? 'bg-emerald-400 text-slate-950 shadow-[0_0_6px_#34d399]' : 'border border-white/20'
                      }`}
                    >
                      {subtask.completed && <span className="material-symbols-outlined text-[13px] font-bold">check</span>}
                    </button>
                    <span className={`text-xs font-semibold ${subtask.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                      {subtask.title}
                    </span>
                  </div>

                  {subtask.assigneeAvatar && (
                    <img
                      src={subtask.assigneeAvatar}
                      alt="Assignee"
                      className="w-5 h-5 rounded-full object-cover border border-white/20"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-xs text-cyan-400 rounded-xl transition-colors font-bold cursor-pointer border border-white/10"
              >
                + Add
              </button>
            </form>
          </div>

          {/* Activity Stream */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">history</span>
              <h3 className="text-base font-bold text-white">Activity Stream</h3>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {task.activity.map((act) => (
                <div key={act.id} className="relative text-xs">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-[#05050a]"></span>
                  <p className="text-slate-300">
                    <span className="font-semibold text-white">{act.user}</span> {act.text}
                  </p>
                  <span className="font-mono text-[10px] text-slate-400">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Attributes & Live Chat */}
        <div className="space-y-6">
          {/* Metadata Box */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-5">
            {/* Status */}
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                Status
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
                {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={`py-1.5 text-[11px] font-bold rounded-xl capitalize transition-all cursor-pointer ${
                      task.status === s
                        ? s === 'done'
                          ? 'bg-emerald-400 text-slate-950 shadow-[0_0_10px_#34d399]'
                          : s === 'in_progress'
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_#f59e0b]'
                          : 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#06b6d4]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
                {(['Low', 'Med', 'High'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePriorityChange(p)}
                    className={`py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                      task.priority === p
                        ? p === 'High'
                          ? 'bg-rose-500 text-white shadow-[0_0_10px_#f43f5e]'
                          : p === 'Med'
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_#f59e0b]'
                          : 'bg-emerald-400 text-slate-950 shadow-[0_0_10px_#34d399]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                Assignee
              </label>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <img
                  src={task.assignees[0]?.avatar || TEAM_MEMBERS[0].avatar}
                  alt="Assignee"
                  className="w-8 h-8 rounded-full object-cover border border-white/20"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-white block truncate">
                    {task.assignees[0]?.name || TEAM_MEMBERS[0].name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Product Lead</span>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                Due Date
              </label>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                <span className="material-symbols-outlined text-[16px] text-cyan-400">event</span>
                <span>{task.dueLabel || task.dueDate}</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-white/5 text-cyan-300 border border-cyan-400/30 font-mono"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 text-slate-400 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}

                {showAddTag ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="tag..."
                      className="w-16 px-2 py-0.5 bg-white/5 text-xs text-white rounded-lg border border-cyan-400 outline-none font-mono"
                      autoFocus
                    />
                    <button
                      onClick={handleAddTag}
                      className="text-xs text-cyan-400 font-bold hover:underline"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddTag(true)}
                    className="px-2.5 py-0.5 rounded-lg text-xs border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-cyan-400 cursor-pointer"
                  >
                    + Tag
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Comments Box */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between h-[420px]">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-[18px]">chat</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Comments</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-mono flex items-center gap-1.5 border border-cyan-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  LIVE
                </span>
              </div>

              {/* Comments Feed */}
              <div className="py-3 space-y-3 max-h-[270px] overflow-y-auto pr-1">
                {task.comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  task.comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className={`p-3 rounded-2xl text-xs space-y-1 backdrop-blur-md ${
                        cmt.isCurrentUser
                          ? 'bg-cyan-500/10 border border-cyan-400/30 ml-4'
                          : 'bg-white/5 border border-white/10 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={cmt.avatar}
                            alt={cmt.author}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="font-bold text-white">{cmt.author}</span>
                          {cmt.role && (
                            <span className="text-[9px] text-slate-400 font-mono">({cmt.role})</span>
                          )}
                        </div>
                        <span className="font-mono text-[9px] text-slate-400">{cmt.time}</span>
                      </div>
                      <p className="text-slate-300 pl-5 leading-relaxed">{cmt.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment Composer Input */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                title="Send Comment"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
