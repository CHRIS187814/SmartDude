import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PersonalContext } from '../types';
import { PERSONAL_CONTEXTS } from '../data/mockData';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('chris.abraham@bscdsaih.christuniversity.in');
  const [password, setPassword] = useState('smartdude2026');
  const [displayName, setDisplayName] = useState('Chris M.');
  const [profileType, setProfileType] = useState<PersonalContext>('professional');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegister) {
        await registerWithEmail(email, password, displayName, profileType);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle(profileType);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-card w-full max-w-md rounded-3xl border border-cyan-400/30 p-6 md:p-8 bg-slate-950/90 relative shadow-[0_0_50px_rgba(6,182,212,0.25)] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 mx-auto mb-3 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <span className="material-symbols-outlined text-[28px] font-bold">smart_toy</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">SMARTDUDE</h2>
          <p className="text-xs text-cyan-300 font-mono tracking-wider uppercase mt-0.5">AI COMPANION</p>
          <p className="text-xs text-slate-400 mt-2">
            {isRegister ? 'Create your persistent account & persona' : 'Sign in to access your persistent data'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                placeholder="e.g. Chris Evans"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1.5">Primary Persona Context</label>
              <div className="grid grid-cols-2 gap-2">
                {PERSONAL_CONTEXTS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setProfileType(c.id as PersonalContext)}
                    className={`px-2.5 py-2 rounded-xl text-left text-xs transition-all border flex items-center gap-2 ${
                      profileType === c.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
                    <span className="truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : isRegister ? (
              'Create Account & Start'
            ) : (
              'Sign In with Email'
            )}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">OR</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-cyan-400 hover:underline cursor-pointer font-medium"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};
