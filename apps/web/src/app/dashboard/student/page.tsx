'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User as UserIcon,
  Heart,
  MessageSquare,
  Sparkles,
  Scale,
  Calculator,
  Compass,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { BoardingHouse, Inquiry } from '@seait-stay/types';
import { api } from '../../../lib/api';
import PropertyCard from '../../../components/PropertyCard';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState<BoardingHouse[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Recommendation preference state
  const [prefBudget, setPrefBudget] = useState(2500);
  const [prefDist, setPrefDist] = useState(1000);

  useEffect(() => {
    async function loadData() {
      try {
        const [favData, inqData, recData] = await Promise.all([
          api.getFavorites(),
          api.getMyInquiries(),
          api.getRecommendations({ budget: prefBudget, maxDistanceMeters: prefDist })
        ]);
        setFavorites(favData);
        setInquiries(inqData);
        setRecommendations(recData);
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user, prefBudget, prefDist]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-slate-500">Sign in as a student to access your personal dashboard.</p>
        <Link href="/login" className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Student Profile Card Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.fullName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/30 shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white">{user.fullName}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                SEAIT Student
              </span>
            </div>
            <p className="text-xs text-emerald-100 flex items-center space-x-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{user.department || 'College of Computer Studies (BSIT)'} • {user.studentId || 'SEAIT-2022-0491'}</span>
            </p>
          </div>
        </div>

        {/* Quick Tools Links */}
        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href="/calculator"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md flex items-center space-x-1.5 transition-all"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Budget Plan</span>
          </Link>
          <Link
            href="/compare"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md flex items-center space-x-1.5 transition-all"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare Tool</span>
          </Link>
          <Link
            href="/browse"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-sm"
          >
            Search Houses
          </Link>
        </div>
      </div>

      {/* Grid: Saved Favorites & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Saved Favorites (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h2 className="text-base font-extrabold text-slate-900">
                My Saved Favorites ({favorites.length})
              </h2>
            </div>
            <Link href="/browse" className="text-xs font-semibold text-emerald-700 hover:underline">
              Browse More
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-500">You haven't saved any boarding houses yet.</p>
              <Link href="/browse" className="text-xs font-bold text-emerald-600 hover:underline">
                Explore boarding houses near SEAIT
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isFavoritedInitial={true}
                  onFavoriteChange={(id, isFav) => {
                    if (!isFav) {
                      setFavorites((prev) => prev.filter((p) => p.id !== id));
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* Smart Recommendation Engine Section (Requirement 24) */}
          <div className="pt-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Recommended For You
                </h2>
              </div>
              <span className="text-xs text-slate-400">Based on your student budget & distance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {item.matchPercentage}% Match
                    </span>
                    <span className="text-xs font-bold text-slate-900">₱{item.lowestPriceMonthly.toLocaleString()}/mo</span>
                  </div>

                  <Link href={`/boarding-houses/${item.slug}`} className="font-bold text-sm text-slate-900 hover:text-emerald-700 block">
                    {item.name}
                  </Link>

                  <div className="space-y-1">
                    {item.matchReasons?.slice(0, 3).map((reason: string, idx: number) => (
                      <p key={idx} className="text-[11px] text-slate-600 flex items-center space-x-1">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{reason}</span>
                      </p>
                    ))}
                  </div>

                  <Link
                    href={`/boarding-houses/${item.slug}`}
                    className="block text-center py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                  >
                    View Recommendation
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Inquiries Activity (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                Active Inquiries ({inquiries.length})
              </h2>
            </div>
            <Link href="/inquiries" className="text-xs font-semibold text-emerald-700 hover:underline">
              Open Inbox
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            {inquiries.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active inquiries</p>
            ) : (
              inquiries.map((inq) => (
                <Link
                  key={inq.id}
                  href="/inquiries"
                  className="block p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-xs text-slate-900 truncate">{inq.boardingHouseName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(inq.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{inq.lastMessage}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
