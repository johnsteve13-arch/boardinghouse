'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Lock,
  Mail,
  ArrowRight,
  Building,
  Compass,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, register: authRegister } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Restore remembered email on initial load
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('seait_stay_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail.trim().toLowerCase());
        setRememberEmail(true);
      }
    } catch {
      // Ignore localStorage access issues in restricted browsers
    }
  }, []);

  const isValidEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleKeyModifier = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Automatically sanitize away whitespace and normalize to lowercase
    const val = e.target.value.replace(/\s+/g, '').toLowerCase();
    setEmail(val);
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@seaitstay.edu.ph');
    setPassword('Password123!');
    setError(null);
    setEmailTouched(true);
  };

  const handleFillDemoOwner = () => {
    setEmail('jie@gmail.com');
    setPassword('Password123!');
    setError(null);
    setEmailTouched(true);
  };

  const handleAutoRegisterOwner = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email format first (e.g. name@domain.com).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const baseName = cleanEmail.split('@')[0] || 'Owner';
      const displayName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      await authRegister({
        role: 'owner',
        fullName: `${displayName} (Property Owner)`,
        email: cleanEmail,
        password: password || 'Password123!',
        phone: '+63 917 888 5678'
      });
      router.push('/dashboard/owner');
    } catch (err: any) {
      setError(err.message || 'Auto-registration failed. Please register through the registration page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please provide a valid email format (e.g. name@domain.com).');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      // Save or clear remembered email
      try {
        if (rememberEmail && cleanEmail) {
          localStorage.setItem('seait_stay_remembered_email', cleanEmail);
        } else {
          localStorage.removeItem('seait_stay_remembered_email');
        }
      } catch {
        // Safe localStorage ignore
      }

      const loggedUser = await login(cleanEmail, password);
      if (loggedUser) {
        if (loggedUser.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/owner');
        }
      } else {
        router.push('/browse');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const isEmailFormatValid = email.length > 0 && isValidEmail(email);
  const isEmailFormatInvalid = emailTouched && email.length > 0 && !isValidEmail(email);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Notice for Tenants: Direct System Usage Without Sign-in */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-2.5 shadow-xs">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>Tenant Accommodation Finder</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong>Tenants do not need to sign in!</strong> You can freely browse boarding houses, filter within 3km of SEAIT, and contact owners directly.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <span>Explore Boarding Houses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Owner & Admin Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-card space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Owner & Admin Sign In</h1>
            <p className="text-xs text-slate-500">
              Sign in to manage your boarding houses, availability slots, and tenant inquiries
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <span className="font-bold block">Sign-in Notice</span>
                  <span className="text-rose-700 leading-relaxed">{error}</span>
                </div>
              </div>

              {error.includes('No account registered') && (
                <div className="pt-2 border-t border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/80 p-2.5 rounded-xl border border-rose-200">
                  <span className="text-[11px] text-rose-950 font-bold">
                    Need to activate this email as an Owner?
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoRegisterOwner}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Register &amp; Sign In as Owner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field with Auto-sanitize & Accuracy Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                {isEmailFormatValid && (
                  <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Valid format</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="owner@gmail.com or admin@seaitstay.edu.ph"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs text-slate-800 focus:outline-none transition-all ${
                    isEmailFormatInvalid
                      ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
              </div>
              {isEmailFormatInvalid && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  Please include &quot;@&quot; and a valid domain name (e.g. user@example.com).
                </p>
              )}
            </div>

            {/* Password Field with Eye Toggle & CapsLock Detection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-medium transition-colors"
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={handleKeyModifier}
                  onKeyUp={handleKeyModifier}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time CapsLock Warning */}
              {capsLockActive && (
                <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg animate-in fade-in">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>CapsLock is ON &mdash; Passwords are case-sensitive</span>
                </div>
              )}
            </div>

            {/* Remember Me Checkbox & Reset Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-medium">Remember email on this device</span>
              </label>
              <Link
                href="/login/owner"
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Owner Portal &rarr;
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Helper for Error-free Testing */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 flex items-center space-x-1">
                  <Home className="w-3.5 h-3.5 text-amber-700" />
                  <span>Property Owner Account</span>
                </span>
                <button
                  type="button"
                  onClick={handleFillDemoOwner}
                  className="text-[10px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg transition-colors border border-amber-300/60"
                >
                  Autofill Owner
                </button>
              </div>
              <p className="text-[10px] text-amber-700/80 font-mono">
                jie@gmail.com &bull; Password123!
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Campus Administrator Account</span>
                </span>
                <button
                  type="button"
                  onClick={handleFillDemoAdmin}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-colors"
                >
                  Autofill Admin
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                admin@seaitstay.edu.ph &bull; Password123!
              </p>
            </div>
          </div>

          <div className="pt-1 text-center text-xs text-slate-500">
            <span>Own a boarding house in Crossing Rubber? </span>
            <Link href="/register" className="font-bold text-emerald-700 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
