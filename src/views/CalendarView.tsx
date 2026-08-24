import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onSelectTask,
  onOpenNewTask,
}) => {
  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const [selectedDay, setSelectedDay] = useState(24);

  // Generate calendar grid for October (31 days, starting on Thursday = index 3)
  const daysInMonth = 31;
  const startDayOffset = 3; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu...
  const calendarCells = [];

  // Previous month padding
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ day: 28 + i, currentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ day: i, currentMonth: true });
  }
  // Next month padding to fill 35 or 42 cells
  const remaining = 35 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({ day: i, currentMonth: false });
  }

  // Get tasks for selected day
  const getTasksForDay = (day: number) => {
    if (day === 24) {
      return tasks.filter((t) => t.isToday || t.dueLabel?.includes('Today') || t.dueDate.endsWith('-24'));
    }
    if (day === 25) {
      return tasks.filter((t) => t.dueLabel?.includes('Tomorrow') || t.dueDate.endsWith('-25'));
    }
    if (day === 12) {
      return tasks.filter((t) => t.dueDate.endsWith('-12'));
    }
    if (day === 10) {
      return tasks.filter((t) => t.dueDate.endsWith('-10'));
    }
    if (day === 26) {
      return tasks.filter((t) => t.dueDate.endsWith('-26'));
    }
    if (day === 27) {
      return tasks.filter((t) => t.dueDate.endsWith('-27'));
    }
    return [];
  };

  const selectedDayTasks = getTasksForDay(selectedDay);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Calendar Schedule
          </h1>
          <p className="font-mono text-xs md:text-sm text-slate-400 mt-1">
            Deadlines, sprint milestones, and meetings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1 backdrop-blur-md">
            <button
              onClick={() => setCurrentMonth('September 2026')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-3 font-bold text-xs text-white">{currentMonth}</span>
            <button
              onClick={() => setCurrentMonth('November 2026')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Calendar on Left + Selected Day Schedule on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on desktop) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center font-mono text-xs text-slate-400 py-2 border-b border-white/10">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {calendarCells.map((cell, idx) => {
              const dayTasks = cell.currentMonth ? getTasksForDay(cell.day) : [];
              const isToday = cell.currentMonth && cell.day === 24;
              const isSelected = cell.currentMonth && cell.day === selectedDay;

              return (
                <div
                  key={idx}
                  onClick={() => cell.currentMonth && setSelectedDay(cell.day)}
                  className={`min-h-[80px] md:min-h-[95px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer backdrop-blur-md ${
                    !cell.currentMonth
                      ? 'opacity-20 border-transparent'
                      : isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                      : isToday
                      ? 'bg-white/10 border-cyan-400/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_8px_#22d3ee]'
                          : isSelected
                          ? 'text-cyan-300 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
                    )}
                  </div>

                  {/* Task Chips in calendar cell */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(t);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] truncate font-semibold backdrop-blur-md ${
                          t.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                            : t.priority === 'Med'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] font-mono text-slate-400 block">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedDay === 24 ? 'Today' : `October ${selectedDay}`} Agenda
                </h3>
                <p className="font-mono text-xs text-slate-400">
                  {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task scheduled' : 'tasks scheduled'}
                </p>
              </div>
              <button
                onClick={onOpenNewTask}
                className="p-2 rounded-xl bg-white/5 text-cyan-400 hover:bg-white/10 transition-colors border border-white/10"
                title="Add task for this date"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>

            {selectedDayTasks.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">event_available</span>
                <p>No deadlines scheduled for October {selectedDay}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-colors cursor-pointer space-y-2 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-white/10 text-cyan-400 border border-cyan-400/30">
                        {t.project}
                      </span>
                      <span className="font-mono text-[11px] text-amber-300 font-semibold">
                        {t.timeString || 'All Day'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{t.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
