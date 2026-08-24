import React, { useState } from 'react';
import { Project, ProjectCategory } from '../types';
import { TEAM_MEMBERS } from '../data/mockData';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Engineering');
  const [icon, setIcon] = useState('folder');
  const [color, setColor] = useState('#06b6d4');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([TEAM_MEMBERS[0].name, TEAM_MEMBERS[1].name]);

  if (!isOpen) return null;

  const colorOptions = ['#06b6d4', '#6366f1', '#34d399', '#f43f5e', '#a855f7', '#f59e0b'];
  const iconOptions = ['folder', 'web', 'app_promo', 'palette', 'account_balance', 'code', 'rocket_launch', 'terminal'];

  const toggleMember = (memberName: string) => {
    if (selectedMembers.includes(memberName)) {
      if (selectedMembers.length > 1) {
        setSelectedMembers(selectedMembers.filter((m) => m !== memberName));
      }
    } else {
      setSelectedMembers([...selectedMembers, memberName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const members = selectedMembers.map((mName) => {
      const mem = TEAM_MEMBERS.find((m) => m.name === mName) || TEAM_MEMBERS[0];
      return { name: mem.name, avatar: mem.avatar };
    });

    onCreateProject({
      id: `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      category,
      color,
      icon,
      progress: 0,
      completedTasks: 0,
      totalTasks: 0,
      members,
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0a0a14]/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-cyan-400 text-[22px]">create_new_folder</span>
            <h3 className="text-base font-bold text-white">Create New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Infrastructure Modernization"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Goals, target milestones and architecture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full bg-[#0d0d18] border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Product">Product</option>
                <option value="Sales">Sales</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-2 py-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      color === c ? 'scale-115 border-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Project Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    icon === ic
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{ic}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Team Members</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {TEAM_MEMBERS.map((mem) => {
                const isSelected = selectedMembers.includes(mem.name);
                return (
                  <div
                    key={mem.id}
                    onClick={() => toggleMember(mem.name)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-cyan-400/50 bg-cyan-500/10'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={mem.avatar} alt={mem.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <span className="text-xs font-medium text-white">{mem.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2 font-mono">{mem.role}</span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {isSelected ? 'check_circle' : 'circle'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
