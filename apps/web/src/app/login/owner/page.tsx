'use client';

import React, { useState } from 'react';
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
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  Zap,
  Users
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';

export default function OwnerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser && loggedUser.role !== 'owner') {
        setError(
          `Notice: Your account is registered as "${loggedUser.role.toUpperCase()}". This portal is specifically for Boarding House Owners.`
        );
        setTimeout(() => {
          if (loggedUser.role === 'admin') router.push('/dashboard/admin');
          else router.push('/browse');
        }, 3000);
        return;
      }
      router.push('/dashboard/owner');
    } catch (err: any) {
      setError(err.message || 'Invalid owner email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Owner Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. nanay.rosa@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Default demo: Password123!</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your owner password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Remember me on this device</span>
              </label>
              <Link
                href="/login"
                className="font-semibold text-amber-700 hover:text-amber-800"
              >
                Not an owner?
              </Link>
            </div>

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
