import { useState } from 'react';
import { User, Palette, Bell, Clock, LogOut, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { profile, refreshProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [role, setRole] = useState(profile?.role ?? '');
  const [timezone, setTimezone] = useState(profile?.timezone ?? 'UTC');
  const [notifEnabled, setNotifEnabled] = useState(profile?.preferences?.notifications ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      full_name: fullName,
      role,
      timezone,
      preferences: { ...profile?.preferences, notifications: notifEnabled },
    }).eq('id', profile?.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-ink-500" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Student, Professional, etc." />
          </div>
          <div>
            <label className="label">Timezone</label>
            <input className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-ink-500" />
          <h2 className="font-semibold">Appearance</h2>
        </div>
        <div className="flex gap-3">
          {(['light', 'dark'] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)} className={cn('flex-1 rounded-xl border-2 p-4 transition', theme === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-ink-300')}>
              <div className={cn('w-full h-16 rounded-lg mb-2', t === 'light' ? 'bg-white border border-ink-200' : 'bg-ink-900 border border-ink-700')}>
                <div className="flex gap-1 p-2">
                  <div className={cn('w-3 h-3 rounded-full', t === 'light' ? 'bg-primary-500' : 'bg-primary-400')} />
                  <div className={cn('w-8 h-2 rounded', t === 'light' ? 'bg-ink-200' : 'bg-ink-700')} />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-medium capitalize">
                {theme === t && <Check className="w-4 h-4 text-primary-500" />} {t}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-ink-500" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="text-sm font-medium">In-app notifications</div>
            <div className="text-xs text-ink-400 mt-0.5">Receive reminders and activity updates</div>
          </div>
          <button onClick={() => setNotifEnabled(!notifEnabled)} className={cn('relative w-11 h-6 rounded-full transition', notifEnabled ? 'bg-primary-500' : 'bg-ink-300 dark:bg-ink-700')}>
            <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', notifEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
          </button>
        </label>
      </div>

      {/* Save + Sign out */}
      <div className="flex items-center justify-between">
        <button onClick={signOut} className="btn-secondary text-error-600 dark:text-error-400">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
