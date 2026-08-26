import { useEffect, useState } from 'react';
import { Search, LayoutDashboard, CheckSquare, FolderKanban, Calendar, BarChart3, Bell, Repeat, Settings, Bot, Plus } from 'lucide-react';
import type { View } from './AppShell';

interface Props {
  open: boolean;
  onClose: () => void;
  setView: (v: View) => void;
  onAskAi: () => void;
}

export default function CommandPalette({ open, onClose, setView, onAskAi }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  const commands = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, action: () => setView('dashboard') },
    { label: 'Go to Tasks', icon: CheckSquare, action: () => setView('tasks') },
    { label: 'Go to Projects', icon: FolderKanban, action: () => setView('projects') },
    { label: 'Go to Calendar', icon: Calendar, action: () => setView('calendar') },
    { label: 'Go to Analytics', icon: BarChart3, action: () => setView('analytics') },
    { label: 'Go to Automations', icon: Repeat, action: () => setView('automations') },
    { label: 'Go to Notifications', icon: Bell, action: () => setView('notifications') },
    { label: 'Go to Settings', icon: Settings, action: () => setView('settings') },
    { label: 'Ask SmartDude AI…', icon: Bot, action: onAskAi },
  ];

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-ink-900 rounded-2xl shadow-xl border border-ink-200 dark:border-ink-800 animate-scale-in overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-ink-200 dark:border-ink-800">
          <Search className="w-5 h-5 text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or ask SmartDude…"
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder-ink-400"
          />
          <kbd className="text-xs text-ink-400 bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-ink-400">No results</div>
          )}
          {filtered.map((c) => (
            <button key={c.label} onClick={() => { c.action(); onClose(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-sm text-left transition">
              <c.icon className="w-4.5 h-4.5 text-ink-500" />
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
