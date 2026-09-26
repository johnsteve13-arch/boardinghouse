'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  MapPin,
  Scale,
  Calculator,
  MessageSquare,
  Bell,
  User as UserIcon,
  Shield,
  Home,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { useCompare } from '../lib/compareContext';
import { api } from '../lib/api';
import { Notification } from '@seait-stay/types';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, switchDemoRole } = useAuth();
  const { compareIds } = useCompare();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((data) => setNotifications(data))
        .catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navLinks = [
    { label: 'Explore', href: '/browse', icon: Compass },
    { label: 'Campus Map', href: '/map', icon: MapPin },
    {
      label: 'Compare',
      href: '/compare',
      icon: Scale,
      badge: compareIds.length > 0 ? compareIds.length : null
    },
    { label: 'Budget Calculator', href: '/calculator', icon: Calculator },
    { label: 'Inquiries', href: '/inquiries', icon: MessageSquare }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  SEAIT<span className="text-emerald-600">Stay</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Tupi
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-tight">
                Find Your Place Near SEAIT
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge !== null && link.badge !== undefined && (
                    <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-emerald-800 bg-emerald-100 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Notification, Role Persona & Account */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800">Notifications</span>
                    <span className="text-xs text-slate-500">{notifications.length} total</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="p-3 hover:bg-slate-50 text-xs transition-colors">
                          <p className="font-medium text-slate-800">{n.title}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-medium text-slate-700 shadow-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    user?.role === 'admin'
                      ? 'bg-purple-500'
                      : user?.role === 'owner'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="capitalize font-semibold text-slate-800">
                  {user ? user.role : 'Student'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      Switch Role Mode
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">Test system as different users:</p>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        switchDemoRole('student');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                        user?.role === 'student'
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div>Student (Tenant)</div>
                          <div className="text-[10px] text-slate-500">Kristine Joy Alcantara</div>
                        </div>
                      </div>
                      {user?.role === 'student' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => {
                        switchDemoRole('owner');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                        user?.role === 'owner'
                          ? 'bg-amber-50 text-amber-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-amber-600" />
                        <div>
                          <div>Boarding House Owner</div>
                          <div className="text-[10px] text-slate-500">Nanay Rosa (Green Ville)</div>
                        </div>
                      </div>
                      {user?.role === 'owner' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                    </button>

                    <button
                      onClick={() => {
                        switchDemoRole('admin');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                        user?.role === 'admin'
                          ? 'bg-purple-50 text-purple-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <div>
                          <div>System Administrator</div>
                          <div className="text-[10px] text-slate-500">Engr. Danica Flores</div>
                        </div>
                      </div>
                      {user?.role === 'admin' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                    <Link
                      href={
                        user?.role === 'admin'
                          ? '/dashboard/admin'
                          : user?.role === 'owner'
                          ? '/dashboard/owner'
                          : '/dashboard/student'
                      }
                      onClick={() => setRoleDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                      <span>Go to Dashboard</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard Link / Avatar */}
            {user ? (
              <Link
                href={
                  user.role === 'admin'
                    ? '/dashboard/admin'
                    : user.role === 'owner'
                    ? '/dashboard/owner'
                    : '/dashboard/student'
                }
                className="flex items-center space-x-2 pl-1 pr-3 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors text-xs font-semibold shadow-xs"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white">
                    {user.fullName[0]}
                  </div>
                )}
                <span>Dashboard</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login/owner"
                  className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/80 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition-all flex items-center space-x-1"
                >
                  <Home className="w-3.5 h-3.5 text-amber-700" />
                  <span>Owner Portal</span>
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== null && link.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Role Switcher (Demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  switchDemoRole('student');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-2 rounded-lg text-xs font-medium text-center border ${
                  user?.role === 'student'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  switchDemoRole('owner');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-2 rounded-lg text-xs font-medium text-center border ${
                  user?.role === 'owner'
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Owner
              </button>
              <button
                onClick={() => {
                  switchDemoRole('admin');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-2 rounded-lg text-xs font-medium text-center border ${
                  user?.role === 'admin'
                    ? 'border-purple-500 bg-purple-50 text-purple-800'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={
                user?.role === 'admin'
                  ? '/dashboard/admin'
                  : user?.role === 'owner'
                  ? '/dashboard/owner'
                  : '/dashboard/student'
              }
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
