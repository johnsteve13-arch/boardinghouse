'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Building2,
  Zap,
  Users
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';

export default function OwnerLoginPage() {
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

  // Restore remembered email on initial mount
  useEffect(() => {
    try {
      const savedEmail =
        localStorage.getItem('seait_stay_remembered_owner_email') ||
        localStorage.getItem('seait_stay_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail.trim().toLowerCase());
        setRememberEmail(true);
      }
    } catch {
      // Safe localStorage ignore
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

  const handleFillDemoOwner = () => {
    setEmail('jie@gmail.com');
    setPassword('Password123!');
    setError(null);
    setEmailTouched(true);
  };

  const handleAutoRegisterOwner = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please provide a valid email format first.');
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
      setError(err.message || 'Auto-registration failed. Please use registration page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your owner registered email address.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please provide a valid email format (e.g. landlord@gmail.com).');
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
          localStorage.setItem('seait_stay_remembered_owner_email', cleanEmail);
          localStorage.setItem('seait_stay_remembered_email', cleanEmail);
        } else {
          localStorage.removeItem('seait_stay_remembered_owner_email');
        }
      } catch {
        // Safe localStorage ignore
      }

      const loggedUser = await login(cleanEmail, password);
      if (loggedUser && loggedUser.role !== 'owner') {
        if (loggedUser.role === 'admin') {
          router.push('/dashboard/admin');
          return;
        }
        setError(
          `Notice: Your account is registered as "${loggedUser.role.toUpperCase()}". Tenants do not require login; redirecting to explore view.`
        );
        setTimeout(() => {
          router.push('/browse');
        }, 2000);
        return;
      }
      router.push('/dashboard/owner');
    } catch (err: any) {
      setError(err.message || 'Invalid owner email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isEmailFormatValid = email.length > 0 && isValidEmail(email);
  const isEmailFormatInvalid = emailTouched && email.length > 0 && !isValidEmail(email);

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-amber-50/40 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-amber-200/80 p-8 sm:p-10 shadow-xl shadow-amber-900/5 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold tracking-wide uppercase">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              <span>SEAIT Property Owners & Landlords</span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-600/25">
              <Home className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Boarding House Owner Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Sign in to manage your Crossing Rubber listings, toggle instant room availability, update monthly rental rates, and connect with SEAIT tenants.
            </p>
          </div>

          {/* Error / Role Warning Alert */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Owner Email with instant format validation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Owner Registered Email</label>
                {isEmailFormatValid && (
                  <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Valid format</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  placeholder="e.g. landlord@gmail.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setEmailTouched(true)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all font-medium focus:outline-none focus:bg-white ${
                    isEmailFormatInvalid
                      ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                  }`}
                />
              </div>
              {isEmailFormatInvalid && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  Please enter a valid email address (e.g. landlord@example.com).
                </p>
              )}
            </div>

            {/* Password with Eye Toggle & CapsLock Detection */}
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
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your owner password"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={handleKeyModifier}
                  onKeyUp={handleKeyModifier}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
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

            {/* Remember Me and Alternate Links */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-[11px] font-medium">Remember email on this device</span>
              </label>
              <Link
                href="/login"
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800"
              >
                Admin / General Sign In &rarr;
              </Link>
            </div>

            {/* Quick Demo Pill */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 flex items-center space-x-1">
                  <Home className="w-3.5 h-3.5 text-amber-700" />
                  <span>Verified Owner Account</span>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 text-white font-bold text-sm hover:from-amber-700 hover:to-emerald-700 shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In to Owner Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Portal Highlights */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
            <div className="flex items-center space-x-2 text-[11px]">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>1-Click Availability</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct Tenant Inquiries</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Verified Owner Badge</span>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="text-center text-xs text-slate-500 space-y-2 pt-2">
            <p>
              Want to list a new boarding house near SEAIT?{' '}
              <Link href="/register" className="font-bold text-emerald-700 hover:underline">
                Register as Property Owner
              </Link>
            </p>
            <p>
              Looking for a boarding house or room?{' '}
              <Link href="/browse" className="font-semibold text-emerald-700 hover:text-emerald-800 underline">
                Browse Listings (No Account Required)
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
