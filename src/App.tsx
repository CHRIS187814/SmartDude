import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import Landing from '@/components/Landing';
import Onboarding from '@/components/Onboarding';
import AppShell, { type View } from '@/components/AppShell';
import Dashboard from '@/views/Dashboard';
import Tasks from '@/views/Tasks';
import Projects from '@/views/Projects';
import Calendar from '@/views/Calendar';
import Analytics from '@/views/Analytics';
import Notifications from '@/views/Notifications';
import Automations from '@/views/Automations';
import Settings from '@/views/Settings';
import Spinner from '@/components/ui/Spinner';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [view, setView] = useState<View>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950">
        <Spinner className="w-8 h-8 text-primary-500" />
      </div>
    );
  }

  if (!user) return <Landing />;
  if (user && !profile?.onboarding_completed) return <Onboarding />;

  return (
    <AppShell view={view} setView={setView}>
      {view === 'dashboard' && <Dashboard setView={setView} />}
      {view === 'tasks' && <Tasks />}
      {view === 'projects' && <Projects />}
      {view === 'calendar' && <Calendar />}
      {view === 'analytics' && <Analytics />}
      {view === 'notifications' && <Notifications />}
      {view === 'automations' && <Automations />}
      {view === 'settings' && <Settings />}
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <AppContent />
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
