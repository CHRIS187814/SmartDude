import { useState } from 'react';
import { Sparkles, Brain, Calendar, Bell, Repeat, CheckCircle2, ArrowRight, Zap, Target, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Landing() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, fullName);
    setBusy(false);
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-ink-950/80 border-b border-ink-200 dark:border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SmartDude</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMode('signin')} className="btn-ghost">Sign in</button>
            <button onClick={() => setMode('signup')} className="btn-primary">Get started</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-300 mb-6">
              <Zap className="w-4 h-4" />
              AI Action Companion
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              The AI companion that{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">actually gets things done</span>
            </h1>
            <p className="mt-6 text-lg text-ink-600 dark:text-ink-300 leading-relaxed max-w-xl">
              SmartDude understands your personal and workspace context, then helps you plan, schedule, remind, and automate — so you spend less time organizing and more time doing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
                <CheckCircle2 className="w-4 h-4 text-accent-500" /> No credit card needed
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
                <CheckCircle2 className="w-4 h-4 text-accent-500" /> Free to start
              </div>
            </div>
          </div>

          {/* Auth card */}
          <div className="animate-scale-in">
            <div className="card p-6 sm:p-8 max-w-md mx-auto">
              <div className="flex gap-1 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl mb-6">
                <button
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'signin' ? 'bg-white dark:bg-ink-900 shadow text-ink-900 dark:text-ink-100' : 'text-ink-500'}`}
                >Sign in</button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'signup' ? 'bg-white dark:bg-ink-900 shadow text-ink-900 dark:text-ink-100' : 'text-ink-500'}`}
                >Create account</button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="label">Full name</label>
                    <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Rivera" required />
                  </div>
                )}
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                </div>
                {error && (
                  <div className="rounded-lg bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 px-3 py-2 text-sm">{error}</div>
                )}
                <button type="submit" disabled={busy} className="btn-primary w-full">
                  {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
                  {!busy && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <p className="mt-4 text-center text-xs text-ink-400">
                By continuing you agree to use SmartDude responsibly.
              </p>
            </div>
          </div>
        </section>

        {/* Loop */}
        <section className="py-16 border-t border-ink-200 dark:border-ink-800">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">The SmartDude loop</h2>
            <p className="mt-3 text-ink-500 dark:text-ink-400">Understand → Plan → Confirm → Execute → Remind → Automate</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Brain, label: 'Understand', color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
              { icon: Target, label: 'Plan', color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/30' },
              { icon: CheckCircle2, label: 'Confirm', color: 'text-warning-600 bg-warning-50 dark:bg-warning-900/30' },
              { icon: Zap, label: 'Execute', color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
              { icon: Bell, label: 'Remind', color: 'text-error-600 bg-error-50 dark:bg-error-900/30' },
              { icon: Repeat, label: 'Automate', color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/30' },
            ].map((s, i) => (
              <div key={s.label} className="card p-5 text-center card-hover">
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-3`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-xs text-ink-400 mt-0.5">Step {i + 1}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-ink-200 dark:border-ink-800">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'Context-aware AI', desc: 'SmartDude knows your tasks, projects, schedule, and personal context — so its suggestions actually fit your day.' },
              { icon: Calendar, title: 'Plan & schedule', desc: 'Ask for a focus plan, prioritize your day, or schedule reminders in plain English. Confirm before anything happens.' },
              { icon: Repeat, title: 'Automate the repeat', desc: 'Set recurring automations that run on a schedule. SmartDude creates tasks and reminders for you, every time.' },
            ].map((f) => (
              <div key={f.title} className="card p-6 card-hover">
                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-ink-200 dark:border-ink-800 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Start with SmartDude today</h2>
          <p className="mt-3 text-ink-500 dark:text-ink-400">It takes less than a minute to set up your workspace.</p>
          <button onClick={() => setMode('signup')} className="btn-primary mt-6 text-base px-6 py-3">
            Create your free account <ArrowRight className="w-5 h-5" />
          </button>
          <div className="mt-12 flex items-center justify-center gap-8 text-ink-400">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Built for focus. Made for action.</span>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200 dark:border-ink-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-ink-400">
          SmartDude — Your context-aware AI action companion.
        </div>
      </footer>
    </div>
  );
}
