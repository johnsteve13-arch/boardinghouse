'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Building,
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const isValidEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleKeyModifier = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s+/g, '').toLowerCase();
    setEmail(val);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName) {
      setError('Please provide your full legal or business name.');
      return;
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please provide a valid email address (e.g. owner@domain.com).');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        role: 'owner',
        fullName: cleanName,
        email: cleanEmail,
        password,
        phone: phone.trim()
      };

      await register(payload);
      router.push('/dashboard/owner');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isEmailFormatValid = email.length > 0 && isValidEmail(email);
  const isEmailFormatInvalid = emailTouched && email.length > 0 && !isValidEmail(email);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Notice for Tenants: No Need to Register */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-2.5 shadow-xs">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>Looking for a Boarding House?</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong>Tenants do not need to register!</strong> You can immediately explore listings, compare rates, check campus walking distance, and message owners directly.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <span>Explore Boarding Houses Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Owner Registration Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-card space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Register as Property Owner
            </h1>
            <p className="text-xs text-slate-500">
              Create an owner account to list and manage your boarding houses in Crossing Rubber, Tupi
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Registration Incomplete</span>
                <span className="text-rose-700 leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Owner Full Name *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maria Santos (Landlord)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
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
                  placeholder="owner@gmail.com"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs text-slate-800 focus:outline-none transition-all ${
                    isEmailFormatInvalid
                      ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
              </div>
              {isEmailFormatInvalid && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  Please enter a valid email format (e.g. owner@example.com).
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone / Contact Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 9xx xxx xxxx"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password (min. 6 characters) *</label>
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
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyModifier}
                  onKeyUp={handleKeyModifier}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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

              {capsLockActive && (
                <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg animate-in fade-in">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>CapsLock is ON &mdash; Passwords are case-sensitive</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Creating Owner Account...' : 'Register as Owner'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Already have an owner account? </span>
            <Link href="/login/owner" className="font-bold text-emerald-700 hover:underline">
              Owner Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
