import { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, Briefcase, GraduationCap, User, Folder } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';

const roles = ['Student', 'Professional', 'Freelancer', 'Researcher', 'Creator', 'Other'];
const focusAreas = ['Deep work', 'Deadlines', 'Routines', 'Focus plans', 'Recurring tasks', 'Reminders'];

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const { refresh: refreshWorkspaces } = useWorkspace();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Student');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [focus, setFocus] = useState<string[]>([]);
  const [workspaceName, setWorkspaceName] = useState('Personal');
  const [workspaceType, setWorkspaceType] = useState<'personal' | 'work' | 'study'>('personal');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFocus = (f: string) => {
    setFocus((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const finish = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await supabase.from('profiles').update({
        full_name: fullName || user.email,
        role,
        timezone,
        personal_context: { focus_areas: focus },
        onboarding_completed: true,
      }).eq('id', user.id);

      await supabase.from('workspaces').insert({
        user_id: user.id,
        name: workspaceName,
        context_type: workspaceType,
        workspace_context: { type: workspaceType },
      });

      await refreshProfile();
      await refreshWorkspaces();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(false);
    }
  };

  const steps = [
    {
      title: 'Welcome to SmartDude',
      subtitle: 'Let’s set up your profile so SmartDude can understand your context.',
      content: (
        <div className="space-y-4">
          <div>
            <label className="label">What should SmartDude call you?</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Your role</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button key={r} onClick={() => setRole(r)} className={`chip justify-center border ${role === r ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Your timezone & focus',
      subtitle: 'SmartDude uses your timezone for accurate reminders and schedules.',
      content: (
        <div className="space-y-4">
          <div>
            <label className="label">Timezone</label>
            <input className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            <p className="text-xs text-ink-400 mt-1">Detected automatically. You can change it later.</p>
          </div>
          <div>
            <label className="label">What do you want SmartDude to help with?</label>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((f) => (
                <button key={f} onClick={() => toggleFocus(f)} className={`chip border ${focus.includes(f) ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300' : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300'}`}>
                  {focus.includes(f) && <Check className="w-4 h-4" />} {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Create your first workspace',
      subtitle: 'A workspace is where your tasks and projects live. You can add more later.',
      content: (
        <div className="space-y-4">
          <div>
            <label className="label">Workspace name</label>
            <input className="input" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="Personal" />
          </div>
          <div>
            <label className="label">Workspace type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'personal' as const, label: 'Personal', icon: User },
                { type: 'work' as const, label: 'Work', icon: Briefcase },
                { type: 'study' as const, label: 'Study', icon: GraduationCap },
              ].map((w) => (
                <button key={w.type} onClick={() => setWorkspaceType(w.type)} className={`chip flex-col justify-center gap-1.5 border py-4 ${workspaceType === w.type ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300'}`}>
                  <w.icon className="w-5 h-5" />
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'You’re all set',
      subtitle: 'SmartDude is ready to help you plan, focus, and automate.',
      content: (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-ink-600 dark:text-ink-300">Click finish to enter your workspace.</p>
        </div>
      ),
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-scale-in">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">SmartDude</span>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary-500' : 'bg-ink-200 dark:bg-ink-700'}`} />
            ))}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{cur.title}</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 mb-6">{cur.subtitle}</p>
          <div className="min-h-[200px]">{cur.content}</div>
          {error && <div className="mt-4 rounded-lg bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 px-3 py-2 text-sm">{error}</div>}
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {isLast ? (
              <button onClick={finish} disabled={busy} className="btn-primary">
                {busy ? 'Setting up…' : 'Finish'} {!busy && <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="btn-primary">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-6 text-ink-400">
          <Folder className="w-4 h-4" />
          <span className="text-xs">Step {step + 1} of {steps.length}</span>
        </div>
      </div>
    </div>
  );
}
