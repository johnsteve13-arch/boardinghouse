'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  CheckCircle2,
  Home,
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export default function LogoutPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [countdown, setCountdown] = useState(6);
  const [isPaused, setIsPaused] = useState(false);
  const [loggedOutUserRole, setLoggedOutUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Record user role before clearing for personalized sign-in links
    if (user?.role) {
      setLoggedOutUserRole(user.role);
    }
    // Perform logout
    logout();
  }, []);

  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 1) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isPaused, router]);

  return (
    <div className="min-h-[82vh] bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xl shadow-slate-900/5 text-center space-y-6">
          {/* Animated Sign-Out Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center shadow-inner">
              <LogOut className="w-9 h-9 text-emerald-600 animate-in fade-in zoom-in-75 duration-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Signed Out Successfully
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              You have been safely signed out of SEAIT Stay. Your session token and local credentials have been cleared.
            </p>
          </div>

          {/* Countdown & Progress bar */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Redirecting to homepage...</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">{countdown}s</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((6 - countdown) / 6) * 100}%` }}
              />
            </div>
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isPaused ? 'Resume auto-redirect' : 'Pause auto-redirect'}</span>
              </button>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="space-y-2 pt-2">
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Return to Homepage Now</span>
            </Link>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/login"
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  loggedOutUserRole !== 'owner'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Student Login</span>
              </Link>

              <Link
                href="/login/owner"
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  loggedOutUserRole === 'owner'
                    ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Owner Login</span>
              </Link>
            </div>
          </div>

          {/* Security Notice for Public Computers */}
          <div className="pt-4 border-t border-slate-100 flex items-start space-x-2.5 text-left text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Campus Security Tip:</strong> If using a computer in the SEAIT Library, IT Lab, or an internet cafe in Crossing Rubber, close your browser window after logging out.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
