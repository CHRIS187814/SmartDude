import { useEffect, useState, type ReactNode } from 'react';
import {
  Sparkles, LayoutDashboard, CheckSquare, FolderKanban, Calendar, BarChart3,
  Bell, Repeat, Bot, Settings, Search, Menu, X, Sun, Moon, LogOut, Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { cn, initials } from '@/lib/utils';
import CommandPalette from './CommandPalette';
import AiCompanion from './AiCompanion';

export type View = 'dashboard' | 'tasks' | 'projects' | 'calendar' | 'analytics' | 'notifications' | 'automations' | 'settings';

interface AppShellProps {
  view: View;
  setView: (v: View) => void;
  children: ReactNode;
}

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'automations', label: 'Automations', icon: Repeat },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function AppShell({ view, setView, children }: AppShellProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { workspaces, activeWorkspace, setActiveWorkspaceId } = useWorkspace();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const { profile: _p } = { profile };
    void _p;
    const channel = supabase
      .channel('unread-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadCount(count ?? 0);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [view]);

  const handleNav = (v: View) => {
    setView(v);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 z-30">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-ink-200 dark:border-ink-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold tracking-tight">SmartDude</span>
        </div>

        {/* Workspace selector */}
        <div className="px-3 py-3 border-b border-ink-200 dark:border-ink-800">
          <select
            value={activeWorkspace?.id ?? ''}
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            className="input text-sm py-2 cursor-pointer"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn('sidebar-item w-full', view === item.id && 'sidebar-item-active')}
            >
              <item.icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto badge bg-error-500 text-white">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-ink-200 dark:border-ink-800 space-y-1">
          <button onClick={() => setAiOpen(true)} className="sidebar-item w-full text-primary-600 dark:text-primary-400">
            <Bot className="w-4.5 h-4.5" />
            <span>Ask SmartDude</span>
          </button>
          <button onClick={() => handleNav('settings')} className={cn('sidebar-item w-full', view === 'settings' && 'sidebar-item-active')}>
            <Settings className="w-4.5 h-4.5" />
            <span>Settings</span>
          </button>
          <button onClick={signOut} className="sidebar-item w-full">
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800">
        <button onClick={() => setMobileNavOpen(true)} className="btn-ghost p-2 -ml-2"><Menu className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight">SmartDude</span>
        </div>
        <button onClick={() => setAiOpen(true)} className="btn-ghost p-2 -mr-2 text-primary-600 dark:text-primary-400"><Bot className="w-5 h-5" /></button>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-ink-900 shadow-xl animate-slide-in-right flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-ink-200 dark:border-ink-800">
              <span className="font-bold">Menu</span>
              <button onClick={() => setMobileNavOpen(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-3 py-3 border-b border-ink-200 dark:border-ink-800">
              <select value={activeWorkspace?.id ?? ''} onChange={(e) => setActiveWorkspaceId(e.target.value)} className="input text-sm py-2">
                {workspaces.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => handleNav(item.id)} className={cn('sidebar-item w-full', view === item.id && 'sidebar-item-active')}>
                  <item.icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 && <span className="ml-auto badge bg-error-500 text-white">{unreadCount}</span>}
                </button>
              ))}
            </nav>
            <div className="px-3 py-3 border-t border-ink-200 dark:border-ink-800 space-y-1">
              <button onClick={() => { setAiOpen(true); setMobileNavOpen(false); }} className="sidebar-item w-full text-primary-600 dark:text-primary-400">
                <Bot className="w-4.5 h-4.5" /> <span>Ask SmartDude</span>
              </button>
              <button onClick={() => handleNav('settings')} className={cn('sidebar-item w-full', view === 'settings' && 'sidebar-item-active')}>
                <Settings className="w-4.5 h-4.5" /> <span>Settings</span>
              </button>
              <button onClick={signOut} className="sidebar-item w-full"><LogOut className="w-4.5 h-4.5" /> <span>Sign out</span></button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Desktop top bar */}
        <header className="hidden lg:flex sticky top-0 z-20 h-16 items-center justify-between px-6 bg-white/80 dark:bg-ink-900/80 backdrop-blur-lg border-b border-ink-200 dark:border-ink-800">
          <button onClick={() => setPaletteOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-ink-200 dark:border-ink-700 text-sm text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition w-80">
            <Search className="w-4 h-4" />
            <span>Search or ask SmartDude…</span>
            <kbd className="ml-auto text-xs bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setAiOpen(true)} className="btn-primary text-sm">
              <Bot className="w-4 h-4" /> Ask SmartDude
            </button>
            <button onClick={toggleTheme} className="btn-ghost p-2.5">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-semibold">
              {initials(profile?.full_name)}
            </div>
          </div>
        </header>

        {/* Mobile search */}
        <div className="lg:hidden p-3 border-b border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900">
          <button onClick={() => setPaletteOpen(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 text-sm text-ink-400 w-full">
            <Search className="w-4 h-4" /> Search or ask SmartDude…
          </button>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-ink-900 border-t border-ink-200 dark:border-ink-800 flex items-center justify-around px-2 h-16">
        {navItems.slice(0, 4).map((item) => (
          <button key={item.id} onClick={() => handleNav(item.id)} className={cn('flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs', view === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-ink-400')}>
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
        <button onClick={() => setAiOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-primary-600 dark:text-primary-400">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center -mt-3 shadow-lg shadow-primary-500/30">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px]">Ask AI</span>
        </button>
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} setView={setView} onAskAi={() => { setPaletteOpen(false); setAiOpen(true); }} />
      <AiCompanion open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
