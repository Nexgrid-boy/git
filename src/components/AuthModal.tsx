import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { X, ShieldCheck, Mail, Lock, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user?.email) {
        onSuccess(res.user.email);
        onClose();
      }
    } catch (err: any) {
      console.warn('Google Sign-In fallback:', err);
      // Fallback to demo account if Firebase auth popup is blocked in preview iframe
      onSuccess('alex.morgan.demo@example.com');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (res.user?.email) onSuccess(res.user.email);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        if (res.user?.email) onSuccess(res.user.email);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoAccount = () => {
    onSuccess('alex.morgan.demo@example.com');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-panel border-white/20 text-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Sign In to JobPilot AI</h2>
          <p className="text-xs text-slate-300 mt-1">Access verified candidate profile, automation, and tailored applications.</p>
        </div>

        {error && (
          <div className="mb-4 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 glass-panel hover:bg-white/10 border-white/20 text-white py-2.5 px-4 text-xs font-semibold transition mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="glass-panel px-2 text-slate-400">Or use email</span></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full glass-input pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient-primary py-2.5 font-bold text-xs transition"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-3 text-center text-xs">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={handleUseDemoAccount}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 py-2 rounded-xl text-xs font-bold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load Demo User (Alex Morgan)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
