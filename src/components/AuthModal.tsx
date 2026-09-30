import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Lock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, registerCoordinator, quickLogin, error, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [username, setUsername] = useState('coordinator');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Coordinator first-time signup state
  const [coordinatorName, setCoordinatorName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [email, setEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const success = await login(username, password);
    if (success && onClose) {
      onClose();
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (signupPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const success = await registerCoordinator({
      coordinatorName,
      collegeName,
      collegeCode,
      email,
      username: signupUsername || email.split('@')[0],
      phone,
      password: signupPassword,
    });

    if (success && onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Subtle decorative brand banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4A0E17] via-[#6B1120] to-[#8A1A2D]" />

        {/* Brand Header */}
        <div className="text-center pt-2 pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#4A0E17] text-white shadow-md mb-3">
            <span className="font-extrabold tracking-widest text-base font-sans">INVI</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome to INVI' : 'Coordinator Setup'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Smart Examination Invigilation Platform'
              : 'Register chief coordinator & initialize institution'}
          </p>
        </div>

        {/* Error message */}
        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            First-Time Coordinator Setup
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. coordinator or staff email"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#6B1120] hover:bg-[#570E1C] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to INVI'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Switcher */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2">
                Quick Role Tester (1-Click)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await quickLogin('coordinator');
                    if (onClose) onClose();
                  }}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#6B1120]/5 hover:border-[#6B1120] text-left transition-all cursor-pointer"
                >
                  <p className="text-[10px] font-bold text-[#6B1120]">Coordinator</p>
                  <p className="text-[9px] text-slate-500 truncate">Dr. Sarah Jenkins</p>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await quickLogin('invigilator');
                    if (onClose) onClose();
                  }}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 text-left transition-all cursor-pointer"
                >
                  <p className="text-[10px] font-bold text-emerald-700">Invigilator</p>
                  <p className="text-[9px] text-slate-500 truncate">Mr. James Lewis</p>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await quickLogin('viewer');
                    if (onClose) onClose();
                  }}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-500 text-left transition-all cursor-pointer"
                >
                  <p className="text-[10px] font-bold text-indigo-700">Viewer</p>
                  <p className="text-[9px] text-slate-500 truncate">Mr. David Clark</p>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Coordinator Setup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coordinator Full Name *
              </label>
              <input
                type="text"
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institution Name *
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. St. Xavier's Institute of Engineering"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coordinator@invi.edu"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username / Login ID
              </label>
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                placeholder="coordinator"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#6B1120] hover:bg-[#570E1C] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-3"
            >
              <span>{isLoading ? 'Creating Profile...' : 'Complete Coordinator Setup'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
