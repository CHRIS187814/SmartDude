import React, { useState, useEffect } from 'react';
import { ViewMode, Task, Project, NotificationItem, ThemeMode, TaskStatus, PersonalContext, WorkspaceContext } from './types';
import { INITIAL_TASKS, INITIAL_PROJECTS, INITIAL_NOTIFICATIONS } from './data/mockData';
import { useAuth } from './context/AuthContext';
import { taskService } from './services/taskService';
import { projectService } from './services/projectService';
import { notificationService } from './services/notificationService';
import { contextEngineService } from './services/contextEngineService';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { CommandPalette } from './components/CommandPalette';
import { NewTaskModal } from './components/NewTaskModal';
import { NewProjectModal } from './components/NewProjectModal';
import { AuthModal } from './components/AuthModal';
import { OverviewView } from './views/OverviewView';
import { MyTasksView } from './views/MyTasksView';
import { TaskDetailView } from './views/TaskDetailView';
import { ProjectsView } from './views/ProjectsView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';

export function App() {
  const { currentUser, userProfile, activeWorkspace } = useAuth();

  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(INITIAL_TASKS[0]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [personalContext, setPersonalContext] = useState<PersonalContext>('professional');
  const [workspaceContext, setWorkspaceContext] = useState<WorkspaceContext>('team');

  // Real-time Firestore Subscriptions for Active Workspace
  useEffect(() => {
    if (!activeWorkspace) return;

    // Subscribe to tasks
    const unsubTasks = taskService.subscribeTasks(activeWorkspace.id, (liveTasks) => {
      if (liveTasks.length > 0) {
        setTasks(liveTasks);
        if (selectedTask) {
          const matching = liveTasks.find((t) => t.id === selectedTask.id);
          if (matching) setSelectedTask(matching);
        }
      }
    });

    // Subscribe to projects
    const unsubProjects = projectService.subscribeProjects(activeWorkspace.id, (liveProjects) => {
      if (liveProjects.length > 0) {
        setProjects(liveProjects);
      }
    });

    return () => {
      unsubTasks();
      unsubProjects();
    };
  }, [activeWorkspace?.id]);

  // Real-time Notifications Subscription for Authenticated User
  useEffect(() => {
    if (!currentUser) return;
    const unsubNotifs = notificationService.subscribeNotifications(currentUser.uid, (liveNotifs) => {
      if (liveNotifs.length > 0) {
        setNotifications(liveNotifs);
      }
    });
    return () => unsubNotifs();
  }, [currentUser?.uid]);

  // Sync personal context with user profile
  useEffect(() => {
    if (userProfile?.profileType) {
      setPersonalContext(userProfile.profileType);
    }
  }, [userProfile?.profileType]);

  // Recalculate context engine signals when tasks update
  useEffect(() => {
    if (currentUser && tasks.length > 0) {
      contextEngineService.recalculateContext(currentUser.uid, tasks);
    }
  }, [currentUser?.uid, tasks.length]);

  // Handle Theme switching
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // ⌘N or Ctrl+N for New Task
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewTaskModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Task Actions (Synced with Persistent Firestore)
  const handleCreateTask = async (newTaskPartial: Partial<Task>) => {
    const wsId = activeWorkspace?.id || `ws-personal-${currentUser?.uid || 'local'}`;
    const uid = currentUser?.uid || 'guest-user';

    const newTaskData: Omit<Task, 'id' | 'createdAt'> = {
      title: newTaskPartial.title || 'Untitled Task',
      description: newTaskPartial.description || '',
      project: newTaskPartial.project || 'General',
      priority: newTaskPartial.priority || 'Med',
      status: newTaskPartial.status || 'todo',
      dueDate: newTaskPartial.dueDate || new Date().toISOString().split('T')[0],
      dueLabel: newTaskPartial.dueLabel || 'Today',
      timeString: newTaskPartial.timeString || '5:00 PM',
      assignees: newTaskPartial.assignees || [],
      subtasks: newTaskPartial.subtasks || [],
      tags: newTaskPartial.tags || [],
      comments: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          text: 'created this task',
          user: userProfile?.displayName || 'You',
          time: 'Just now',
          type: 'create',
        },
      ],
      viewers: [],
      workspaceId: wsId,
      profileContext: personalContext,
    };

    if (currentUser) {
      try {
        const created = await taskService.createTask(newTaskData, uid);
        setSelectedTask(created);
        return;
      } catch (err) {
        console.error('Failed to create task in Firestore, saving to state:', err);
      }
    }

    // Local state fallback
    const localTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks([localTask, ...tasks]);
    setSelectedTask(localTask);
  };

  const handleAddRoutineTask = async (routineName: string) => {
    const wsId = activeWorkspace?.id || `ws-personal-${currentUser?.uid || 'local'}`;
    const uid = currentUser?.uid || 'guest-user';

    const routineTaskData: Omit<Task, 'id' | 'createdAt'> = {
      title: routineName,
      description: `SmartDude Adaptive AI Routine automatically added for ${personalContext} persona.`,
      project: 'Routines & Focus',
      priority: 'High',
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      dueLabel: 'Today',
      timeString: '9:00 AM',
      assignees: [
        {
          name: userProfile?.displayName || 'Chris Evans',
          avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        },
      ],
      subtasks: [
        { id: `sub-${Date.now()}-1`, title: 'Prepare focus environment', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Execute key milestone', completed: false },
        { id: `sub-${Date.now()}-3`, title: 'Log review in SmartDude', completed: false },
      ],
      tags: ['AI-Routine', personalContext, 'Focus'],
      comments: [],
      activity: [
        {
          id: `act-rt-${Date.now()}`,
          text: 'SmartDude AI Companion triggered adaptive routine',
          user: 'SmartDude AI',
          time: 'Just now',
          type: 'create',
        },
      ],
      viewers: [],
      workspaceId: wsId,
      profileContext: personalContext,
    };

    if (currentUser) {
      try {
        await taskService.createTask(routineTaskData, uid);
        return;
      } catch (err) {
        console.error('Failed to create routine task in Firestore:', err);
      }
    }

    const localTask: Task = {
      ...routineTaskData,
      id: `task-routine-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks([localTask, ...tasks]);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (currentUser) {
      try {
        await taskService.updateTask(updatedTask.id, updatedTask, currentUser.uid);
      } catch (err) {
        console.error('Failed to update task in Firestore:', err);
      }
    }

    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleToggleTaskComplete = async (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (target && currentUser) {
      try {
        await taskService.toggleComplete(target, currentUser.uid);
      } catch (err) {
        console.error('Failed to toggle completion in Firestore:', err);
      }
    }

    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const newStatus: TaskStatus = t.status === 'done' ? 'todo' : 'done';
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setCurrentView('task_detail');
  };

  const handleSelectTaskById = (taskId: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (found) {
      handleSelectTask(found);
    } else {
      setCurrentView('tasks');
    }
  };

  // Project Actions
  const handleCreateProject = async (newProjectPartial: Project) => {
    const wsId = activeWorkspace?.id || `ws-personal-${currentUser?.uid || 'local'}`;
    const uid = currentUser?.uid || 'guest-user';

    if (currentUser) {
      try {
        const created = await projectService.createProject(
          { ...newProjectPartial, workspaceId: wsId },
          uid
        );
        setProjects([created, ...projects]);
        return;
      } catch (err) {
        console.error('Failed to create project in Firestore:', err);
      }
    }

    setProjects([newProjectPartial, ...projects]);
  };

  // Notification Actions
  const handleMarkAllNotificationsRead = async () => {
    if (currentUser) {
      try {
        await notificationService.markAllAsRead(currentUser.uid);
      } catch (err) {
        console.error('Failed to mark notifications read in Firestore:', err);
      }
    }
    setNotifications(notifications.map((n) => ({ ...n, isUnread: false })));
  };

  const handleToggleNotificationRead = async (id: string) => {
    if (currentUser) {
      try {
        await notificationService.markAsRead(id);
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isUnread: !n.isUnread } : n))
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => n.isUnread).length;
  const favoritesCount = tasks.filter((t) => t.isFavorite).length;

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-200 flex relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Frosted Glass Glowing Ambient Blur Backdrops */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-5%] right-[5%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[20%] left-[10%] w-[30vw] h-[30vw] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Primary Sidebar (Desktop) */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'favorites') {
            setCurrentView('tasks');
          } else {
            setCurrentView(view);
          }
        }}
        onOpenNewTask={() => setIsNewTaskModalOpen(true)}
        favoritesCount={favoritesCount}
        personalContext={personalContext}
        workspaceContext={workspaceContext}
        onSetPersonalContext={(ctx) => setPersonalContext(ctx)}
        onSetWorkspaceContext={(ws) => setWorkspaceContext(ws)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-[240px] pb-16 md:pb-0 z-10">
        {/* Top Bar */}
        <TopBar
          currentView={currentView}
          selectedTask={selectedTask}
          onNavigate={(view) => setCurrentView(view)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNewTask={() => setIsNewTaskModalOpen(true)}
          unreadCount={unreadNotificationsCount}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          isDarkMode={theme === 'dark'}
          personalContext={personalContext}
          workspaceContext={workspaceContext}
          onSetPersonalContext={(ctx) => setPersonalContext(ctx)}
          onSetWorkspaceContext={(ws) => setWorkspaceContext(ws)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* View Switcher */}
        <main className="flex-1 overflow-x-hidden">
          {currentView === 'overview' && (
            <OverviewView
              tasks={tasks}
              projects={projects}
              onSelectTask={handleSelectTask}
              onToggleTaskComplete={handleToggleTaskComplete}
              onNavigate={(view) => setCurrentView(view)}
              onOpenNewTask={() => setIsNewTaskModalOpen(true)}
              personalContext={personalContext}
              workspaceContext={workspaceContext}
              onSetPersonalContext={(ctx) => setPersonalContext(ctx)}
              onSetWorkspaceContext={(ws) => setWorkspaceContext(ws)}
              onAddRoutineTask={handleAddRoutineTask}
            />
          )}

          {currentView === 'tasks' && (
            <MyTasksView
              tasks={tasks}
              onSelectTask={handleSelectTask}
              onToggleTaskComplete={handleToggleTaskComplete}
              onOpenNewTask={() => setIsNewTaskModalOpen(true)}
            />
          )}

          {currentView === 'task_detail' && selectedTask && (
            <TaskDetailView
              task={selectedTask}
              onBack={() => setCurrentView('tasks')}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              onOpenNewProject={() => setIsNewProjectModalOpen(true)}
              onNavigateToTasksWithProject={(_projectName) => {
                setCurrentView('tasks');
              }}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onSelectTask={handleSelectTask}
              onOpenNewTask={() => setIsNewTaskModalOpen(true)}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView tasks={tasks} projects={projects} />
          )}

          {currentView === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onToggleNotificationRead={handleToggleNotificationRead}
              onSelectTaskById={handleSelectTaskById}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              theme={theme}
              onSetTheme={(t) => setTheme(t)}
              personalContext={personalContext}
              workspaceContext={workspaceContext}
              onSetPersonalContext={(ctx) => setPersonalContext(ctx)}
              onSetWorkspaceContext={(ws) => setWorkspaceContext(ws)}
            />
          )}

          {currentView === 'recent' && (
            <MyTasksView
              tasks={tasks}
              onSelectTask={handleSelectTask}
              onToggleTaskComplete={handleToggleTaskComplete}
              onOpenNewTask={() => setIsNewTaskModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenNewTask={() => setIsNewTaskModalOpen(true)}
        unreadCount={unreadNotificationsCount}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(view) => setCurrentView(view)}
        onSelectTask={handleSelectTask}
        onOpenNewTask={() => setIsNewTaskModalOpen(true)}
        tasks={tasks}
        projects={projects}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onSetPersonalContext={(ctx) => setPersonalContext(ctx)}
        onSetWorkspaceContext={(ws) => setWorkspaceContext(ws)}
      />

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
