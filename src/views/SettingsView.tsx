import React, { useState, useEffect } from 'react';
import { CURRENT_USER, PERSONAL_CONTEXTS, WORKSPACE_CONTEXTS } from '../data/mockData';
import { ThemeMode, PersonalContext, WorkspaceContext, UserContextData } from '../types';
import { useAuth } from '../context/AuthContext';
import { contextEngineService } from '../services/contextEngineService';

interface SettingsViewProps {
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  personalContext?: PersonalContext;
  workspaceContext?: WorkspaceContext;
  onSetPersonalContext?: (ctx: PersonalContext) => void;
  onSetWorkspaceContext?: (ws: WorkspaceContext) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onSetTheme,
  personalContext = 'professional',
  workspaceContext = 'team',
  onSetPersonalContext,
  onSetWorkspaceContext,
}) => {
  const { currentUser, userProfile, logout, switchPersonalContext, switchWorkspace, createWorkspace, workspaces, activeWorkspace } = useAuth();

  const [activeTab, setActiveTab] = useState<'about' | 'context' | 'privacy' | 'workspaces' | 'profile' | 'appearance' | 'notifications'>('about');
  
  const [name, setName] = useState(userProfile?.displayName || CURRENT_USER.name);
  const [email, setEmail] = useState(userProfile?.email || CURRENT_USER.email);
  const [role, setRole] = useState(userProfile?.role || CURRENT_USER.role);
  const [timezone, setTimezone] = useState(userProfile?.timezone || CURRENT_USER.timezone);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // New Workspace form state
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [newWsType, setNewWsType] = useState<WorkspaceContext>('team');

  // Privacy and Context state
  const [userContext, setUserContext] = useState<UserContextData | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      contextEngineService.getUserContext(currentUser.uid).then(setUserContext);
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveToast('Profile settings saved to Firestore!');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      await createWorkspace(newWsName, newWsDesc, newWsType);
      setIsCreatingWs(false);
      setNewWsName('');
      setNewWsDesc('');
      setSaveToast('Workspace created successfully!');
      setTimeout(() => setSaveToast(null), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace');
    }
  };

  const handleTogglePrivacyPref = async (key: keyof UserContextData['privacyPreferences']) => {
    if (!currentUser || !userContext) return;
    const updated = {
      ...userContext.privacyPreferences,
      [key]: !userContext.privacyPreferences[key],
    };
    setUserContext({
      ...userContext,
      privacyPreferences: updated,
    });
    await contextEngineService.updatePrivacyPreferences(currentUser.uid, {
      [key]: updated[key],
    });
    setSaveToast('Privacy preference updated.');
    setTimeout(() => setSaveToast(null), 2000);
  };

  const handleResetPersonalization = async () => {
    if (!currentUser) return;
    if (confirm('Are you sure you want to reset derived productivity signals and AI context?')) {
      await contextEngineService.resetPersonalization(currentUser.uid);
      const fresh = await contextEngineService.getUserContext(currentUser.uid);
      setUserContext(fresh);
      setSaveToast('SmartDude personalization signals reset.');
      setTimeout(() => setSaveToast(null), 2500);
    }
  };

  const handleExportData = async () => {
    if (!currentUser) return;
    setExportLoading(true);
    try {
      const data = await contextEngineService.exportUserData(currentUser.uid);
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `smartdude_data_export_${currentUser.uid.slice(0, 6)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setSaveToast('Data exported successfully!');
      setTimeout(() => setSaveToast(null), 2500);
    } catch (err: any) {
      alert('Error exporting data: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    if (confirm('CRITICAL: This will permanently delete your account, private tasks, and context. Proceed?')) {
      await contextEngineService.deleteUserData(currentUser.uid);
      await logout();
    }
  };

  const capabilities = [
    { name: 'Personal Task Management', icon: 'check_circle', desc: 'Real-time task triage, subtasks, checklists, and priority tagging.' },
    { name: 'Intelligent Planning', icon: 'calendar_month', desc: 'Predictive sprint workload balancing and milestone roadmapping.' },
    { name: 'Smart Scheduling', icon: 'schedule', desc: 'Time-blocked focus sessions, deadline proximity alerts, and calendar sync.' },
    { name: 'Adaptive Goals', icon: 'flag', desc: 'Outcome-driven goal tracking and milestone completion progress.' },
    { name: 'Daily & Weekly Routines', icon: 'autorenew', desc: '1-click adaptive routines customized to your active persona.' },
    { name: 'Active Project Portfolios', icon: 'folder_special', desc: 'Multi-stream initiative management with real-time velocity metrics.' },
    { name: 'Productivity Insights', icon: 'insights', desc: 'Deep analytics, completed vs target velocity, and focus flow trends.' },
    { name: 'Context-Aware Assistance', icon: 'psychology', desc: 'Adaptive intelligence calibrated for Student, Professional, Homemaker, Freelancer, and Entrepreneur.' },
    { name: 'Real-Time Collaboration', icon: 'groups', desc: 'Multiplayer presence, live cursors, assignees, and comment threads.' },
    { name: 'Workspace Management', icon: 'workspaces', desc: 'Seamlessly switch between Personal, Team, Family, Client, and Organization spaces.' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto select-none relative">
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check</span>
          {saveToast}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-mono font-bold tracking-wider uppercase border border-cyan-400/30">
            System & Companion
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Settings & Preferences
        </h1>
        <p className="font-mono text-xs md:text-sm text-slate-400 mt-1">
          Manage your SmartDude companion persona, workspaces, privacy controls, and data storage
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'about', label: 'About SmartDude' },
          { id: 'context', label: 'Adaptive Context' },
          { id: 'workspaces', label: 'Workspaces' },
          { id: 'privacy', label: 'Privacy & Data Controls' },
          { id: 'profile', label: 'Profile' },
          { id: 'appearance', label: 'Appearance' },
          { id: 'notifications', label: 'Notifications' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: About SmartDude */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-cyan-400/20 bg-gradient-to-br from-cyan-950/40 via-slate-950/70 to-indigo-950/40 relative overflow-hidden backdrop-blur-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.45)] shrink-0">
                  <span className="material-symbols-outlined text-[36px] font-extrabold">smart_toy</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                    SMARTDUDE
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-bold border border-cyan-400/30">
                      v2.4 Companion
                    </span>
                  </h2>
                  <p className="text-sm font-semibold text-cyan-300 uppercase tracking-widest font-mono mt-0.5">
                    AI COMPANION
                  </p>
                  <p className="text-xs md:text-sm text-slate-300 italic mt-2">
                    &ldquo;Your AI companion for everything you need to get done.&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end gap-2 text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-mono font-bold border border-emerald-400/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Cloud Firestore Active
                </span>
                <span className="text-[11px] font-mono text-slate-400">Authenticated UID: {currentUser?.uid.slice(0, 8) || 'Active'}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                SmartDude is an adaptive AI companion designed to understand your personal and workspace context. With persistent Firestore cloud storage, your tasks, active projects, custom routines, calendar events, and privacy preferences synchronize seamlessly across devices.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-cyan-400">checklist</span>
              Companion Capabilities Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {capabilities.map((cap, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-colors backdrop-blur-md flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-400/30">
                    <span className="material-symbols-outlined text-[18px]">{cap.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{cap.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Workspaces */}
      {activeTab === 'workspaces' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Your Workspaces</h3>
              <p className="font-mono text-xs text-slate-400">
                Workspaces isolate collaboration, project portfolios, and team members.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingWs(!isCreatingWs)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Create Workspace
            </button>
          </div>

          {isCreatingWs && (
            <form onSubmit={handleCreateWorkspace} className="glass-card rounded-3xl p-6 border border-cyan-400/30 bg-cyan-950/20 space-y-4 animate-in fade-in">
              <h4 className="text-sm font-bold text-white">Create New Workspace</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Workspace Name</label>
                  <input
                    type="text"
                    required
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    placeholder="e.g. University Capstone, Client Corp, Family Hub"
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Workspace Type</label>
                  <select
                    value={newWsType}
                    onChange={(e) => setNewWsType(e.target.value as WorkspaceContext)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="personal">Personal Space</option>
                    <option value="team">Team Workspace</option>
                    <option value="family">Family Hub</option>
                    <option value="client_project">Client / Project</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="Focus areas and collaboration guidelines"
                  className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingWs(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Create & Switch
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((ws) => {
              const isActive = activeWorkspace?.id === ws.id;
              return (
                <div
                  key={ws.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-cyan-400">workspaces</span>
                        <h4 className="text-sm font-bold text-white">{ws.name}</h4>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-400 text-slate-950">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{ws.description || 'Collaborative workspace space.'}</p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>Type: <strong className="text-slate-200 capitalize">{ws.type}</strong></span>
                      <span>Members: <strong className="text-slate-200">{ws.memberIds?.length || 1}</strong></span>
                    </div>
                  </div>

                  {!isActive && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                      <button
                        onClick={() => switchWorkspace(ws.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Switch to Workspace
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Privacy & Data Controls */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* AI Context Signals Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400">psychology</span>
                  SmartDude Context Engine & Privacy Signals
                </h3>
                <p className="font-mono text-xs text-slate-400 mt-0.5">
                  Derived, non-sensitive productivity signals calculated from explicit application activity.
                </p>
              </div>
              <button
                onClick={handleResetPersonalization}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-rose-500/20 text-rose-300 hover:border-rose-400 border border-transparent rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset AI Context
              </button>
            </div>

            {userContext && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Completion Rate</span>
                  <p className="text-lg font-bold text-emerald-400">{userContext.completionRate}%</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Workload Level</span>
                  <p className="text-lg font-bold text-cyan-300 capitalize">{userContext.workloadLevel}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Productivity Period</span>
                  <p className="text-lg font-bold text-indigo-300 capitalize">{userContext.preferredProductivityPeriods[0] || 'Morning'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Rescheduling Rate</span>
                  <p className="text-lg font-bold text-slate-200">{userContext.reschedulingRate}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Toggles */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">AI Personalization Permissions</h3>
            <div className="divide-y divide-white/10">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Learn from Task Activity</h4>
                  <p className="text-[11px] text-slate-400">Allow SmartDude to adapt sprint velocity and routine suggestions based on completed tasks</p>
                </div>
                <input
                  type="checkbox"
                  checked={userContext?.privacyPreferences?.allowLearnFromTasks ?? true}
                  onChange={() => handleTogglePrivacyPref('allowLearnFromTasks')}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Calendar Context Integration</h4>
                  <p className="text-[11px] text-slate-400">Include upcoming meetings and exams in daily morning summaries</p>
                </div>
                <input
                  type="checkbox"
                  checked={userContext?.privacyPreferences?.allowCalendarContext ?? true}
                  onChange={() => handleTogglePrivacyPref('allowCalendarContext')}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Productivity Patterns</h4>
                  <p className="text-[11px] text-slate-400">Identify focus blocks and optimal working hours</p>
                </div>
                <input
                  type="checkbox"
                  checked={userContext?.privacyPreferences?.allowProductivityPatterns ?? true}
                  onChange={() => handleTogglePrivacyPref('allowProductivityPatterns')}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Data Export & Account Deletion */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">Your Data & Ownership</h3>
            <p className="text-xs text-slate-300">
              SmartDude guarantees user data portability. You can export all your persistent tasks, projects, routines, and activity events at any time.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportData}
                disabled={exportLoading}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                {exportLoading ? 'Exporting...' : 'Export My Data (JSON)'}
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2 border border-rose-500/30 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                Delete Account & Private Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Adaptive Context Switcher */}
      {activeTab === 'context' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Personal Context Calibration</h3>
              <p className="font-mono text-xs text-slate-400 mt-0.5">
                Select how SmartDude should adapt its guidance, tips, and daily routines
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {PERSONAL_CONTEXTS.map((ctx) => {
                const isSelected = (userProfile?.profileType || personalContext) === ctx.id;
                return (
                  <div
                    key={ctx.id}
                    onClick={() => {
                      switchPersonalContext(ctx.id as PersonalContext);
                      if (onSetPersonalContext) onSetPersonalContext(ctx.id as PersonalContext);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between backdrop-blur-md ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'border-white/10 bg-white/5 hover:border-cyan-400/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="material-symbols-outlined text-[24px] text-cyan-400">{ctx.icon}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-400 text-slate-950">
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white">{ctx.label}</h4>
                      <span className="font-mono text-[10px] text-cyan-300 block mb-1">{ctx.badge}</span>
                      <p className="text-[11px] text-slate-400 leading-snug">{ctx.tagline}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={userProfile?.photoURL || CURRENT_USER.avatar}
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#05050a] shadow-[0_0_6px_#34d399]"></span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">{name}</h3>
                <p className="font-mono text-xs text-slate-400">{role} &bull; <span className="text-emerald-400">Authenticated (Firestore)</span></p>
                <span className="text-[10px] font-mono text-cyan-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 inline-block">
                  UID: {currentUser?.uid || 'chris-local'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified
                </span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#0d0d18] border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-white outline-none cursor-pointer"
              >
                <option value="Coordinated Universal Time (UTC)">Coordinated Universal Time (UTC)</option>
                <option value="Pacific Time (US & Canada)">Pacific Time (US & Canada) - PT</option>
                <option value="Eastern Time (US & Canada)">Eastern Time (US & Canada) - ET</option>
                <option value="India Standard Time (IST)">India Standard Time (IST) - +5:30</option>
                <option value="Central European Time (CET)">Central European Time (CET) - +1:00</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* Tab: Appearance */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Theme Preference</h3>
              <p className="font-mono text-xs text-slate-400 mt-0.5">
                Frosted Glass Dark Mode is the active signature aesthetic
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => onSetTheme('dark')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 backdrop-blur-md ${
                  theme === 'dark'
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'border-white/10 bg-white/5 hover:border-cyan-400/40'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">dark_mode</span>
                </div>
                <div className="text-center">
                  <h4 className="text-xs font-bold text-white">Frosted Glass Dark</h4>
                  <span className="font-mono text-[10px] text-cyan-400 font-semibold">Default & Recommended</span>
                </div>
              </div>

              <div
                onClick={() => onSetTheme('light')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 backdrop-blur-md ${
                  theme === 'light'
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'border-white/10 bg-white/5 hover:border-cyan-400/40'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-slate-900">
                  <span className="material-symbols-outlined text-[24px]">light_mode</span>
                </div>
                <div className="text-center">
                  <h4 className="text-xs font-bold text-white">Light Theme</h4>
                  <span className="font-mono text-[10px] text-slate-400">High-contrast day mode</span>
                </div>
              </div>

              <div
                onClick={() => onSetTheme('system')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 backdrop-blur-md ${
                  theme === 'system'
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'border-white/10 bg-white/5 hover:border-cyan-400/40'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[24px]">devices</span>
                </div>
                <div className="text-center">
                  <h4 className="text-xs font-bold text-white">System Auto</h4>
                  <span className="font-mono text-[10px] text-slate-400">Follow OS settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Notifications Preferences */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">Email & Push Alerts</h3>
            <div className="divide-y divide-white/10">
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">SmartDude Adaptive Insights</h4>
                  <p className="font-mono text-[11px] text-slate-400">Proactive morning focus summaries and routine triggers</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-400 cursor-pointer" />
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Task Assignments</h4>
                  <p className="font-mono text-[11px] text-slate-400">Receive alerts when someone assigns you to a task</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-400 cursor-pointer" />
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Deadline Reminders</h4>
                  <p className="font-mono text-[11px] text-slate-400">24h and 2h alerts before upcoming deadlines</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-400 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
