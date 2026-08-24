import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  onOpenNewProject: () => void;
  onNavigateToTasksWithProject?: (projectName: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenNewProject,
  onNavigateToTasksWithProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Marketing', 'Design', 'Engineering', 'Product'];

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Active Projects
          </h1>
          <p className="font-mono text-xs md:text-sm text-slate-400 mt-1">
            <span className="text-cyan-400 font-semibold">{projects.length} ongoing initiatives</span> across 4 squads
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
          <span>New Project</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3.5 top-2 text-cyan-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, idx) => {
          const statusText = idx === 0 ? 'ACTIVE' : idx === 1 ? 'STABLE' : 'EXPANDING';
          const statusColor = idx === 0 ? 'border-cyan-400/30 text-cyan-400' : idx === 1 ? 'border-emerald-400/30 text-emerald-400' : 'border-indigo-400/30 text-indigo-300';

          return (
            <div
              key={project.id}
              onClick={() => onNavigateToTasksWithProject?.(project.name)}
              className="glass-card rounded-3xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform border border-white/10"
                    style={{ backgroundColor: `${project.color}20`, color: project.color }}
                  >
                    <span className="material-symbols-outlined">{project.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {project.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {project.category}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/40 backdrop-blur-md border ${statusColor}`}>
                  {statusText}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {project.description}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Progress</span>
                  <span className="text-cyan-400 font-semibold">{project.progress}% ({project.completedTasks}/{project.totalTasks})</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-400 to-indigo-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer: Team Avatars & View button */}
              <div className="flex items-center justify-between pt-3.5 border-t border-white/10">
                <div className="flex items-center -space-x-2">
                  {project.members.map((mem, memIdx) => (
                    <img
                      key={memIdx}
                      src={mem.avatar}
                      alt={mem.name}
                      className="w-7 h-7 rounded-full object-cover border border-white/20"
                      title={mem.name}
                    />
                  ))}
                </div>

                <span className="text-xs text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                  View Tasks
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
