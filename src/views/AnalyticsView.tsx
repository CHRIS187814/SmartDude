import React, { useState } from 'react';
import { Task, Project } from '../types';

interface AnalyticsViewProps {
  tasks: Task[];
  projects: Project[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks }) => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'Year'>('30D');
  const [exportToast, setExportToast] = useState(false);

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const totalCount = tasks.length;
  const completionRate = Math.round((completedCount / Math.max(1, totalCount)) * 100);

  const highPriorityCount = tasks.filter((t) => t.priority === 'High').length;
  const medPriorityCount = tasks.filter((t) => t.priority === 'Med').length;
  const lowPriorityCount = tasks.filter((t) => t.priority === 'Low').length;

  const handleExport = () => {
    setExportToast(true);
    setTimeout(() => setExportToast(false), 2500);
  };

  // 7 rows (Mon-Sun), 14 columns of heatmap cells
  const heatmapData = [
    [1, 2, 4, 3, 2, 5, 6, 3, 4, 7, 5, 8, 4, 6], // Mon
    [2, 3, 1, 4, 5, 2, 4, 6, 8, 5, 3, 6, 7, 5], // Tue
    [4, 5, 3, 6, 7, 4, 8, 5, 6, 9, 7, 8, 6, 9], // Wed
    [3, 4, 2, 5, 6, 3, 5, 7, 6, 8, 6, 7, 5, 7], // Thu
    [5, 6, 4, 7, 8, 5, 6, 8, 7, 6, 8, 9, 8, 8], // Fri
    [1, 0, 2, 1, 0, 2, 1, 3, 2, 1, 0, 2, 1, 2], // Sat
    [0, 1, 0, 0, 1, 0, 1, 2, 1, 0, 1, 1, 0, 1], // Sun
  ];

  const getHeatmapColor = (val: number) => {
    if (val === 0) return 'bg-white/5 border border-white/5';
    if (val <= 2) return 'bg-cyan-500/25';
    if (val <= 5) return 'bg-cyan-500/50';
    if (val <= 7) return 'bg-cyan-400';
    return 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]';
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto select-none relative">
      {exportToast && (
        <div className="fixed top-20 right-8 z-50 bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-in fade-in slide-in-from-top-2">
          Analytics report exported successfully as CSV!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Analytics & Reports
          </h1>
          <p className="font-mono text-xs md:text-sm text-slate-400 mt-1">
            Sprint velocity, team bandwidth, and completion analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 backdrop-blur-md">
            {(['7D', '30D', 'Year'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completion Rate</span>
            <span className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 material-symbols-outlined text-[20px] border border-emerald-400/30">
              task_alt
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-white">{completionRate}%</span>
              <span className="font-mono text-xs text-emerald-400 flex items-center font-bold">
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span> +5.2%
              </span>
            </div>
            <p className="font-mono text-[11px] text-slate-400 mt-1">vs previous period</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Time per Task</span>
            <span className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 material-symbols-outlined text-[20px] border border-cyan-400/30">
              timer
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-white">2.4h</span>
              <span className="font-mono text-xs text-emerald-400 flex items-center font-bold">
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span> -18m
              </span>
            </div>
            <p className="font-mono text-[11px] text-slate-400 mt-1">12% faster resolution</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tasks Created</span>
            <span className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-300 material-symbols-outlined text-[20px] border border-amber-400/30">
              add_circle
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-white">{totalCount * 9 + 32}</span>
              <span className="font-mono text-xs text-cyan-400 flex items-center font-bold">
                +24 this month
              </span>
            </div>
            <p className="font-mono text-[11px] text-slate-400 mt-1">across all projects</p>
          </div>
        </div>
      </div>

      {/* Main Productivity Trend Graph */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Productivity Velocity</h3>
            <p className="font-mono text-xs text-slate-400">
              Cumulative completed tasks vs target velocity
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
              <span className="text-slate-300">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
              <span className="text-slate-300">Velocity Target</span>
            </div>
          </div>
        </div>

        {/* High-res SVG Chart */}
        <div className="h-64 w-full relative pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="analyticsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <line x1="0" y1="90" x2="800" y2="90" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <line x1="0" y1="140" x2="800" y2="140" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

            {/* Area */}
            <path
              d="M 0,160 Q 120,130 200,100 T 400,60 T 600,80 T 800,25 L 800,200 L 0,200 Z"
              fill="url(#analyticsGrad)"
            />

            {/* Primary Target Curve */}
            <path
              d="M 0,170 Q 150,140 300,110 T 600,60 T 800,45"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeOpacity="0.7"
            />

            {/* Main Completed Curve */}
            <path
              d="M 0,160 Q 120,130 200,100 T 400,60 T 600,80 T 800,25"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Data Dots */}
            <circle cx="200" cy="100" r="5" fill="#22d3ee" stroke="#05050a" strokeWidth="2" />
            <circle cx="400" cy="60" r="5" fill="#22d3ee" stroke="#05050a" strokeWidth="2" />
            <circle cx="600" cy="80" r="5" fill="#34d399" stroke="#05050a" strokeWidth="2" />
            <circle cx="800" cy="25" r="6" fill="#22d3ee" stroke="#ffffff" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-3 border-t border-white/10">
          <span>Week 1 (Oct 1-7)</span>
          <span>Week 2 (Oct 8-14)</span>
          <span>Week 3 (Oct 15-21)</span>
          <span>Week 4 (Oct 22-28)</span>
        </div>
      </div>

      {/* Two Columns: Priority Breakdown & Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Priority */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Tasks by Priority</h3>
            <span className="font-mono text-xs text-slate-400">Volume distribution</span>
          </div>

          <div className="space-y-4">
            {/* High */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-rose-400 font-semibold">High Priority</span>
                <span className="font-mono text-slate-300">{highPriorityCount} tasks (42%)</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-amber-300 font-semibold">Medium Priority</span>
                <span className="font-mono text-slate-300">{medPriorityCount} tasks (58%)</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '58%' }} />
              </div>
            </div>

            {/* Low */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-cyan-400 font-semibold">Low Priority</span>
                <span className="font-mono text-slate-300">{lowPriorityCount} tasks (22%)</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '22%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Activity Matrix</h3>
            <span className="font-mono text-xs text-cyan-400 font-bold">Active streak: 14 days</span>
          </div>

          {/* GitHub style heatmap grid */}
          <div className="space-y-1.5 pt-2">
            {heatmapData.map((row, rIdx) => {
              const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
              return (
                <div key={rIdx} className="flex items-center gap-2">
                  <span className="w-4 font-mono text-[10px] text-slate-400">{dayLabels[rIdx]}</span>
                  <div className="flex items-center gap-1.5 flex-1">
                    {row.map((val, cIdx) => (
                      <div
                        key={cIdx}
                        title={`${val} contributions`}
                        className={`h-3.5 flex-1 rounded-sm transition-transform hover:scale-125 cursor-pointer ${getHeatmapColor(
                          val
                        )}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/10">
            <span>Less</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/10"></span>
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/25"></span>
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/50"></span>
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span>
              <span className="w-2.5 h-2.5 rounded-sm bg-white"></span>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
